import { useCallback, useRef, useSyncExternalStore } from "react";

/**
 * Relógio que avança sozinho, para textos como "há 5 min".
 *
 * `inicial` é o instante da requisição, vindo do servidor por prop
 * (`agoraDoServidor()`): servidor e cliente começam do mesmo valor, então a
 * hidratação bate. `Date.now()` só roda no intervalo, fora do render.
 */
export function useNow(inicial: number, intervalMs = 60_000): number {
  const agoraRef = useRef(inicial);

  const subscribe = useCallback(
    (notificar: () => void) => {
      const id = setInterval(() => {
        agoraRef.current = Date.now(); // atualiza antes de notificar
        notificar();
      }, intervalMs);
      return () => clearInterval(id);
    },
    [intervalMs]
  );

  const getSnapshot = useCallback(() => agoraRef.current, []);
  const getServerSnapshot = useCallback(() => inicial, [inicial]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
