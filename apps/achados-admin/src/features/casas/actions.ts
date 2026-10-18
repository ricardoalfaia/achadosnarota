"use server";

import {
  AppErrors,
  Err,
  Ok,
  toActionResult,
  type ActionResult,
  type Result,
} from "@achados/core";
import { novoId } from "@achados/db";

import { idDoRegistro } from "@/shared/cadastro/id.servidor";
import {
  bancoEmMemoria,
  latenciaSimulada,
} from "@/shared/provisorio/banco-em-memoria.servidor";
import { guardaDosDadosProvisorios } from "@/shared/provisorio/guarda";
import { lerDadosDaCasa, SLUG_EM_USO } from "./domain/validacao";

/**
 * Inclui (`id` nulo) ou altera uma casa (ADR-0006: comando por Action). O
 * servidor valida de novo; a validação do formulário é só conveniência.
 *
 * PROVISÓRIO: grava na fonte em memória. Com o banco, grava pelo @achados/db
 * no escopo do papel da equipe, conferido aqui a cada pedido (ADR-003 de
 * produto), com registro em audit_events.
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
  const guarda = guardaDosDadosProvisorios();
  if (!guarda.ok) return guarda;
  await latenciaSimulada(500);

  const banco = bancoEmMemoria();
  let atual: (typeof banco.place)[number] | undefined;
  if (entradaId !== null) {
    const id = idDoRegistro("Casa", entradaId);
    if (!id.ok) return id;
    atual = banco.place.find((p) => p.id === id.value);
    if (!atual) return Err(AppErrors.notFound("Casa", id.value));
  }

  const fotos = atual
    ? banco.place_media.filter((m) => m.placeId === atual.id).length
    : 0;
  const dados = lerDadosDaCasa(entrada, fotos);
  if (!dados.ok) return dados;
  const d = dados.value;

  if (!banco.city.some((c) => c.id === d.cidadeId))
    return Err(AppErrors.validation("CIDADE_DESCONHECIDA", "Cidade inválida."));
  if (!banco.category.some((c) => c.id === d.categoriaId))
    return Err(
      AppErrors.validation("CATEGORIA_DESCONHECIDA", "Categoria inválida.")
    );
  if (banco.place.some((p) => p.slug === d.slug && p.id !== atual?.id))
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
    Object.assign(atual, linha);
    return Ok({ id: atual.id });
  }
  const nova = {
    ...linha,
    id: novoId(),
    latitude: null,
    longitude: null,
    createdAt: agora,
  };
  banco.place.push(nova);
  return Ok({ id: nova.id });
}
