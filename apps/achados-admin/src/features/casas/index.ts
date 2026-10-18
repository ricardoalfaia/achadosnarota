// Casas: o cadastro editorial de estabelecimentos (dados de descoberta). A
// avaliação e as promoções são features próprias (ADR-004 de produto). As
// leituras e o prefetch no servidor estão em `servidor.ts`.
export { CadastroDeCasas } from "./components/cadastro-de-casas";
export { STATUS_DA_CASA, tempoDesde } from "./domain/apresentacao";
export type {
  CasaDaLista,
  Categoria,
  Cidade,
  StatusDaCasa,
} from "./domain/tipos";
export { useOpcoesDoCatalogo } from "./hooks/use-formulario-da-casa";
