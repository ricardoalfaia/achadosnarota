import "server-only";

// Curadoria, só servidor: leituras em Result e o prefetch das telas.
export {
  casasParaAvaliacao,
  lerAvaliacao,
  listarAvaliacoes,
} from "./consultas.servidor";
export {
  prefetchDaAvaliacao,
  prefetchDaListaDeAvaliacoes,
} from "./consultas/curadoria.servidor";
