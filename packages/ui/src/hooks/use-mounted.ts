import { useSyncExternalStore } from "react";

const semAssinatura = () => () => {};

/**
 * `true` só depois que o cliente monta — evita divergência de hidratação sem o
 * anti-padrão `useEffect(() => setState(true), [])`.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    semAssinatura,
    () => true,
    () => false
  );
}
