export type EstadoDaEtapa = "concluida" | "atual" | "pendente";

/**
 * O estado de cada etapa a partir da atual: as de antes estão concluídas, as de
 * depois, pendentes. Um `atual` que não está na lista deixa todas pendentes.
 */
export function estadosDasEtapas(
  ids: readonly string[],
  atual: string
): EstadoDaEtapa[] {
  const posicao = ids.indexOf(atual);
  return ids.map((_, indice) =>
    posicao === -1 || indice > posicao
      ? "pendente"
      : indice < posicao
        ? "concluida"
        : "atual"
  );
}
