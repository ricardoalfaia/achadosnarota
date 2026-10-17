// As abas da ficha do lugar e a leitura da aba pedida na URL (`?aba=fotos`).

export const ABAS_DA_FICHA = [
  "cupons",
  "avaliacoes",
  "fotos",
  "sobre",
] as const;
export type AbaDaFicha = (typeof ABAS_DA_FICHA)[number];

/** A aba pedida na URL, ou Cupons. */
export function abaDaFicha(valor: string | string[] | undefined): AbaDaFicha {
  const v = Array.isArray(valor) ? valor[0] : valor;
  return ABAS_DA_FICHA.find((aba) => aba === v) ?? "cupons";
}
