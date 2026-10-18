import "server-only";

import { Ok, type Result } from "@achados/core";
import { offers, places, redemptions, users } from "@achados/db";
import { and, asc, desc, eq, gte, lt, ne } from "drizzle-orm";

import { naEquipe } from "@/shared/db/equipe.servidor";
import {
  indicadores,
  intervaloDoPeriodo,
  mapaDeCalor,
  ranking,
  seriePorDia,
  type Indicadores,
  type LinhaDeResgate,
  type Periodo,
} from "./domain/relatorio";

// O relatório de resgates, no escopo da equipe: a RLS só deixa administração
// e comercial lerem `redemption` (o curador recebe vazio). O assinante sai só
// como id opaco, para contar pessoas, e não chega à tela.

export type RelatorioDeResgates = {
  periodo: Periodo;
  indicadores: Indicadores;
  serie: { dia: string; usados: number }[];
  calor: number[][];
  casas: { nome: string; usados: number }[];
  beneficios: { nome: string; usados: number }[];
  /** Os últimos usos confirmados, sem o assinante. */
  recentes: Omit<LinhaDeResgate, "assinante">[];
  opcoesDeCasa: { id: string; nome: string }[];
};

async function linhasDoIntervalo(
  tx: Parameters<Parameters<typeof naEquipe>[0]>[0],
  inicio: Date,
  fim: Date,
  casaId: string | null
): Promise<LinhaDeResgate[]> {
  const linhas = await tx
    .select({
      id: redemptions.id,
      situacao: redemptions.status,
      geradoEm: redemptions.createdAt,
      usadoEm: redemptions.redeemedAt,
      casaId: redemptions.placeId,
      casa: places.name,
      beneficio: offers.title,
      assinante: redemptions.userId,
      operador: users.name,
    })
    .from(redemptions)
    .innerJoin(places, eq(places.id, redemptions.placeId))
    .innerJoin(offers, eq(offers.id, redemptions.offerId))
    .leftJoin(users, eq(users.id, redemptions.operatorId))
    .where(
      and(
        gte(redemptions.createdAt, inicio),
        lt(redemptions.createdAt, fim),
        // Código cancelado (gerou outro) não conta como tentativa.
        ne(redemptions.status, "voided"),
        casaId ? eq(redemptions.placeId, casaId) : undefined
      )
    )
    .orderBy(desc(redemptions.createdAt));
  return linhas.map((l) => ({
    ...l,
    geradoEm: l.geradoEm.toISOString(),
    usadoEm: l.usadoEm?.toISOString() ?? null,
  }));
}

export async function relatorioDeResgates({
  periodo,
  casaId,
  agora = new Date(),
}: {
  periodo: Periodo;
  casaId: string | null;
  agora?: Date;
}): Promise<Result<RelatorioDeResgates>> {
  const intervalo = intervaloDoPeriodo(periodo, agora);
  return naEquipe(async (tx) => {
    const [atuais, anteriores, casas] = await Promise.all([
      linhasDoIntervalo(tx, intervalo.inicio, intervalo.fim, casaId),
      linhasDoIntervalo(
        tx,
        intervalo.anteriorInicio,
        intervalo.anteriorFim,
        casaId
      ),
      tx
        .select({ id: places.id, nome: places.name })
        .from(places)
        .where(ne(places.status, "archived"))
        .orderBy(asc(places.name)),
    ]);
    return Ok({
      periodo,
      indicadores: indicadores(atuais, anteriores),
      serie: seriePorDia(atuais, intervalo.inicio, intervalo.fim),
      calor: mapaDeCalor(atuais),
      casas: ranking(atuais, "casa"),
      beneficios: ranking(atuais, "beneficio"),
      recentes: atuais
        .filter((l) => l.situacao === "redeemed")
        .slice(0, 12)
        .map((l) => ({
          id: l.id,
          situacao: l.situacao,
          geradoEm: l.geradoEm,
          usadoEm: l.usadoEm,
          casaId: l.casaId,
          casa: l.casa,
          beneficio: l.beneficio,
          operador: l.operador,
        })),
      opcoesDeCasa: casas,
    });
  });
}

/** Todas as linhas do período, para o CSV (sem o assinante). */
export async function linhasParaExportar({
  periodo,
  casaId,
  agora = new Date(),
}: {
  periodo: Periodo;
  casaId: string | null;
  agora?: Date;
}): Promise<Result<LinhaDeResgate[]>> {
  const { inicio, fim } = intervaloDoPeriodo(periodo, agora);
  return naEquipe(async (tx) =>
    Ok(await linhasDoIntervalo(tx, inicio, fim, casaId))
  );
}
