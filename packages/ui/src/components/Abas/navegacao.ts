import { itemDestino } from "../../lib/navegacao";

/**
 * Para qual aba o teclado leva, a partir da atual, na lista das abas habilitadas.
 * Setas dão a volta; Home e End vão às pontas. `null` quando a tecla não navega.
 */
export function abaDestino<T extends string>(
  habilitadas: readonly T[],
  atual: T,
  tecla: string
): T | null {
  return itemDestino(habilitadas, atual, tecla, "horizontal");
}
