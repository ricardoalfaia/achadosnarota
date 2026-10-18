import "server-only";

// Casas, só servidor: leituras em Result e o prefetch das telas.
export { lerCasa, listarCasas, opcoesDoCatalogo } from "./consultas.servidor";
export {
  prefetchDaCasa,
  prefetchDaListaDeCasas,
  prefetchDoCatalogo,
} from "./consultas/casas.servidor";
