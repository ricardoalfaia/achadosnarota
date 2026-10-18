import { createHash } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";

import type { Db } from "./client";
import { novoId } from "./id";
import * as s from "./schema";

// Histórico SINTÉTICO de resgates para o relatório do painel ter o que
// mostrar no desenvolvimento e na homologação: viajantes fictícios, 90 dias de
// uso respeitando a regra de cada benefício (uma vez no ano, toda semana) e
// alguns códigos que expiraram sem uso. Determinístico (mesma semente, mesmo
// histórico) e refeito a cada seed. Nunca roda em produção (trava do seed).

const VIAJANTES = [
  "Lia Andarilha",
  "Otto Mochileiro",
  "Rosa Estradeira",
  "Davi Caminhante",
  "Nina Viajante",
  "Caio Serrano",
  "Bia Litorânea",
  "Teo Carona",
] as const;

const DIAS = 90;
const HORA_EM_MS = 60 * 60 * 1000;
const DIA_EM_MS = 24 * HORA_EM_MS;

/** mulberry32: aleatório reproduzível a partir de uma semente. */
function sorteador(semente: number) {
  let a = semente;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Um horário plausível no dia (almoço, tarde ou noite), em Brasília. */
function momentoNoDia(base: Date, aleatorio: () => number): Date {
  const faixas = [
    [11.5, 14.5],
    [15, 18],
    [19, 22.5],
  ] as const;
  const [inicio, fim] = faixas[Math.floor(aleatorio() * faixas.length)]!;
  const hora = inicio + aleatorio() * (fim - inicio);
  // Meia-noite de Brasília é 03:00 UTC.
  const meiaNoite = Date.UTC(
    base.getUTCFullYear(),
    base.getUTCMonth(),
    base.getUTCDate(),
    3
  );
  return new Date(meiaNoite + hora * HORA_EM_MS);
}

export async function semearHistoricoDeResgates(
  db: Db,
  planId: string,
  slugsDasCasas: readonly string[]
): Promise<number> {
  const aleatorio = sorteador(20261018);
  const agora = Date.now();

  // Viajantes fictícios com passaporte vigente desde antes da janela.
  const viajantes: { id: string; assinatura: string }[] = [];
  for (const [i, nome] of VIAJANTES.entries()) {
    const email = `viajante.${i + 1}@achados.local`;
    let [usuario] = await db
      .select({ id: s.users.id })
      .from(s.users)
      .where(eq(s.users.email, email));
    if (!usuario) {
      usuario = { id: novoId() };
      await db
        .insert(s.users)
        .values({ id: usuario.id, name: nome, email, emailVerified: true });
    }
    let [assinatura] = await db
      .select({ id: s.subscriptions.id })
      .from(s.subscriptions)
      .where(
        and(
          eq(s.subscriptions.userId, usuario.id),
          eq(s.subscriptions.status, "active")
        )
      );
    if (!assinatura) {
      assinatura = { id: novoId() };
      await db.insert(s.subscriptions).values({
        id: assinatura.id,
        userId: usuario.id,
        planId,
        status: "active",
        providerSubscriptionId: `seed_viajante_${i + 1}`,
        startsAt: new Date(agora - 150 * DIA_EM_MS),
        endsAt: new Date(agora + 215 * DIA_EM_MS),
      });
    }
    viajantes.push({ id: usuario.id, assinatura: assinatura.id });
  }

  const ofertas = await db
    .select({
      id: s.offers.id,
      placeId: s.offers.placeId,
      periodo: s.offers.usagePeriod,
    })
    .from(s.offers)
    .innerJoin(s.places, eq(s.places.id, s.offers.placeId))
    .where(inArray(s.places.slug, [...slugsDasCasas]));
  const operadores = await db
    .select({
      userId: s.partnerOperators.userId,
      placeId: s.partnerOperators.placeId,
    })
    .from(s.partnerOperators);
  const operadorDa = new Map(operadores.map((o) => [o.placeId, o.userId]));

  const linhas: (typeof s.redemptions.$inferInsert)[] = [];
  const emitir = (
    viajante: (typeof viajantes)[number],
    oferta: (typeof ofertas)[number],
    momento: Date,
    usado: boolean
  ) => {
    linhas.push({
      id: novoId(),
      userId: viajante.id,
      offerId: oferta.id,
      placeId: oferta.placeId,
      subscriptionId: viajante.assinatura,
      tokenHash: createHash("sha256")
        .update(`seed-${linhas.length}-${aleatorio()}`)
        .digest("hex"),
      status: usado ? "redeemed" : "expired",
      expiresAt: new Date(momento.getTime() + 10 * 60 * 1000),
      redeemedAt: usado ? new Date(momento.getTime() + 3 * 60 * 1000) : null,
      operatorId: usado ? (operadorDa.get(oferta.placeId) ?? null) : null,
      createdAt: momento,
      updatedAt: momento,
    });
  };

  for (const viajante of viajantes)
    for (const oferta of ofertas) {
      if (oferta.periodo === "week") {
        // Benefício semanal: em parte das semanas, um uso.
        for (let semana = 0; semana < DIAS / 7; semana++)
          if (aleatorio() < 0.45) {
            const dia = new Date(
              agora - (semana * 7 + Math.floor(aleatorio() * 7)) * DIA_EM_MS
            );
            emitir(viajante, oferta, momentoNoDia(dia, aleatorio), true);
          }
      } else if (aleatorio() < 0.65) {
        // Uma vez no ano (ou no mês): no máximo um uso na janela.
        const dia = new Date(
          agora - Math.floor(aleatorio() * DIAS) * DIA_EM_MS
        );
        emitir(viajante, oferta, momentoNoDia(dia, aleatorio), true);
      }
      // Às vezes o código é gerado e não usado.
      if (aleatorio() < 0.12) {
        const dia = new Date(
          agora - Math.floor(aleatorio() * DIAS) * DIA_EM_MS
        );
        emitir(viajante, oferta, momentoNoDia(dia, aleatorio), false);
      }
    }

  // Nada no futuro: o "hoje" pode cair depois da hora atual.
  const passadas = linhas.filter(
    (linha) => (linha.createdAt as Date).getTime() < agora - 15 * 60 * 1000
  );
  for (let i = 0; i < passadas.length; i += 200)
    await db.insert(s.redemptions).values(passadas.slice(i, i + 200));
  return passadas.length;
}
