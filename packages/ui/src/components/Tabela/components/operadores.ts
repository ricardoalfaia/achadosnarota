import type { OperadorDeNumero, OperadorDeTexto, TipoDeColuna } from "../tipos";

// Os operadores de condição com o nome que a pessoa lê, no submenu e no
// diálogo do filtro customizado. Datas não têm condição: só a lista de valores.

export type OperadorDeCondicao = OperadorDeTexto | OperadorDeNumero;

export type OpcaoDeOperador = { valor: OperadorDeCondicao; label: string };

export const OPERADORES_DE_TEXTO: readonly {
  valor: OperadorDeTexto;
  label: string;
}[] = [
  { valor: "igual", label: "É igual a" },
  { valor: "diferente", label: "É diferente de" },
  { valor: "comecaCom", label: "Começa com" },
  { valor: "terminaCom", label: "Termina com" },
  { valor: "contem", label: "Contém" },
  { valor: "naoContem", label: "Não contém" },
];

export const OPERADORES_DE_NUMERO: readonly {
  valor: OperadorDeNumero;
  label: string;
}[] = [
  { valor: "igual", label: "É igual a" },
  { valor: "diferente", label: "É diferente de" },
  { valor: "maiorQue", label: "É maior que" },
  { valor: "maiorOuIgual", label: "É maior ou igual a" },
  { valor: "menorQue", label: "É menor que" },
  { valor: "menorOuIgual", label: "É menor ou igual a" },
];

/** Os operadores de uma coluna; vazio para tipos sem condição. */
export function operadoresDe(tipo: TipoDeColuna): readonly OpcaoDeOperador[] {
  if (tipo === "texto") return OPERADORES_DE_TEXTO;
  if (tipo === "numero") return OPERADORES_DE_NUMERO;
  return [];
}

/** O operador que o diálogo sugere quando o submenu não escolheu nenhum. */
export function operadorPadraoDe(tipo: TipoDeColuna): OperadorDeCondicao {
  return tipo === "numero" ? "igual" : "contem";
}

/** O primeiro operador do submenu como item de menu: "Igual...", "Contém...". */
export function rotuloCurto(label: string): string {
  return `${label.replace(/^É /, "")}...`.replace(/^./, (c) => c.toUpperCase());
}
