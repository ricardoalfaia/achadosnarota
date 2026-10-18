"use server";

import {
  AppErrors,
  Err,
  Ok,
  toActionResult,
  type ActionResult,
  type Result,
} from "@achados/core";
import { novoId, type Offer } from "@achados/db";

import { idDoRegistro } from "@/shared/cadastro/id.servidor";
import {
  bancoEmMemoria,
  latenciaSimulada,
} from "@/shared/provisorio/banco-em-memoria.servidor";
import { guardaDosDadosProvisorios } from "@/shared/provisorio/guarda";
import { lerDadosDaPromocao } from "./domain/validacao";

/**
 * Inclui (`id` nulo) ou altera uma promoção. Quem confere se a casa está
 * publicada é o servidor, pela fonte, nunca o que o navegador disse.
 *
 * PROVISÓRIO: grava na fonte em memória. Com o banco, grava pelo @achados/db
 * com o papel da equipe conferido a cada pedido e registro em audit_events.
 */
export async function salvarPromocao(
  id: unknown,
  dados: unknown
): Promise<ActionResult<{ id: string }>> {
  return toActionResult(await gravar(id, dados));
}

async function gravar(
  entradaId: unknown,
  entrada: unknown
): Promise<Result<{ id: string }>> {
  const guarda = guardaDosDadosProvisorios();
  if (!guarda.ok) return guarda;
  await latenciaSimulada(500);

  const banco = bancoEmMemoria();
  let atual: Offer | undefined;
  if (entradaId !== null) {
    const id = idDoRegistro("Promocao", entradaId);
    if (!id.ok) return id;
    atual = banco.offer.find((o) => o.id === id.value);
    if (!atual) return Err(AppErrors.notFound("Promocao", id.value));
  }

  const dados = lerDadosDaPromocao(entrada, {
    casaPublicada: (casaId) =>
      banco.place.some((p) => p.id === casaId && p.status === "published"),
  });
  if (!dados.ok) return dados;
  const d = dados.value;
  if (!banco.place.some((p) => p.id === d.casaId && p.status !== "archived"))
    return Err(AppErrors.validation("CASA_DESCONHECIDA", "Casa inválida."));

  const linha = {
    placeId: d.casaId,
    title: d.titulo,
    terms: d.termos,
    kind: d.tipo,
    icon: d.icone,
    limitPerUser: d.periodoDeUso === "unlimited" ? 1 : d.limitePorAssinante,
    usagePeriod: d.periodoDeUso,
    validFrom: d.vigencia
      ? new Date(`${d.vigencia.inicio}T00:00:00-03:00`)
      : null,
    validUntil: d.vigencia
      ? new Date(`${d.vigencia.fim}T23:59:59-03:00`)
      : null,
    status: d.status,
    updatedAt: new Date(),
  };

  if (atual) {
    Object.assign(atual, linha);
    return Ok({ id: atual.id });
  }
  const nova: Offer = {
    ...linha,
    id: novoId(),
    position: 0,
    createdAt: linha.updatedAt,
  };
  banco.offer.push(nova);
  return Ok({ id: nova.id });
}
