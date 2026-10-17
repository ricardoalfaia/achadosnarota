import type {
  CampoDeCodigo,
  CampoDeConfirmacao,
  CampoDeCredencial,
  CampoDeTroca,
  ErrosDeCampo,
} from "./credenciais";

// O estado que a Action de entrada devolve ao formulário (`useActionState`).
// É dado simples: a etapa, erros por campo e uma mensagem geral, como códigos
// que a interface traduz. Nenhum token passa aqui.
//
// Atenção: o React devolve este estado à Action no envio seguinte, vindo do
// navegador. Ele serve para mostrar, nunca para decidir: quem decide a etapa
// é a sessão e os cookies do Better Auth, no servidor.

export type Etapa =
  "credenciais" | "doisFatores" | "trocaDeSenha" | "configurarDoisFatores";

export type CampoDoAcesso =
  CampoDeCredencial | CampoDeCodigo | CampoDeTroca | CampoDeConfirmacao;

export type MensagemDeAcesso =
  | "credenciaisInvalidas"
  | "muitasTentativas"
  | "codigoIncorreto"
  | "etapaExpirada"
  | "senhaIncorreta"
  | "senhaCurta"
  | "servicoIndisponivel"
  | "falha";

/** O que a pessoa precisa para cadastrar o autenticador, mostrado uma vez. */
export type ConfiguracaoDoAutenticador = {
  /** O QR (SVG gerado no servidor) como data URI. */
  qrCode: string;
  /** A chave em base32, para digitar no aplicativo sem o QR. */
  chave: string;
  /** Códigos de recuperação: aparecem só nesta tela. */
  codigosDeRecuperacao: readonly string[];
};

export type EstadoDoAcesso = {
  etapa: Etapa;
  erros?: ErrosDeCampo<CampoDoAcesso> | undefined;
  mensagem?: MensagemDeAcesso | undefined;
  /** Na etapa do segundo fator: a pessoa escolheu usar um código de recuperação. */
  comCodigoDeRecuperacao?: boolean | undefined;
  /** Na configuração do autenticador, depois de a senha ser confirmada. */
  autenticador?: ConfiguracaoDoAutenticador | undefined;
};

export const ESTADO_INICIAL: EstadoDoAcesso = { etapa: "credenciais" };
