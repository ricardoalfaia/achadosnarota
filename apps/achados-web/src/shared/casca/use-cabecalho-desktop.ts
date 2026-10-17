"use client";

import { usePathname } from "next/navigation";

import { ehRotaAtual, ROTAS } from "@/shared/rotas";

export type LinkDoCabecalho = { rotulo: string; href: string; ativo: boolean };

/**
 * Os links do cabeçalho desktop (protótipo `index.html`) e qual está ativo.
 * Categorias e Como funciona são âncoras da página inicial.
 */
export function useCabecalhoDesktop(): LinkDoCabecalho[] {
  const caminho = usePathname();
  const naInicial = caminho === ROTAS.explorar || caminho.startsWith("/lugar/");
  return [
    { rotulo: "Explorar", href: ROTAS.explorar, ativo: naInicial },
    { rotulo: "Categorias", href: "/#categorias", ativo: false },
    { rotulo: "Como funciona", href: "/#como-funciona", ativo: false },
    {
      rotulo: "Favoritos",
      href: ROTAS.favoritos,
      ativo: ehRotaAtual(ROTAS.favoritos, caminho),
    },
    {
      rotulo: "Passaporte",
      href: ROTAS.passaporte,
      ativo: ehRotaAtual(ROTAS.passaporte, caminho),
    },
  ];
}
