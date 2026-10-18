"use server";

import {
  AppErrors,
  Err,
  Ok,
  toActionResult,
  type ActionResult,
  type Result,
} from "@achados/core";
import { categories, cities, novoId, placeMedia, places } from "@achados/db";
import { and, count, eq, ne } from "drizzle-orm";

import { idDoRegistro } from "@/shared/cadastro/id.servidor";
import { auditar, naEquipe, semPermissao } from "@/shared/db/equipe.servidor";
import { lerDadosDaCasa, SLUG_EM_USO } from "./domain/validacao";

/**
 * Inclui (`id` nulo) ou altera uma casa (ADR-0006: comando por Action). O
 * servidor valida de novo; a validação do formulário é só conveniência. Grava
 * no escopo da pessoa da equipe: só administração e curadoria escrevem casas
 * (RLS), e cada mudança fica em `audit_event`, com os nomes dos campos.
 */
export async function salvarCasa(
  id: unknown,
  dados: unknown
): Promise<ActionResult<{ id: string }>> {
  return toActionResult(await gravar(id, dados));
}

async function gravar(
  entradaId: unknown,
  entrada: unknown
): Promise<Result<{ id: string }>> {
  let id: string | null = null;
  if (entradaId !== null) {
    const lido = idDoRegistro("Casa", entradaId);
    if (!lido.ok) return lido;
    id = lido.value;
  }

  return naEquipe(async (tx, pessoa) => {
    const [atual] = id
      ? await tx.select().from(places).where(eq(places.id, id)).limit(1)
      : [];
    if (id && !atual) return Err(AppErrors.notFound("Casa", id));

    const [fotos] = atual
      ? await tx
          .select({ total: count() })
          .from(placeMedia)
          .where(eq(placeMedia.placeId, atual.id))
      : [{ total: 0 }];
    const dados = lerDadosDaCasa(entrada, fotos?.total ?? 0);
    if (!dados.ok) return dados;
    const d = dados.value;

    const [cidade] = await tx
      .select({ id: cities.id })
      .from(cities)
      .where(eq(cities.id, d.cidadeId));
    if (!cidade)
      return Err(
        AppErrors.validation("CIDADE_DESCONHECIDA", "Cidade inválida.")
      );
    const [categoria] = await tx
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, d.categoriaId));
    if (!categoria)
      return Err(
        AppErrors.validation("CATEGORIA_DESCONHECIDA", "Categoria inválida.")
      );
    const [mesmoSlug] = await tx
      .select({ id: places.id })
      .from(places)
      .where(
        and(
          eq(places.slug, d.slug),
          atual ? ne(places.id, atual.id) : undefined
        )
      )
      .limit(1);
    if (mesmoSlug)
      return Err(
        AppErrors.conflict(SLUG_EM_USO, "Outra casa já usa este endereço.", {
          pendencias: [
            { campo: "slug", secao: "dados", motivo: "Endereço já usado" },
          ],
        })
      );

    const agora = new Date();
    const linha = {
      cityId: d.cidadeId,
      categoryId: d.categoriaId,
      slug: d.slug,
      name: d.nome,
      specialty: d.especialidade,
      summary: d.resumo,
      description: d.descricao || null,
      tags: [...d.tags],
      address: d.endereco || null,
      phone: d.telefone || null,
      website: d.site || null,
      status: d.status,
      publishedAt:
        d.status === "published" ? (atual?.publishedAt ?? agora) : null,
      updatedAt: agora,
    };

    if (atual) {
      const alteradas = await tx
        .update(places)
        .set(linha)
        .where(eq(places.id, atual.id))
        .returning({ id: places.id });
      if (alteradas.length === 0) return semPermissao("casas");
      await auditar(tx, pessoa, {
        acao: atual.status !== d.status ? `casa.${d.status}` : "casa.alterada",
        entidade: "place",
        entidadeId: atual.id,
        detalhes: { situacao: d.status },
      });
      return Ok({ id: atual.id });
    }
    const novaId = novoId();
    await tx.insert(places).values({ ...linha, id: novaId });
    await auditar(tx, pessoa, {
      acao: "casa.criada",
      entidade: "place",
      entidadeId: novaId,
      detalhes: { situacao: d.status },
    });
    return Ok({ id: novaId });
  });
}
