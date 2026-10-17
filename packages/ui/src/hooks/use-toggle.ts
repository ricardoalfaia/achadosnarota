import { useCallback, useState } from "react";

export type UseToggleReturn = {
  isOpen: boolean;
  on: () => void;
  off: () => void;
  toggle: () => void;
  set: (valor: boolean) => void;
};

/** Booleano de interface (menu, painel, modal) com as quatro operações estáveis. */
export function useToggle(inicial = false): UseToggleReturn {
  const [isOpen, set] = useState(inicial);

  const on = useCallback(() => set(true), []);
  const off = useCallback(() => set(false), []);
  const toggle = useCallback(() => set((atual) => !atual), []);

  return { isOpen, on, off, toggle, set };
}
