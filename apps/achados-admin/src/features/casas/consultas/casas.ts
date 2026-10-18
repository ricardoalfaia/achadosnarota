import { queryOptions } from "@tanstack/react-query";

import { buscarJson } from "@/shared/consultas/buscar-json";
import type { Casa, CasaDaLista, OpcoesDoCatalogo } from "../domain/tipos";

// Recursos de casas no Query (ADR-0006, seção 5):
//   - chave: ["admin", "casas", ...]. Dado interno da equipe: quando houver
//     sessão, o provedor é remontado por pessoa e o cache não atravessa contas.
//   - lista: staleTime 30 s; o painel é de edição e mais de uma pessoa grava.
//   - registro: staleTime 0 ao abrir para editar, para o formulário partir do
//     que está gravado; gcTime padrão.
//   - opções (cidades e categorias): mudam raramente, 10 min.
//   - servidor: prefetch no Server Component (`casas.servidor.ts`),
//     hidratado pelo HydrationBoundary; navegador: GET /api/casas (BFF).
//   - comandos que invalidam: salvarCasa invalida a lista e o registro.

export const CHAVE_DAS_CASAS = ["admin", "casas"] as const;

export function opcoesDaListaDeCasas() {
  return queryOptions({
    queryKey: [...CHAVE_DAS_CASAS, "lista"] as const,
    queryFn: ({ signal }) =>
      buscarJson<CasaDaLista[]>("/api/casas", { signal }),
    staleTime: 30_000,
  });
}

export function opcoesDaCasa(id: string) {
  return queryOptions({
    queryKey: [...CHAVE_DAS_CASAS, "registro", id] as const,
    queryFn: ({ signal }) =>
      buscarJson<Casa>(`/api/casas/${encodeURIComponent(id)}`, { signal }),
    staleTime: 0,
  });
}

export function opcoesDoCatalogo() {
  return queryOptions({
    queryKey: ["admin", "catalogo", "opcoes"] as const,
    queryFn: ({ signal }) =>
      buscarJson<OpcoesDoCatalogo>("/api/catalogo/opcoes", { signal }),
    staleTime: 10 * 60_000,
  });
}
