"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useKeyboardShortcut, useToggle } from "@achados/ui/hooks";

import { usePreferencias } from "@/shared/preferencias/preferencias-provider";
import { itemDaRota } from "./navegacao";

/**
 * O estado da casca: o menu recolhido (preferência em cookie, já vem do
 * servidor) e, em telas estreitas, a gaveta do menu. Quem decide o que vale
 * em cada largura é o CSS (`lg:`), para a primeira pintura do servidor já
 * sair certa, sem esperar o navegador medir a tela.
 *
 * A gaveta fecha sozinha quando a rota muda; o ajuste é feito durante o
 * desenho, sem efeito (ADR-0016). Ctrl+B recolhe e expande o menu.
 */
export function useCasca() {
  const caminho = usePathname();
  const { preferencias, mudar } = usePreferencias();
  const gaveta = useToggle(false);

  const [caminhoDaGaveta, setCaminhoDaGaveta] = useState(caminho);
  if (caminhoDaGaveta !== caminho) {
    setCaminhoDaGaveta(caminho);
    gaveta.off();
  }

  function alternarRecolhido() {
    mudar("menuRecolhido", !preferencias.menuRecolhido);
  }

  useKeyboardShortcut({ key: "b", ctrl: true }, alternarRecolhido, {
    preventDefault: true,
  });

  return {
    caminho,
    itemAtual: itemDaRota(caminho),
    recolhido: preferencias.menuRecolhido,
    gavetaAberta: gaveta.isOpen,
    alternarGaveta: gaveta.toggle,
    fecharGaveta: gaveta.off,
    alternarRecolhido,
  };
}
