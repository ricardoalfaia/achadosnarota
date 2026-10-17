// Ponto de entrada puro: funções de classes, sem React e sem "use client".
// Serve a Server Components, que não podem chamar funções exportadas pelo ponto
// de entrada principal do pacote (`@achados/ui`), que é cliente.

export {
  estiloDoBotao,
  type AparenciaDoBotao,
  type IntencaoDoBotao,
  type TamanhoDoBotao,
  type VarianteDoBotao,
} from "./components/Botao/estilo";
export {
  estiloDaPilula,
  type AparenciaDaPilula,
} from "./components/Pilula/estilo";
export { formatarNota } from "./components/Nota/formatar";
export { cn } from "./lib/cn";
