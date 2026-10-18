import "server-only";

// Promoções, só servidor: leituras em Result e o prefetch das telas.
export {
  casasParaPromocao,
  lerPromocao,
  listarPromocoes,
} from "./consultas.servidor";
export {
  prefetchDaListaDePromocoes,
  prefetchDaPromocao,
} from "./consultas/promocoes.servidor";
