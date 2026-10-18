"use client";

import { usePathname } from "next/navigation";
import { useToggle } from "@achados/ui/hooks";

import { barraVisivel, itemAtivo, ITENS_DA_NAVEGACAO } from "./navegacao";

/**
 * A barra inferior: se aparece na rota, o item ativo e o leitor do
 * passaporte (botão central), que abre e fecha. Os itens se dividem em dois lados do botão.
 */
export function useNavegacaoInferior() {
  const caminho = usePathname();
  const leitor = useToggle();
  return {
    visivel: barraVisivel(caminho),
    ativo: itemAtivo(caminho),
    leitor,
    antesDoLeitor: ITENS_DA_NAVEGACAO.slice(0, 2),
    depoisDoLeitor: ITENS_DA_NAVEGACAO.slice(2),
  };
}
