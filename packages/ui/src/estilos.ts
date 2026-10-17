// Ponto de entrada puro: funções de classes, sem React e sem "use client".
// Serve a Server Components, que não podem chamar funções exportadas pelo ponto
// de entrada principal do pacote (`@meuproduto/ui`), que é cliente.

export {
  estiloDoBotao,
  type AparenciaDoBotao,
  type IntencaoDoBotao,
  type TamanhoDoBotao,
  type VarianteDoBotao,
} from "./components/Botao/estilo";
export { cn } from "./lib/cn";
