"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import {
  contagemPorSituacao,
  filtrarRegistros,
  type TODAS,
} from "@/shared/cadastro/filtro";
import { opcoesDaListaDePromocoes } from "../consultas/promocoes";
import type { PromocaoDaLista, StatusDaPromocao } from "../domain/tipos";

export const SITUACOES_DA_PROMOCAO: readonly StatusDaPromocao[] = [
  "active",
  "pending_review",
  "draft",
  "paused",
  "expired",
  "archived",
];

const textoDaPromocao = (p: PromocaoDaLista) => [p.titulo, p.casa];

/**
 * A listagem de promoções pelo Query com Suspense (o DataBoundary em volta
 * mostra a espera e o erro). Busca local e adiada; situação vinda da URL.
 */
export function useListaDePromocoes(situacao: StatusDaPromocao | typeof TODAS) {
  const { data: promocoes, isFetching } = useSuspenseQuery(
    opcoesDaListaDePromocoes()
  );
  const [busca, setBusca] = useState("");
  const buscaAdiada = useDeferredValue(busca);

  const linhas = useMemo(
    () =>
      filtrarRegistros(promocoes, {
        situacao,
        busca: buscaAdiada,
        textoDe: textoDaPromocao,
      }),
    [promocoes, situacao, buscaAdiada]
  );

  return {
    linhas,
    total: promocoes.length,
    contagem: contagemPorSituacao(promocoes, SITUACOES_DA_PROMOCAO),
    busca,
    mudarBusca: setBusca,
    atualizando: busca !== buscaAdiada || isFetching,
  };
}
