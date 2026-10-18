import "server-only";

import { AppErrors, Err, Ok, type Result } from "@achados/core";
import type { Offer } from "@achados/db";

import { idDoRegistro } from "@/shared/cadastro/id.servidor";
import { naEquipe, tabelasDaEquipe } from "@/shared/db/equipe.servidor";
import type { CasaDaPromocao, Promocao, PromocaoDaLista } from "./domain/tipos";

// Leituras de promoções, só servidor, em Result, no escopo da equipe. Só
// administração e comercial gravam promoções (RLS).

const data = (valor: Date | null) =>
  valor ? valor.toISOString().slice(0, 10) : null;

export async function listarPromocoes(): Promise<Result<PromocaoDaLista[]>> {
  return naEquipe(async (tx) => {
    const banco = await tabelasDaEquipe(tx);
    const casas = new Map(banco.place.map((p) => [p.id, p.name]));
    return Ok(
      banco.offer
        .map((o): PromocaoDaLista => ({
          id: o.id,
          titulo: o.title,
          casaId: o.placeId,
          casa: casas.get(o.placeId) ?? "",
          tipo: o.kind,
          status: o.status,
          limitePorAssinante: o.limitPerUser,
          periodoDeUso: o.usagePeriod,
          validaDe: data(o.validFrom),
          validaAte: data(o.validUntil),
          atualizadaEm: o.updatedAt.toISOString(),
        }))
        .sort((a, b) => b.atualizadaEm.localeCompare(a.atualizadaEm))
    );
  });
}

function promocaoDaLinha(o: Offer): Promocao {
  const de = data(o.validFrom);
  const ate = data(o.validUntil);
  return {
    id: o.id,
    casaId: o.placeId,
    titulo: o.title,
    termos: o.terms,
    tipo: o.kind,
    icone: o.icon,
    limitePorAssinante: o.limitPerUser,
    periodoDeUso: o.usagePeriod,
    vigencia: de && ate ? { inicio: de, fim: ate } : null,
    status: o.status,
    atualizadaEm: o.updatedAt.toISOString(),
  };
}

export async function lerPromocao(entrada: unknown): Promise<Result<Promocao>> {
  const id = idDoRegistro("Promocao", entrada);
  if (!id.ok) return id;
  return naEquipe(async (tx) => {
    const oferta = (await tabelasDaEquipe(tx)).offer.find(
      (o) => o.id === id.value
    );
    return oferta
      ? Ok(promocaoDaLinha(oferta))
      : Err(AppErrors.notFound("Promocao", id.value));
  });
}

/** As casas que podem receber promoção: todas, menos as arquivadas. */
export async function casasParaPromocao(): Promise<Result<CasaDaPromocao[]>> {
  return naEquipe(async (tx) =>
    Ok(
      (await tabelasDaEquipe(tx)).place
        .filter((p) => p.status !== "archived")
        .map((p) => ({
          id: p.id,
          nome: p.name,
          publicada: p.status === "published",
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
    )
  );
}
