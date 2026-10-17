"use client";

import { useState } from "react";

const TEMPO_DO_AVISO_EM_MS = 2500;

/**
 * Compartilha uma página pelo menu do sistema (Web Share) e, onde não houver,
 * copia o endereço. O endereço é a página pública: não leva nada de quem
 * compartilha.
 */
export function useCompartilhar(titulo: string, caminho: string) {
  const [copiado, setCopiado] = useState(false);

  async function compartilhar() {
    const url = new URL(caminho, window.location.origin).toString();
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, url });
        return;
      } catch (erro) {
        // Cancelar o menu do sistema não é erro; outra falha cai na cópia.
        if ((erro as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), TEMPO_DO_AVISO_EM_MS);
    } catch {
      // Sem permissão de área de transferência: nada a fazer além de não quebrar.
    }
  }

  return { copiado, compartilhar };
}
