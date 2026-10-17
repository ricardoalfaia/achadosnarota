import { useCallback, useSyncExternalStore } from "react";

/**
 * `true` enquanto a media query casa. No servidor e na hidratação vale
 * `false`; o valor real chega logo depois, sem `setState` em `useEffect`.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (notificar: () => void) => {
      const lista = window.matchMedia(query);
      lista.addEventListener("change", notificar);
      return () => lista.removeEventListener("change", notificar);
    },
    [query]
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query]
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export const useIsMobile = () => useMediaQuery("(max-width: 768px)");

export const useIsTablet = () =>
  useMediaQuery("(min-width: 769px) and (max-width: 1024px)");

export const useIsDesktop = () => useMediaQuery("(min-width: 1025px)");

export const usePrefersDarkMode = () =>
  useMediaQuery("(prefers-color-scheme: dark)");

export const usePrefersReducedMotion = () =>
  useMediaQuery("(prefers-reduced-motion: reduce)");
