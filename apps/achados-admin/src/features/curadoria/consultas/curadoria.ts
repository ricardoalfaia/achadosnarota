import { queryOptions } from "@tanstack/react-query";

import { buscarJson } from "@/shared/consultas/buscar-json";
import type { Avaliacao, AvaliacaoDaLista } from "../domain/tipos";

// Recursos da curadoria no Query (ADR-0006, seção 5): mesma política das
// casas. salvarAvaliacao invalida ["admin", "curadoria"] e a lista de casas
// (que mostra se a casa tem avaliação publicada).

export const CHAVE_DA_CURADORIA = ["admin", "curadoria"] as const;

export function opcoesDaListaDeAvaliacoes() {
  return queryOptions({
    queryKey: [...CHAVE_DA_CURADORIA, "lista"] as const,
    queryFn: ({ signal }) =>
      buscarJson<AvaliacaoDaLista[]>("/api/curadoria", { signal }),
    staleTime: 30_000,
  });
}

export function opcoesDaAvaliacao(id: string) {
  return queryOptions({
    queryKey: [...CHAVE_DA_CURADORIA, "registro", id] as const,
    queryFn: ({ signal }) =>
      buscarJson<Avaliacao>(`/api/curadoria/${encodeURIComponent(id)}`, {
        signal,
      }),
    staleTime: 0,
  });
}

export function opcoesDasCasasDaCuradoria() {
  return queryOptions({
    queryKey: ["admin", "casas", "para-curadoria"] as const,
    queryFn: ({ signal }) =>
      buscarJson<{ id: string; nome: string }[]>("/api/curadoria/casas", {
        signal,
      }),
    staleTime: 60_000,
  });
}
