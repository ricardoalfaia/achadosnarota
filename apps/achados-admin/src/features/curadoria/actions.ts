"use server";

import {
  AppErrors,
  Err,
  Ok,
  toActionResult,
  type ActionResult,
  type Result,
} from "@achados/core";
import { novoId, type EditorialReview } from "@achados/db";

import { idDoRegistro } from "@/shared/cadastro/id.servidor";
import {
  bancoEmMemoria,
  latenciaSimulada,
} from "@/shared/provisorio/banco-em-memoria.servidor";
import { guardaDosDadosProvisorios } from "@/shared/provisorio/guarda";
import { lerNota, media, notasAvaliadas } from "./domain/criterios";
import { lerDadosDaAvaliacao } from "./domain/validacao";

/**
 * Inclui ou altera uma avaliação. A nota geral é calculada aqui, pela média
 * dos critérios: não vem do navegador. Publicar substitui a publicação
 * anterior da mesma casa (uma vigente por casa, como no banco).
 *
 * PROVISÓRIO: fonte em memória. Com o banco: só curador, revisor distinto do
 * autor quando possível e registro em audit_events (docs/produto/03).
 */
export async function salvarAvaliacao(
  id: unknown,
  dados: unknown
): Promise<ActionResult<{ id: string }>> {
  return toActionResult(await gravar(id, dados));
}

const notaParaOBanco = (texto: string) => {
  const valor = lerNota(texto);
  return valor === null ? null : valor.toFixed(1);
};

async function gravar(
  entradaId: unknown,
  entrada: unknown
): Promise<Result<{ id: string }>> {
  const guarda = guardaDosDadosProvisorios();
  if (!guarda.ok) return guarda;
  await latenciaSimulada(500);

  const banco = bancoEmMemoria();
  let atual: EditorialReview | undefined;
  if (entradaId !== null) {
    const id = idDoRegistro("Avaliacao", entradaId);
    if (!id.ok) return id;
    atual = banco.editorial_review.find((r) => r.id === id.value);
    if (!atual) return Err(AppErrors.notFound("Avaliacao", id.value));
  }

  const hoje = new Date().toISOString().slice(0, 10);
  const dados = lerDadosDaAvaliacao(entrada, hoje);
  if (!dados.ok) return dados;
  const d = dados.value;
  if (!banco.place.some((p) => p.id === d.casaId && p.status !== "archived"))
    return Err(AppErrors.validation("CASA_DESCONHECIDA", "Casa inválida."));

  const agora = new Date();
  const linha: Omit<EditorialReview, "id" | "createdAt"> = {
    placeId: d.casaId,
    score: (media(notasAvaliadas(d.notas)) ?? 0).toFixed(1),
    summary: d.parecer,
    caveats: d.ressalvas || null,
    hygiene: notaParaOBanco(d.notas.hygiene),
    presentation: notaParaOBanco(d.notas.presentation),
    flavor: notaParaOBanco(d.notas.flavor),
    sophistication: notaParaOBanco(d.notas.sophistication),
    service: notaParaOBanco(d.notas.service),
    ambience: notaParaOBanco(d.notas.ambience),
    value: notaParaOBanco(d.notas.value),
    highlight: d.achado || null,
    tips: d.dicas
      .split("\n")
      .map((dica) => dica.trim())
      .filter(Boolean),
    visitedOn: d.visitadaEm,
    seal: d.selo,
    status: d.status,
    publishedAt:
      d.status === "published" ? (atual?.publishedAt ?? agora) : null,
    updatedAt: agora,
  };

  if (d.status === "published")
    for (const outra of banco.editorial_review)
      if (
        outra.placeId === d.casaId &&
        outra.status === "published" &&
        outra.id !== atual?.id
      )
        Object.assign(outra, { status: "superseded", updatedAt: agora });

  if (atual) {
    Object.assign(atual, linha);
    return Ok({ id: atual.id });
  }
  const nova: EditorialReview = { ...linha, id: novoId(), createdAt: agora };
  banco.editorial_review.push(nova);
  return Ok({ id: nova.id });
}
