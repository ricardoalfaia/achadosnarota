import { queryOptions } from "@tanstack/react-query";

import { buscarJson } from "@/shared/consultas/buscar-json";
import { parametrosDoFiltro } from "../domain/filtro";
import type { CartaoDeLugar, FiltroDoCatalogo } from "../domain/tipos";

// Contrato do recurso "lugares do catálogo" no Query (ADR-0006, seção 5):
//   - chave: ["web", "catalogo", "lugares", filtro]. Dado público, igual para
//     todos: não leva escopo de pessoa.
//   - entrada: categoria, cidade e busca (o filtro inteiro faz parte da chave).
//   - staleTime 5 min: o catálogo muda por publicação editorial, não a cada
//     segundo; voltar a uma categoria já vista é instantâneo.
//   - gcTime 30 min: filtros visitados ficam guardados durante a visita.
//   - servidor: prefetch no Server Component com a consulta direta
//     (`prefetchDosLugares`), hidratado pelo HydrationBoundary.
//   - navegador: GET /api/lugares (BFF), com cancelamento pelo `signal`.
//   - comandos que invalidam: nenhum no app (a publicação é do painel).

export function chaveDosLugares(filtro: FiltroDoCatalogo) {
  return ["web", "catalogo", "lugares", parametrosDoFiltro(filtro)] as const;
}

export function opcoesDosLugares(filtro: FiltroDoCatalogo) {
  return queryOptions({
    queryKey: chaveDosLugares(filtro),
    queryFn: ({ signal }) => {
      const parametros = parametrosDoFiltro(filtro);
      return buscarJson<CartaoDeLugar[]>(
        parametros ? `/api/lugares?${parametros}` : "/api/lugares",
        { signal }
      );
    },
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });
}
