import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import { buscarJson } from "@/shared/consultas/buscar-json";
import type {
  FichaDoAssinante,
  FiltroDeSituacao,
  PaginaDeAssinantes,
} from "../domain/assinantes";

// Assinantes no Query (ADR-0006, seção 5):
//   - chave: ["admin", "assinantes", ...]; dado pessoal da equipe, o provedor
//     é por pessoa e o cache não atravessa contas.
//   - lista: infinita, uma página de 50 por vez, pela busca e situação; o
//     servidor filtra e pagina. staleTime 30 s.
//   - ficha: staleTime 0, para a cortesia aparecer como está gravada.
//   - servidor: prefetch da primeira página (`assinantes.servidor.ts`);
//     navegador: GET /api/assinantes (BFF).
//   - comandos que invalidam: liberar e revogar cortesia invalidam tudo.

export const CHAVE_DOS_ASSINANTES = ["admin", "assinantes"] as const;

export type FiltrosDaLista = { busca: string; situacao: FiltroDeSituacao };

export function enderecoDaPagina(
  { busca, situacao }: FiltrosDaLista,
  cursor: string | null
): string {
  const parametros = new URLSearchParams();
  if (busca) parametros.set("busca", busca);
  if (situacao !== "todos") parametros.set("situacao", situacao);
  if (cursor) parametros.set("cursor", cursor);
  const texto = parametros.toString();
  return texto ? `/api/assinantes?${texto}` : "/api/assinantes";
}

export function opcoesDaListaDeAssinantes(filtros: FiltrosDaLista) {
  return infiniteQueryOptions({
    queryKey: [...CHAVE_DOS_ASSINANTES, "lista", filtros] as const,
    queryFn: ({ pageParam, signal }) =>
      buscarJson<PaginaDeAssinantes>(enderecoDaPagina(filtros, pageParam), {
        signal,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (ultima) => ultima.proximo,
    staleTime: 30_000,
  });
}

export function opcoesDaFicha(id: string) {
  return queryOptions({
    queryKey: [...CHAVE_DOS_ASSINANTES, "ficha", id] as const,
    queryFn: ({ signal }) =>
      buscarJson<FichaDoAssinante>(
        `/api/assinantes/${encodeURIComponent(id)}`,
        { signal }
      ),
    staleTime: 0,
  });
}
