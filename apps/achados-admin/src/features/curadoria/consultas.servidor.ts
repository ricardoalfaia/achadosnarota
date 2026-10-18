import "server-only";

import { andThen, AppErrors, Err, Ok, type Result } from "@achados/core";
import type { EditorialReview } from "@achados/db";

import { idDoRegistro } from "@/shared/cadastro/id.servidor";
import {
  bancoEmMemoria,
  latenciaSimulada,
} from "@/shared/provisorio/banco-em-memoria.servidor";
import { guardaDosDadosProvisorios } from "@/shared/provisorio/guarda";
import { CRITERIOS_DA_CURADORIA } from "./domain/criterios";
import type { Avaliacao, AvaliacaoDaLista } from "./domain/tipos";

// Leituras da curadoria, só servidor, em Result. PROVISÓRIO: fonte em
// memória; com o banco, só o papel de curador lê e grava aqui (ADR-003 e
// ADR-004 de produto), nunca o parceiro.

const notaDoBanco = (valor: string | null) =>
  valor === null ? "" : valor.replace(".", ",");

export async function listarAvaliacoes(): Promise<Result<AvaliacaoDaLista[]>> {
  const guarda = guardaDosDadosProvisorios();
  if (!guarda.ok) return guarda;
  await latenciaSimulada();

  const banco = bancoEmMemoria();
  const casas = new Map(banco.place.map((p) => [p.id, p.name]));
  return Ok(
    banco.editorial_review
      .map((r): AvaliacaoDaLista => ({
        id: r.id,
        casaId: r.placeId,
        casa: casas.get(r.placeId) ?? "",
        nota: Number(r.score),
        criterios: CRITERIOS_DA_CURADORIA.filter(
          ({ chave }) => r[chave] !== null
        ).length,
        status: r.status,
        selo: r.seal,
        visitadaEm: r.visitedOn,
        atualizadaEm: r.updatedAt.toISOString(),
      }))
      .sort((a, b) => b.atualizadaEm.localeCompare(a.atualizadaEm))
  );
}

function avaliacaoDaLinha(r: EditorialReview): Avaliacao {
  return {
    id: r.id,
    casaId: r.placeId,
    visitadaEm: r.visitedOn,
    notas: {
      hygiene: notaDoBanco(r.hygiene),
      presentation: notaDoBanco(r.presentation),
      flavor: notaDoBanco(r.flavor),
      sophistication: notaDoBanco(r.sophistication),
      service: notaDoBanco(r.service),
      ambience: notaDoBanco(r.ambience),
      value: notaDoBanco(r.value),
    },
    parecer: r.summary,
    ressalvas: r.caveats ?? "",
    achado: r.highlight ?? "",
    dicas: r.tips.join("\n"),
    selo: r.seal,
    status: r.status,
    atualizadaEm: r.updatedAt.toISOString(),
  };
}

export async function lerAvaliacao(
  entrada: unknown
): Promise<Result<Avaliacao>> {
  const guarda = guardaDosDadosProvisorios();
  if (!guarda.ok) return guarda;
  await latenciaSimulada();
  return andThen(idDoRegistro("Avaliacao", entrada), (id) => {
    const linha = bancoEmMemoria().editorial_review.find((r) => r.id === id);
    return linha
      ? Ok(avaliacaoDaLinha(linha))
      : Err(AppErrors.notFound("Avaliacao", id));
  });
}

/** As casas que podem ser avaliadas: todas, menos as arquivadas. */
export async function casasParaAvaliacao(): Promise<
  Result<{ id: string; nome: string }[]>
> {
  const guarda = guardaDosDadosProvisorios();
  if (!guarda.ok) return guarda;
  return Ok(
    bancoEmMemoria()
      .place.filter((p) => p.status !== "archived")
      .map((p) => ({ id: p.id, nome: p.name }))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
  );
}
