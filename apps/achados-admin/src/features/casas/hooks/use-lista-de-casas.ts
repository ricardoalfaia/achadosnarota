"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import {
  contagemPorSituacao,
  filtrarRegistros,
  type TODAS,
} from "@/shared/cadastro/filtro";
import { opcoesDaListaDeCasas } from "../consultas/casas";
import type { CasaDaLista, StatusDaCasa } from "../domain/tipos";

export const SITUACOES_DA_CASA: readonly StatusDaCasa[] = [
  "published",
  "draft",
  "archived",
];

const textoDaCasa = (casa: CasaDaLista) => [
  casa.nome,
  casa.especialidade,
  casa.cidade,
  casa.categoria,
];

/**
 * A listagem de casas pelo Query com Suspense: quem mostra o esqueleto e o
 * erro na primeira carga é o DataBoundary em volta. A busca é estado local
 * (texto livre não vai para a URL) e adiada com `useDeferredValue`: digitar
 * não espera o filtro da lista. A situação vem da URL, por quem compõe.
 */
export function useListaDeCasas(situacao: StatusDaCasa | typeof TODAS) {
  const { data: casas, isFetching } = useSuspenseQuery(opcoesDaListaDeCasas());
  const [busca, setBusca] = useState("");
  const buscaAdiada = useDeferredValue(busca);

  const linhas = useMemo(
    () =>
      filtrarRegistros(casas, {
        situacao,
        busca: buscaAdiada,
        textoDe: textoDaCasa,
      }),
    [casas, situacao, buscaAdiada]
  );

  return {
    linhas,
    total: casas.length,
    contagem: contagemPorSituacao(casas, SITUACOES_DA_CASA),
    busca,
    mudarBusca: setBusca,
    /** A lista na tela ainda é da busca anterior ou está sendo atualizada. */
    atualizando: busca !== buscaAdiada || isFetching,
  };
}
