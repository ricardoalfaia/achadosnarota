"use client";

import { usePathname } from "next/navigation";
import { useToggle } from "@achados/ui/hooks";

import { itemAtivo, ITENS_DA_NAVEGACAO } from "./navegacao";

/**
 * A barra inferior: o item ativo pela rota e o leitor do passaporte (botão
 * central), que abre e fecha. Os itens se dividem em dois lados do botão.
 */
export function useNavegacaoInferior() {
  const ativo = itemAtivo(usePathname());
  const leitor = useToggle();
  return {
    ativo,
    leitor,
    antesDoLeitor: ITENS_DA_NAVEGACAO.slice(0, 2),
    depoisDoLeitor: ITENS_DA_NAVEGACAO.slice(2),
  };
}
