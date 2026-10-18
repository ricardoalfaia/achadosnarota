import "server-only";

// Assinantes, só servidor: leituras em Result e o prefetch da tela.
export {
  lerFichaDoAssinante,
  listarAssinantes,
  resumoDosAssinantes,
} from "./consultas.servidor";
export { prefetchDosAssinantes } from "./consultas/assinantes.servidor";
