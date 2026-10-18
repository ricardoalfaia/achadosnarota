"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { executarAcao } from "@/shared/consultas/acao";
import { salvarPromocao } from "../actions";
import { CHAVE_DAS_PROMOCOES } from "../consultas/promocoes";
import type { DadosDaPromocao } from "../domain/tipos";

/**
 * Gravar a promoção: o único coordenador da operação (ADR-0006, seção 7).
 * Invalida as promoções e a lista de casas, que mostra as ativas por casa.
 */
export function useSalvarPromocao(id: string | null) {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (dados: DadosDaPromocao) =>
      executarAcao(salvarPromocao(id, dados)),
    onSuccess: () =>
      Promise.all([
        cliente.invalidateQueries({ queryKey: CHAVE_DAS_PROMOCOES }),
        cliente.invalidateQueries({ queryKey: ["admin", "casas", "lista"] }),
        cliente.invalidateQueries({ queryKey: ["admin", "inicio"] }),
      ]),
  });
}
