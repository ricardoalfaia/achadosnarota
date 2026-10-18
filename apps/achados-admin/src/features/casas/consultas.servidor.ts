import "server-only";

import { AppErrors, Err, Ok, type Result } from "@achados/core";

import { idDoRegistro } from "@/shared/cadastro/id.servidor";
import { naEquipe, tabelasDaEquipe } from "@/shared/db/equipe.servidor";
import type { Casa, CasaDaLista, OpcoesDoCatalogo } from "./domain/tipos";

// Leituras de casas, só servidor, sempre em Result (ADR-0004), no escopo da
// pessoa da equipe (RLS: a equipe vê também rascunho e arquivada).

export async function listarCasas(): Promise<Result<CasaDaLista[]>> {
  return naEquipe(async (tx) => {
    const banco = await tabelasDaEquipe(tx);
    const cidades = new Map(banco.city.map((c) => [c.id, c]));
    const categorias = new Map(banco.category.map((c) => [c.id, c]));

    const casas = banco.place
      .map((lugar): CasaDaLista => {
        const cidade = cidades.get(lugar.cityId);
        return {
          id: lugar.id,
          nome: lugar.name,
          especialidade: lugar.specialty,
          cidade: cidade ? `${cidade.name} · ${cidade.state}` : "",
          categoria: categorias.get(lugar.categoryId)?.name ?? "",
          status: lugar.status,
          fotos: banco.place_media.filter((m) => m.placeId === lugar.id).length,
          avaliada: banco.editorial_review.some(
            (r) => r.placeId === lugar.id && r.status === "published"
          ),
          promocoesAtivas: banco.offer.filter(
            (o) => o.placeId === lugar.id && o.status === "active"
          ).length,
          atualizadaEm: lugar.updatedAt.toISOString(),
        };
      })
      .sort((a, b) => b.atualizadaEm.localeCompare(a.atualizadaEm));

    return Ok(casas);
  });
}

export async function lerCasa(entrada: unknown): Promise<Result<Casa>> {
  const id = idDoRegistro("Casa", entrada);
  if (!id.ok) return id;
  return naEquipe(async (tx) => {
    const banco = await tabelasDaEquipe(tx);
    const lugar = banco.place.find((p) => p.id === id.value);
    if (!lugar) return Err(AppErrors.notFound("Casa", id.value));
    return Ok<Casa>({
      id: lugar.id,
      nome: lugar.name,
      slug: lugar.slug,
      categoriaId: lugar.categoryId,
      cidadeId: lugar.cityId,
      especialidade: lugar.specialty,
      resumo: lugar.summary,
      descricao: lugar.description ?? "",
      tags: lugar.tags,
      endereco: lugar.address ?? "",
      telefone: lugar.phone ?? "",
      site: lugar.website ?? "",
      // O banco devolve "HH:MM:SS"; o formulário usa "HH:MM".
      horarios: banco.place_hours
        .filter((h) => h.placeId === lugar.id)
        .map((h) => ({
          dia: h.weekday,
          abre: h.opens.slice(0, 5),
          fecha: h.closes.slice(0, 5),
        })),
      observacaoDoHorario: lugar.hoursNote ?? "",
      status: lugar.status,
      fotos: banco.place_media
        .filter((m) => m.placeId === lugar.id)
        .sort((a, b) => a.position - b.position)
        .map((m) => ({ id: m.id, url: m.url, alt: m.alt, origem: m.source })),
      publicadaEm: lugar.publishedAt?.toISOString() ?? null,
      atualizadaEm: lugar.updatedAt.toISOString(),
    });
  });
}

export async function opcoesDoCatalogo(): Promise<Result<OpcoesDoCatalogo>> {
  return naEquipe(async (tx) => {
    const banco = await tabelasDaEquipe(tx);
    return Ok({
      cidades: banco.city
        .map((c) => ({ id: c.id, nome: c.name, uf: c.state }))
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
      categorias: [...banco.category]
        .sort((a, b) => a.position - b.position)
        .map((c) => ({ id: c.id, nome: c.name })),
    });
  });
}
