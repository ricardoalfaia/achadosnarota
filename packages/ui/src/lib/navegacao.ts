/** `horizontal` usa as setas esquerda e direita; `vertical`, cima e baixo. */
export type Eixo = "horizontal" | "vertical";

type Movimento = "avancar" | "voltar" | "inicio" | "fim";

/** A tecla que faz cada movimento, por eixo. `Map` para não achar chaves herdadas de `Object`. */
const TECLAS: Record<Eixo, ReadonlyMap<string, Movimento>> = {
  horizontal: new Map([
    ["ArrowRight", "avancar"],
    ["ArrowLeft", "voltar"],
    ["Home", "inicio"],
    ["End", "fim"],
  ]),
  vertical: new Map([
    ["ArrowDown", "avancar"],
    ["ArrowUp", "voltar"],
    ["Home", "inicio"],
    ["End", "fim"],
  ]),
};

/** Para onde cada movimento leva, dados o último índice e o atual. */
const MOVER: Record<Movimento, (ultimo: number, atual: number) => number> = {
  avancar: (ultimo, atual) => (atual >= ultimo ? 0 : atual + 1),
  voltar: (ultimo, atual) => (atual <= 0 ? ultimo : atual - 1),
  inicio: () => 0,
  fim: (ultimo) => ultimo,
};

/**
 * Para qual posição o teclado leva em uma lista de `total` itens, a partir de
 * `atual`. As setas do eixo dão a volta nas pontas; Home e End vão às pontas.
 * `null` quando a tecla não navega. `atual` fora da lista (-1) parte da ponta.
 */
export function indiceDestino(
  total: number,
  atual: number,
  tecla: string,
  eixo: Eixo
): number | null {
  if (total <= 0) return null;
  const movimento = TECLAS[eixo].get(tecla);
  return movimento ? MOVER[movimento](total - 1, atual) : null;
}

/**
 * O item de `itens` ao qual o teclado leva a partir de `atual`, pelas regras de
 * `indiceDestino`. `atual` fora da lista parte da ponta.
 */
export function itemDestino<T>(
  itens: readonly T[],
  atual: T,
  tecla: string,
  eixo: Eixo
): T | null {
  const destino = indiceDestino(
    itens.length,
    itens.indexOf(atual),
    tecla,
    eixo
  );
  return destino === null ? null : (itens[destino] ?? null);
}
