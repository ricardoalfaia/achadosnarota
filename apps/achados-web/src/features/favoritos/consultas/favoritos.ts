import { queryOptions } from "@tanstack/react-query";

import { buscarJson } from "@/shared/consultas/buscar-json";

// Contrato do recurso "favoritos da pessoa" no Query (ADR-0006, seção 5):
//   - chave: ["web", escopo, "favoritos"]. Dado pessoal: o escopo (resumo do
//     id, não secreto) separa o cache de cada pessoa, e o provedor descarta o
//     cliente inteiro quando a pessoa muda.
//   - dado: os slugs salvos, para marcar o coração em qualquer tela.
//   - staleTime 5 min; refetch ao voltar o foco (outro aparelho pode mudar).
//   - servidor: prefetch com a consulta direta, hidratado nas telas com
//     corações; navegador: GET /api/me/favoritos (privado, sem cache HTTP).
//   - comando: alternarFavorito (Action), com otimismo e reconciliação num só
//     coordenador (`useAlternarFavorito`), que invalida esta chave no fim.

export function chaveDosFavoritos(escopo: string) {
  return ["web", escopo, "favoritos"] as const;
}

export function opcoesDosFavoritos(escopo: string, logado: boolean) {
  return queryOptions({
    queryKey: chaveDosFavoritos(escopo),
    queryFn: ({ signal }) =>
      buscarJson<string[]>("/api/me/favoritos", { signal }),
    enabled: logado,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: true,
  });
}
