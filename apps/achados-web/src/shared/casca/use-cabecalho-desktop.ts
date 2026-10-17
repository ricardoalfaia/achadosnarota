"use client";

import { usePathname } from "next/navigation";
import { useElementoVisivel } from "@achados/ui/hooks";

import { ehRotaAtual, ROTAS } from "@/shared/rotas";

export type LinkDoCabecalho = {
  id: "explorar" | "categorias" | "como-funciona" | "favoritos" | "passaporte";
  rotulo: string;
  href: string;
  ativo: boolean;
};

/**
 * Os links do cabeçalho desktop (protótipo `index.html`), qual está ativo e
 * se a busca compacta aparece: fora da exploração, sempre; nela, quando a
 * busca grande do topo (`#busca`) sai da tela, para nunca haver duas.
 * Categorias e Como funciona são âncoras da página inicial.
 */
export function useCabecalhoDesktop(): {
  links: LinkDoCabecalho[];
  mostrarBusca: boolean;
} {
  const caminho = usePathname();
  const naExploracao = caminho === ROTAS.explorar;
  const naInicial = naExploracao || caminho.startsWith("/lugar/");
  const buscaDoTopoNaTela = useElementoVisivel(naExploracao ? "busca" : null, {
    inicial: naExploracao,
  });
  return {
    mostrarBusca: !buscaDoTopoNaTela,
    links: linksDoCabecalho(caminho, naInicial),
  };
}

function linksDoCabecalho(
  caminho: string,
  naInicial: boolean
): LinkDoCabecalho[] {
  return [
    {
      id: "explorar",
      rotulo: "Explorar",
      href: ROTAS.explorar,
      ativo: naInicial,
    },
    {
      id: "categorias",
      rotulo: "Categorias",
      href: "/#categorias",
      ativo: false,
    },
    {
      id: "como-funciona",
      rotulo: "Como funciona",
      href: "/#como-funciona",
      ativo: false,
    },
    {
      id: "favoritos",
      rotulo: "Favoritos",
      href: ROTAS.favoritos,
      ativo: ehRotaAtual(ROTAS.favoritos, caminho),
    },
    {
      id: "passaporte",
      rotulo: "Passaporte",
      href: ROTAS.passaporte,
      ativo: ehRotaAtual(ROTAS.passaporte, caminho),
    },
  ];
}
