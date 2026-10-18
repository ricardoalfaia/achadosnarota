// Promoções: a oferta comercial das casas, separada do editorial (ADR-004 de
// produto). As leituras e o prefetch no servidor estão em `servidor.ts`.
export { CadastroDePromocoes } from "./components/cadastro-de-promocoes";
export {
  regraDeUso,
  STATUS_DA_PROMOCAO,
  TIPO_DA_PROMOCAO,
} from "./domain/apresentacao";
export type { PromocaoDaLista, StatusDaPromocao } from "./domain/tipos";
