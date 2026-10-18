import { queryOptions } from "@tanstack/react-query";

import { buscarJson } from "@/shared/consultas/buscar-json";
import type {
  CasaDaPromocao,
  Promocao,
  PromocaoDaLista,
} from "../domain/tipos";

// Recursos de promoções no Query (ADR-0006, seção 5): mesma política das
// casas. A lista de casas para o campo é um recurso próprio, porque muda
// quando uma casa é publicada ou arquivada.
//   - comandos que invalidam: salvarPromocao invalida ["admin", "promocoes"].

export const CHAVE_DAS_PROMOCOES = ["admin", "promocoes"] as const;

export function opcoesDaListaDePromocoes() {
  return queryOptions({
    queryKey: [...CHAVE_DAS_PROMOCOES, "lista"] as const,
    queryFn: ({ signal }) =>
      buscarJson<PromocaoDaLista[]>("/api/promocoes", { signal }),
    staleTime: 30_000,
  });
}

export function opcoesDaPromocao(id: string) {
  return queryOptions({
    queryKey: [...CHAVE_DAS_PROMOCOES, "registro", id] as const,
    queryFn: ({ signal }) =>
      buscarJson<Promocao>(`/api/promocoes/${encodeURIComponent(id)}`, {
        signal,
      }),
    staleTime: 0,
  });
}

export function opcoesDasCasasDaPromocao() {
  return queryOptions({
    queryKey: ["admin", "casas", "para-promocao"] as const,
    queryFn: ({ signal }) =>
      buscarJson<CasaDaPromocao[]>("/api/promocoes/casas", { signal }),
    staleTime: 60_000,
  });
}
