// Curadoria: as avaliações editoriais (visita, notas por critério, parecer e
// selo). Escrita só pela equipe de curadoria, isolada do comercial (ADR-004
// de produto). As leituras e o prefetch no servidor estão em `servidor.ts`.
export { CadastroDeAvaliacoes } from "./components/cadastro-de-avaliacoes";
export {
  notaComVirgula,
  SELO_EDITORIAL,
  STATUS_DA_AVALIACAO,
} from "./domain/apresentacao";
export type { AvaliacaoDaLista, StatusDaAvaliacao } from "./domain/tipos";
