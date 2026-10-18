"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { executarAcao } from "@/shared/consultas/acao";
import { salvarCasa } from "../actions";
import { CHAVE_DAS_CASAS } from "../consultas/casas";
import type { DadosDaCasa } from "../domain/tipos";

/**
 * Gravar a casa: o único coordenador da operação (ADR-0006, seção 7). Sem
 * otimismo, porque a lista e o formulário só mudam depois de o servidor
 * aceitar; no fim, a lista, o registro e o resumo do início são pedidos
 * de novo.
 */
export function useSalvarCasa(id: string | null) {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (dados: DadosDaCasa) => executarAcao(salvarCasa(id, dados)),
    onSuccess: () =>
      Promise.all([
        cliente.invalidateQueries({ queryKey: CHAVE_DAS_CASAS }),
        cliente.invalidateQueries({ queryKey: ["admin", "inicio"] }),
      ]),
  });
}
