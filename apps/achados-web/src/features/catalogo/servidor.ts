import "server-only";

// Leituras do catálogo, só no servidor.
export {
  cartoesPorSlug,
  lerFichaDoLugar,
  listarCategorias,
  listarCidades,
  listarLugares,
  lerVitrine,
  slugsPublicados,
} from "./consultas.servidor";
export { prefetchDosLugares } from "./consultas/lugares.servidor";
