import { useCallback, useSyncExternalStore } from "react";

function assinar(notificar: () => void) {
  document.addEventListener("fullscreenchange", notificar);
  return () => document.removeEventListener("fullscreenchange", notificar);
}

const estaEmTelaCheia = () => document.fullscreenElement !== null;

/** Estado de tela cheia e a alternância. O navegador pode recusar o pedido. */
export function useFullscreen() {
  const isFullscreen = useSyncExternalStore(
    assinar,
    estaEmTelaCheia,
    () => false
  );

  const toggle = useCallback(() => {
    const pedido = document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen();
    pedido.catch(() => {}); // recusa do navegador não é erro da aplicação
  }, []);

  return { isFullscreen, toggle };
}
