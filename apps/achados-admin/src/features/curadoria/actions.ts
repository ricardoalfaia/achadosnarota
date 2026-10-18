"use server";

import {
  AppErrors,
  Err,
  Ok,
  toActionResult,
  type ActionResult,
  type Result,
} from "@achados/core";
import {
  editorialReviews,
  novoId,
  places,
  type EditorialReview,
} from "@achados/db";
import { and, eq, ne } from "drizzle-orm";

import { idDoRegistro } from "@/shared/cadastro/id.servidor";
import { auditar, naEquipe, semPermissao } from "@/shared/db/equipe.servidor";
import { lerNota, media, notasAvaliadas } from "./domain/criterios";
import { lerDadosDaAvaliacao } from "./domain/validacao";

/**
 * Inclui ou altera uma avaliação. A nota geral é calculada aqui, pela média
 * dos critérios: não vem do navegador. Publicar substitui a publicação
 * anterior da mesma casa (uma vigente por casa, como no banco).
 *
 * Grava no escopo da equipe: só administração e curadoria escrevem a
 * curadoria (RLS). Cada mudança fica em `audit_event`. Pendente: revisor
 * distinto do autor na publicação (docs/produto/03).
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
  let id: string | null = null;
  if (entradaId !== null) {
    const lido = idDoRegistro("Avaliacao", entradaId);
    if (!lido.ok) return lido;
    id = lido.value;
  }
  const hoje = new Date().toISOString().slice(0, 10);
  const dados = lerDadosDaAvaliacao(entrada, hoje);
  if (!dados.ok) return dados;
  const d = dados.value;

  return naEquipe(async (tx, pessoa) => {
    const [atual] = id
      ? await tx
          .select()
          .from(editorialReviews)
          .where(eq(editorialReviews.id, id))
          .limit(1)
      : [];
    if (id && !atual) return Err(AppErrors.notFound("Avaliacao", id));
    const [casa] = await tx
      .select({ id: places.id })
      .from(places)
      .where(and(eq(places.id, d.casaId), ne(places.status, "archived")));
    if (!casa)
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

    // Uma avaliação vigente por casa: publicar substitui a anterior, antes
    // da gravação, por causa do índice único do banco.
    if (d.status === "published")
      await tx
        .update(editorialReviews)
        .set({ status: "superseded", updatedAt: agora })
        .where(
          and(
            eq(editorialReviews.placeId, d.casaId),
            eq(editorialReviews.status, "published"),
            atual ? ne(editorialReviews.id, atual.id) : undefined
          )
        );

    const avaliacaoId = atual?.id ?? novoId();
    if (atual) {
      const alteradas = await tx
        .update(editorialReviews)
        .set(linha)
        .where(eq(editorialReviews.id, atual.id))
        .returning({ id: editorialReviews.id });
      if (alteradas.length === 0) return semPermissao("a curadoria");
    } else
      await tx.insert(editorialReviews).values({ ...linha, id: avaliacaoId });
    await auditar(tx, pessoa, {
      acao: atual ? `curadoria.${d.status}` : "curadoria.criada",
      entidade: "editorial_review",
      entidadeId: avaliacaoId,
      detalhes: { situacao: d.status, casa: d.casaId },
    });
    return Ok({ id: avaliacaoId });
  });
}
