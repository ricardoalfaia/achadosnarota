"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import {
  contagemPorSituacao,
  filtrarRegistros,
  type TODAS,
} from "@/shared/cadastro/filtro";
import { opcoesDaListaDeAvaliacoes } from "../consultas/curadoria";
import type { AvaliacaoDaLista, StatusDaAvaliacao } from "../domain/tipos";

export const SITUACOES_DA_AVALIACAO: readonly StatusDaAvaliacao[] = [
  "in_review",
  "approved",
  "published",
  "draft",
  "superseded",
  "withdrawn",
];

const textoDaAvaliacao = (a: AvaliacaoDaLista) => [a.casa];

/** As avaliações pelo Query com Suspense; busca local e adiada. */
export function useListaDeAvaliacoes(
  situacao: StatusDaAvaliacao | typeof TODAS
) {
  const { data: avaliacoes, isFetching } = useSuspenseQuery(
    opcoesDaListaDeAvaliacoes()
  );
  const [busca, setBusca] = useState("");
  const buscaAdiada = useDeferredValue(busca);

  const linhas = useMemo(
    () =>
      filtrarRegistros(avaliacoes, {
        situacao,
        busca: buscaAdiada,
        textoDe: textoDaAvaliacao,
      }),
    [avaliacoes, situacao, buscaAdiada]
  );

  return {
    linhas,
    total: avaliacoes.length,
    contagem: contagemPorSituacao(avaliacoes, SITUACOES_DA_AVALIACAO),
    busca,
    mudarBusca: setBusca,
    atualizando: busca !== buscaAdiada || isFetching,
  };
}
