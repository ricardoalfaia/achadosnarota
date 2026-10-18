"use client";

import { useRef } from "react";
import { useFecharAoSair, usePresenca, useToggle } from "@achados/ui/hooks";

/**
 * O painel suspenso do avatar: abre e fecha pelo botão, fecha com clique fora
 * ou Esc (o foco volta ao botão) e fica montado durante a animação de saída.
 */
export function useMenuDoUsuario() {
  const { isOpen: aberto, toggle: alternar, off: fechar } = useToggle(false);
  const raiz = useRef<HTMLDivElement>(null);
  const gatilho = useRef<HTMLButtonElement>(null);
  const presenca = usePresenca(aberto);

  useFecharAoSair(raiz, aberto, fechar, gatilho);

  return { aberto, alternar, fechar, raiz, gatilho, presenca };
}
