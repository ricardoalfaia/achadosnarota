"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { usePessoa } from "@/shared/consultas/provedor-de-consultas";
import { opcoesDosFavoritos } from "../consultas/favoritos";

/**
 * Os lugares salvos por quem está logado, compartilhados por todas as telas
 * (uma leitura só no cache). Sem sessão, a consulta fica desligada e nada é
 * favorito.
 */
export function useFavoritos() {
  const { escopo, logado } = usePessoa();
  const { data } = useQuery(opcoesDosFavoritos(escopo, logado));
  const salvos = useMemo(() => new Set(data ?? []), [data]);
  return { logado, escopo, ehFavorito: (slug: string) => salvos.has(slug) };
}
