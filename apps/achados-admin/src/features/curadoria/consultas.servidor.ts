import "server-only";

import { AppErrors, Err, Ok, type Result } from "@achados/core";
import type { EditorialReview } from "@achados/db";

import { idDoRegistro } from "@/shared/cadastro/id.servidor";
import { naEquipe, tabelasDaEquipe } from "@/shared/db/equipe.servidor";
import { CRITERIOS_DA_CURADORIA } from "./domain/criterios";
import type { Avaliacao, AvaliacaoDaLista } from "./domain/tipos";

// Leituras da curadoria, só servidor, em Result, no escopo da equipe. Só
// administração e curadoria gravam aqui (RLS), nunca o parceiro (ADR-003 e
// ADR-004 de produto).

const notaDoBanco = (valor: string | null) =>
  valor === null ? "" : valor.replace(".", ",");

export async function listarAvaliacoes(): Promise<Result<AvaliacaoDaLista[]>> {
  return naEquipe(async (tx) => {
    const banco = await tabelasDaEquipe(tx);
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
  });
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
  const id = idDoRegistro("Avaliacao", entrada);
  if (!id.ok) return id;
  return naEquipe(async (tx) => {
    const linha = (await tabelasDaEquipe(tx)).editorial_review.find(
      (r) => r.id === id.value
    );
    return linha
      ? Ok(avaliacaoDaLinha(linha))
      : Err(AppErrors.notFound("Avaliacao", id.value));
  });
}

/** As casas que podem ser avaliadas: todas, menos as arquivadas. */
export async function casasParaAvaliacao(): Promise<
  Result<{ id: string; nome: string }[]>
> {
  return naEquipe(async (tx) =>
    Ok(
      (await tabelasDaEquipe(tx)).place
        .filter((p) => p.status !== "archived")
        .map((p) => ({ id: p.id, nome: p.name }))
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
    )
  );
}
