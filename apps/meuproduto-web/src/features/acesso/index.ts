// Acesso: as telas públicas de entrada, recuperação e redefinição de senha
// (ADR-0020), sobre o Better Auth. A sessão em si (leitura, `exigirSessao`,
// tenant, sair) é de `shared/sessao`; o servidor de identidade, de
// `shared/auth`.
export { ROTA_DA_RECUPERACAO } from "./components/etapa-de-credenciais";
export { FormularioDeEntrada } from "./components/formulario-de-entrada";
export { FormularioDeRecuperacao } from "./components/formulario-de-recuperacao";
export { FormularioDeRedefinicao } from "./components/formulario-de-redefinicao";
export { MarcaDeAcesso } from "./components/marca-de-acesso";
export { PainelDaMarca } from "./components/painel-da-marca";
export { RodapeDeAcesso } from "./components/rodape-de-acesso";
export type { Etapa, EstadoDoAcesso } from "./domain/estado";
