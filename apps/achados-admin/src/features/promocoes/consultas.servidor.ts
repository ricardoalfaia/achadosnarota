import "server-only";

import { andThen, AppErrors, Err, Ok, type Result } from "@achados/core";
import type { Offer } from "@achados/db";

import { idDoRegistro } from "@/shared/cadastro/id.servidor";
import {
  bancoEmMemoria,
  latenciaSimulada,
} from "@/shared/provisorio/banco-em-memoria.servidor";
import { guardaDosDadosProvisorios } from "@/shared/provisorio/guarda";
import type { CasaDaPromocao, Promocao, PromocaoDaLista } from "./domain/tipos";

// Leituras de promoções, só servidor, em Result. PROVISÓRIO: fonte em
// memória; com o banco, consultas do @achados/db no escopo da equipe (e, no
// painel do parceiro, no escopo do parceiro).

const data = (valor: Date | null) =>
  valor ? valor.toISOString().slice(0, 10) : null;

export async function listarPromocoes(): Promise<Result<PromocaoDaLista[]>> {
  const guarda = guardaDosDadosProvisorios();
  if (!guarda.ok) return guarda;
  await latenciaSimulada();

  const banco = bancoEmMemoria();
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
  const guarda = guardaDosDadosProvisorios();
  if (!guarda.ok) return guarda;
  await latenciaSimulada();
  return andThen(idDoRegistro("Promocao", entrada), (id) => {
    const oferta = bancoEmMemoria().offer.find((o) => o.id === id);
    return oferta
      ? Ok(promocaoDaLinha(oferta))
      : Err(AppErrors.notFound("Promocao", id));
  });
}

/** As casas que podem receber promoção: todas, menos as arquivadas. */
export async function casasParaPromocao(): Promise<Result<CasaDaPromocao[]>> {
  const guarda = guardaDosDadosProvisorios();
  if (!guarda.ok) return guarda;
  return Ok(
    bancoEmMemoria()
      .place.filter((p) => p.status !== "archived")
      .map((p) => ({
        id: p.id,
        nome: p.name,
        publicada: p.status === "published",
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
  );
}
