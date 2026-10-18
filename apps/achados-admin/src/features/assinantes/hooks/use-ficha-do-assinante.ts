"use client";

import { AppError } from "@achados/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { executarAcao } from "@/shared/consultas/acao";
import { liberarCortesia, revogarCortesia } from "../actions";
import { CHAVE_DOS_ASSINANTES, opcoesDaFicha } from "../consultas/assinantes";

const mensagemDe = (erro: Error | null) =>
  erro instanceof AppError
    ? erro.message
    : erro
      ? "Não foi possível concluir agora. Tente de novo."
      : undefined;

/**
 * A ficha aberta e os comandos da cortesia. Depois de liberar ou revogar, a
 * ficha e a lista são lidas de novo (a situação da pessoa muda nas duas); os
 * números do topo vêm da página, que a Action revalida.
 */
export function useFichaDoAssinante(id: string) {
  const cliente = useQueryClient();
  const ficha = useQuery(opcoesDaFicha(id));

  const reler = () =>
    cliente.invalidateQueries({ queryKey: CHAVE_DOS_ASSINANTES });

  const liberacao = useMutation({
    mutationFn: () => executarAcao(liberarCortesia(id)),
    onSettled: reler,
  });
  const revogacao = useMutation({
    mutationFn: () => executarAcao(revogarCortesia(id)),
    onSettled: reler,
  });

  return {
    ficha: ficha.data,
    carregando: ficha.isPending,
    erroDaLeitura: ficha.error,
    tentarDeNovo: () => void ficha.refetch(),
    liberar: () => liberacao.mutate(),
    liberando: liberacao.isPending,
    revogar: () => revogacao.mutate(),
    revogando: revogacao.isPending,
    erroDoComando: mensagemDe(liberacao.error ?? revogacao.error),
    liberada: liberacao.isSuccess,
  };
}
