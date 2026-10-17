import { useEffect, useMemo, useRef, useState } from "react";

/** O valor, só depois de `delay` ms sem mudar. */
export function useDebounce<T>(valor: T, delay: number): T {
  const [atrasado, setAtrasado] = useState(valor);

  useEffect(() => {
    const timer = setTimeout(() => setAtrasado(valor), delay);
    return () => clearTimeout(timer);
  }, [valor, delay]);

  return atrasado;
}

/** A função, chamada só depois de `delay` ms sem nova chamada. Usa sempre o callback mais recente. */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number
): (...args: Args) => void {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return useMemo(
    () =>
      (...args: Args) => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(
          () => callbackRef.current(...args),
          delay
        );
      },
    [delay]
  );
}
