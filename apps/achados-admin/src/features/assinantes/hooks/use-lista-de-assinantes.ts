"use client";

import { useState } from "react";
import { useDebounce } from "@achados/ui/hooks";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

import { opcoesDaListaDeAssinantes } from "../consultas/assinantes";
import { lerBusca, type FiltroDeSituacao } from "../domain/assinantes";

/** Espera depois da última tecla antes de buscar no servidor. */
const ESPERA_DA_BUSCA = 300;

/**
 * A listagem de assinantes, paginada no servidor: a busca (com espera, para
 * não consultar a cada tecla) e a situação viram a chave da consulta; a
 * rolagem pede a próxima página. Enquanto a nova busca chega, a lista
 * anterior fica na tela, esmaecida.
 */
export function useListaDeAssinantes(situacaoInicial: FiltroDeSituacao) {
  const [busca, setBusca] = useState("");
  const [situacao, setSituacao] = useState(situacaoInicial);
  const buscaEnviada = lerBusca(useDebounce(busca, ESPERA_DA_BUSCA));

  const consulta = useInfiniteQuery({
    ...opcoesDaListaDeAssinantes({ busca: buscaEnviada, situacao }),
    placeholderData: keepPreviousData,
  });

  const paginas = consulta.data?.pages ?? [];
  return {
    linhas: paginas.flatMap((p) => p.linhas),
    /** Contagem por situação da busca atual (vem na primeira página). */
    contagem: paginas[0]?.contagem ?? null,
    busca,
    mudarBusca: setBusca,
    situacao,
    mudarSituacao: setSituacao,
    carregando: consulta.isPending,
    erro: consulta.error,
    tentarDeNovo: () => void consulta.refetch(),
    atualizando:
      busca.trim() !== buscaEnviada ||
      (consulta.isFetching && !consulta.isFetchingNextPage),
    temMais: consulta.hasNextPage,
    carregandoMais: consulta.isFetchingNextPage,
    carregarMais: () => {
      if (consulta.hasNextPage && !consulta.isFetchingNextPage)
        void consulta.fetchNextPage();
    },
  };
}
