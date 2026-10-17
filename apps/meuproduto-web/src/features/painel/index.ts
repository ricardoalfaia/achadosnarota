// Painel: a página inicial do tenant (mockup do painel), com indicadores,
// documentos recentes, ações rápidas e modelos mais usados. Os dados são
// sintéticos (`domain/painel-provisorio.ts`), menos o total de clientes, que já
// vem do banco pelo RLS do tenant (`leitura.servidor.ts`).
export { AcoesRapidas } from "./components/acoes-rapidas";
export { DestaqueDoPainel } from "./components/destaque-do-painel";
export { DocumentosRecentes } from "./components/documentos-recentes";
export { Indicadores } from "./components/indicadores";
export { ModelosMaisUsados } from "./components/modelos-mais-usados";
export type { Painel } from "./domain/painel";
export { lerPainel } from "./leitura.servidor";
