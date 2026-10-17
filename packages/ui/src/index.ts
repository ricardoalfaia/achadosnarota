"use client";

// Design system — tokens, primitivos e padrões de admin.
// Nenhum conhecimento de domínio aqui: sem Ticket, Tenant, Site.
//
// Os campos usam os tokens semânticos de `@meuproduto/ui/styles/tokens.css`; o app importa
// esse arquivo e declara `@source` apontando para as fontes compartilhadas.

export {
  Aba,
  Abas,
  ListaDeAbas,
  PainelDaAba,
  type AbasProps,
  type VarianteDeAbas,
} from "./components/Abas";
export { Acordeao, ItemDoAcordeao } from "./components/Acordeao";
export { Alerta, type IntencaoDoAlerta } from "./components/Alerta";
export {
  Avatar,
  iniciaisDoNome,
  type TamanhoDoAvatar,
} from "./components/Avatar";
export {
  Botao,
  BotaoDeIcone,
  estiloDoBotao,
  type BotaoDeIconeProps,
  type BotaoProps,
  type IntencaoDoBotao,
  type TamanhoDoBotao,
  type VarianteDoBotao,
} from "./components/Botao";
export {
  BotaoDeMenu,
  ItemDeMenu,
  RotuloDeMenu,
  SeparadorDeMenu,
  type BotaoDeMenuProps,
} from "./components/BotaoDeMenu";
export {
  IconeArroba,
  IconeAtualizar,
  IconeBaixar,
  IconeBusca,
  IconeCadeado,
  IconeCheck,
  IconeCopiar,
  IconeEditar,
  IconeEnviar,
  IconeFechar,
  IconeFiltro,
  IconeFiltroDeLista,
  IconeGrade,
  IconeLixeira,
  IconeMais,
  IconeMaisOpcoes,
  IconeOlho,
  IconeOlhoFechado,
  IconeSeta,
  IconeSetaLonga,
  IconeTelaCheia,
  IconeUsuario,
} from "./components/Icones";
export {
  IconeBuscaGlobal,
  IconeChangeLog,
  IconeDocumentacao,
  IconeSino,
  IconeSuporte,
} from "./components/Icones";
export {
  AcoesDaGrade,
  BarraDaGrade,
  BarraDoFormulario,
  BotaoDeAcaoDaLinha,
  BuscaDaGrade,
  ChipDeFiltro,
  ChipsDeFiltro,
  CorpoDoFormulario,
  GradeDeCadastro,
  GradeDeCampos,
  RodapeDaGrade,
  RodapeDoFormulario,
  SeloDeStatus,
  Tecla,
  TextoDaLinha,
  Visoes,
  type IntencaoDoSeloDeStatus,
  type Visao,
} from "./components/Cadastro";
export { CaixaSuspensa } from "./components/CaixaSuspensa";
export {
  CampoDeBusca,
  type CampoDeBuscaProps,
} from "./components/CampoDeBusca";
export {
  CampoDeTexto,
  type CampoDeTextoProps,
} from "./components/CampoDeTexto";
export {
  CabecalhoDoCartao,
  Cartao,
  CorpoDoCartao,
  RodapeDoCartao,
} from "./components/Cartao";
export { CartaoDeAcao } from "./components/CartaoDeAcao";
export {
  CartaoDeIndicador,
  type TendenciaDoIndicador,
  type TomDoCartao,
  type VariacaoDoIndicador,
} from "./components/CartaoDeIndicador";
export { CartaoDeModelo } from "./components/CartaoDeModelo";
export { Destaque } from "./components/Destaque";
export {
  Dialogo,
  DialogoDeConfirmacao,
  DialogoDeExclusao,
  type DialogoDeExclusaoProps,
  type DialogoDeConfirmacaoProps,
  type DialogoProps,
  type TamanhoDoDialogo,
  type VarianteDoDialogo,
} from "./components/Dialogo";
export { Dica, type LadoDaDica } from "./components/Dica";
export { Esqueleto, EsqueletoDeTexto } from "./components/Esqueleto";
export { EstadoVazio } from "./components/EstadoVazio";
export { Etapas, type Etapa, type EstadoDaEtapa } from "./components/Etapas";
export { GrupoDeBotoes } from "./components/GrupoDeBotoes";
export { CampoSkeleton } from "./components/CampoSkeleton";
export { Checkbox, type CheckboxProps } from "./components/Checkbox";
export { Select, type SelectProps } from "./components/Select";
export { Selo, type VarianteDoSelo } from "./components/Selo";
export {
  SeletorDeData,
  type SeletorDeDataProps,
} from "./components/SeletorDeData";
export {
  SeletorDePeriodo,
  type SeletorDePeriodoProps,
} from "./components/SeletorDePeriodo";
export {
  EsqueletoDeTabela,
  Tabela,
  type ColunaDaTabela,
  type EdicaoDeCelula,
  type FiltroDeColuna,
  type TabelaProps,
  type TipoDeColuna,
  type ValorDeCelula,
} from "./components/Tabela";
export {
  SeletorDeIdioma,
  type OpcaoDeIdioma,
} from "./components/SeletorDeIdioma";
export { SeletorDeTema, type Tema } from "./components/SeletorDeTema";
export {
  validarArquivos,
  ZonaDeArquivo,
  type RecusaDeArquivo,
  type RegrasDeArquivo,
} from "./components/ZonaDeArquivo";
export type { Lado, PropsDeCampo, Tamanho } from "./components/tipos";

export type { Atalho, Opcao } from "./hooks";
export type { DataIso, Periodo } from "./lib/datas";
