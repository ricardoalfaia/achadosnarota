import { useState } from "react";

/**
 * Valor que funciona nos dois modos dos campos: controlado quando
 * `valor` chega definido (inclusive `null`), interno quando chega `undefined`.
 * Interno ao pacote — não sai pelo barrel.
 */
export function useValorControlavel<V>(
  valor: V | undefined,
  inicial: V,
  aoMudar?: (novo: V) => void
): [V, (novo: V) => void] {
  const [interno, setInterno] = useState(inicial);
  const controlado = valor !== undefined;

  function mudar(novo: V) {
    if (!controlado) setInterno(novo);
    aoMudar?.(novo);
  }

  return [controlado ? valor : interno, mudar];
}
