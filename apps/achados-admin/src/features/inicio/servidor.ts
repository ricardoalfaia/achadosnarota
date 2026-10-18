import "server-only";

// Início, só servidor: o resumo em Result e o prefetch da tela.
export { resumoDoPainel } from "./consultas.servidor";
export { prefetchDoResumo } from "./consultas/resumo.servidor";
