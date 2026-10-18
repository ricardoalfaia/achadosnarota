import { queryOptions } from "@tanstack/react-query";

import { buscarJson } from "@/shared/consultas/buscar-json";
import type { ResumoDoPainel } from "../domain/tipos";

// Recurso "resumo do painel" no Query (ADR-0006, seção 5):
//   - chave: ["admin", "inicio", "resumo"].
//   - staleTime 60 s e atualização ao voltar à aba: o início é a tela de
//     chegada, e a fila muda conforme a equipe grava nas outras telas.
//   - servidor: prefetch (`resumo.servidor.ts`); navegador: GET /api/inicio.
//   - invalidado por: nenhuma gravação em especial; o staleTime basta.

export function opcoesDoResumo() {
  return queryOptions({
    queryKey: ["admin", "inicio", "resumo"] as const,
    queryFn: ({ signal }) =>
      buscarJson<ResumoDoPainel>("/api/inicio", { signal }),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}
