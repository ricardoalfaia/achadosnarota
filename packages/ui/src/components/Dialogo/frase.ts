import { normalizarParaBusca } from "../../hooks/use-select";

/** Frase que a pessoa digita para liberar uma exclusão. */
export const FRASE_DE_EXCLUSAO = "confirmo a exclusão";

/**
 * O texto digitado é a frase pedida? Ignora maiúsculas, acentos e espaços nas
 * pontas ou repetidos, para não punir o teclado; o resto precisa ser igual.
 */
export function fraseConfere(digitado: string, frase: string): boolean {
  const limpar = (texto: string) =>
    normalizarParaBusca(texto).replace(/\s+/g, " ");
  return limpar(frase) !== "" && limpar(digitado) === limpar(frase);
}
