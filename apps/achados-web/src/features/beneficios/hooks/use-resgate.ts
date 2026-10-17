"use client";

import { usePathname } from "next/navigation";
import { useToggle } from "@achados/ui/hooks";

import { rotaDeCriarConta, rotaDeEntrar, ROTAS } from "@/shared/rotas";

/**
 * A janela de resgate de um benefício: abrir e fechar, e os caminhos que ela
 * oferece (entrar ou criar conta voltando para a mesma ficha, conhecer o
 * passaporte). O que mostrar vem da situação decidida no servidor.
 */
export function useResgate() {
  const caminho = usePathname();
  const janela = useToggle();
  return {
    janela,
    rotas: {
      entrar: rotaDeEntrar(caminho),
      criarConta: rotaDeCriarConta(caminho),
      passaporte: ROTAS.passaporte,
    },
  };
}
