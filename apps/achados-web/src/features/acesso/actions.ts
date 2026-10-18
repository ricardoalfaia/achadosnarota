"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { Err, toActionResult, type AppError } from "@achados/core";

import { recusaDe } from "@/shared/auth/chamar.servidor";
import {
  chaveDoCadastro,
  chavesDaEntrada,
  chavesDaRedefinicao,
} from "@/shared/auth/limite";
import {
  algumaBloqueada,
  ipDaOrigem,
  liberar,
  registrarFalha,
  resumo,
} from "@/shared/auth/limite.servidor";
import { motivoDaRecusa } from "@/shared/auth/regras";
import { ambienteServidor } from "@/shared/config/ambiente.servidor";
import { enviarEmail } from "@/shared/email/enviar.servidor";
import { emailDeBoasVindas } from "@/shared/email/transporte";
import { destinoSeguro } from "@/shared/rotas";
import { lerSessao } from "@/shared/sessao/sessao.servidor";
import {
  cadastrar,
  confirmarAutenticador,
  confirmarSegundoFator,
  entrar,
  estadoDaConta,
  iniciarAutenticador,
  pedirRedefinicao,
  redefinirSenha,
  trocarSenha,
} from "./autenticacao.servidor";
import {
  lerCadastro,
  lerCodigo,
  lerConfirmacaoDeSenha,
  lerCredenciais,
  lerPedidoDeRecuperacao,
  lerRedefinicao,
  lerTrocaDeSenha,
  type CampoDeCadastro,
  type CampoDeRecuperacao,
  type CampoDeRedefinicao,
  type ErrosDeCampo,
} from "./domain/credenciais";
import type {
  ConfiguracaoDoAutenticador,
  EstadoDoAcesso,
  MensagemDeAcesso,
} from "./domain/estado";
import { proximoPasso, type RespostaDaEntrada } from "./domain/etapas";

// Comandos das telas de acesso (ADR-0006 e ADR-0020), sobre o Better Auth. A
// entrada é uma Action só, etapa por etapa: credenciais, segundo fator, troca
// obrigatória de senha e configuração do autenticador. O campo `etapa` do
// formulário só escolhe qual comando tentar: quem autoriza cada um é o Better
// Auth, pela sessão ou pelo cookie do desafio do 2FA. Nenhuma exceção cruza a
// fronteira; recusas viram mensagens que não dizem se o e-mail existe.

type Valores = Record<string, unknown>;

/** Falha de infraestrutura vai ao log (toActionResult); a tela recebe só o código. */
function mensagemDa(erro: AppError): MensagemDeAcesso {
  const recusa = recusaDe(erro);
  if (!recusa) {
    toActionResult(Err(erro));
    return erro.category === "infrastructure" ? "servicoIndisponivel" : "falha";
  }
  const motivo = motivoDaRecusa(recusa);
  switch (motivo) {
    case "credenciaisInvalidas":
    case "codigoIncorreto":
    case "muitasTentativas":
    case "etapaExpirada":
    case "senhaIncorreta":
    case "senhaCurta":
      return motivo;
    default:
      return "falha";
  }
}

const recomecar = (mensagem: MensagemDeAcesso): EstadoDoAcesso => ({
  etapa: "credenciais",
  mensagem,
});

/** Sem sessão (ou com o desafio vencido) não há etapa para continuar. */
const voltaAoInicio = (mensagem: MensagemDeAcesso) =>
  mensagem === "etapaExpirada" || mensagem === "muitasTentativas";

/** 401 sem código: o endpoint exigia sessão e não havia uma. */
function semSessao(erro: AppError): boolean {
  const recusa = recusaDe(erro);
  return recusa?.status === 401 && !recusa.codigo;
}

/** A etapa não pode continuar: volta às credenciais com a mensagem. */
function recusaNaEtapa(
  erro: AppError,
  nestaEtapa: (resto: Partial<EstadoDoAcesso>) => EstadoDoAcesso
): EstadoDoAcesso {
  if (semSessao(erro)) return recomecar("etapaExpirada");
  const mensagem = mensagemDa(erro);
  return voltaAoInicio(mensagem)
    ? recomecar(mensagem)
    : nestaEtapa({ mensagem });
}

/**
 * Troca de senha e autenticador só existem com sessão aberta. Sem ela (o
 * formulário foi adulterado ou a sessão venceu), nem valida os campos: volta.
 */
async function semSessaoAberta(): Promise<EstadoDoAcesso | null> {
  const sessao = await lerSessao();
  if (!sessao.ok) return recomecar(mensagemDa(sessao.error));
  return sessao.value ? null : recomecar("etapaExpirada");
}

/**
 * Decide o que vem depois de uma etapa aceita; sem pendências, volta para onde
 * a pessoa estava (`voltar`, só caminhos deste app) ou para o início.
 */
async function seguir(
  resposta: RespostaDaEntrada,
  voltar: string
): Promise<EstadoDoAcesso> {
  if (resposta.tipo === "segundoFator") return { etapa: "doisFatores" };

  const conta = await estadoDaConta(resposta.usuario);
  if (!conta.ok) return recomecar(mensagemDa(conta.error));
  const passo = proximoPasso({ tipo: "conta", conta: conta.value });
  if (passo === "concluida") redirect(voltar);
  return { etapa: passo };
}

/** O destino de volta enviado pelo formulário, conferido. */
function voltarDe(valores: Valores): string {
  return destinoSeguro(
    typeof valores.voltar === "string" ? valores.voltar : undefined
  );
}

async function apresentarCredenciais(
  valores: Valores
): Promise<EstadoDoAcesso> {
  const credenciais = lerCredenciais(valores);
  if (!credenciais.ok)
    return { etapa: "credenciais", erros: credenciais.error };

  const chaves = chavesDaEntrada(
    resumo(credenciais.value.email),
    resumo(await ipDaOrigem())
  );
  const bloqueada = await algumaBloqueada([chaves.conta, chaves.ip]);
  if (!bloqueada.ok) return recomecar(mensagemDa(bloqueada.error));
  if (bloqueada.value) return recomecar("muitasTentativas");

  const entrada = await entrar(credenciais.value);
  if (!entrada.ok) {
    const mensagem = mensagemDa(entrada.error);
    if (mensagem === "credenciaisInvalidas")
      await registrarFalha([chaves.conta, chaves.ip]);
    return recomecar(mensagem);
  }

  // A senha certa zera as falhas da conta (não as do IP).
  await liberar([chaves.conta]);
  return seguir(entrada.value, voltarDe(valores));
}

async function confirmarCodigo(valores: Valores): Promise<EstadoDoAcesso> {
  const comCodigoDeRecuperacao = valores.tipo === "recuperacao";
  const nestaEtapa = (resto: Partial<EstadoDoAcesso>): EstadoDoAcesso => ({
    etapa: "doisFatores",
    comCodigoDeRecuperacao,
    ...resto,
  });

  const codigo = lerCodigo(valores);
  if (!codigo.ok) return nestaEtapa({ erros: codigo.error });

  // Tentativas: o Better Auth limita 5 por desafio e bloqueia a conta após 10
  // falhas seguidas, no banco.
  const resposta = await confirmarSegundoFator(codigo.value);
  if (!resposta.ok) return recusaNaEtapa(resposta.error, nestaEtapa);
  return seguir(resposta.value, voltarDe(valores));
}

async function concluirTrocaDeSenha(valores: Valores): Promise<EstadoDoAcesso> {
  const nestaEtapa = (resto: Partial<EstadoDoAcesso>): EstadoDoAcesso => ({
    etapa: "trocaDeSenha",
    ...resto,
  });

  const recusada = await semSessaoAberta();
  if (recusada) return recusada;

  const troca = lerTrocaDeSenha(valores);
  if (!troca.ok) return nestaEtapa({ erros: troca.error });

  const resposta = await trocarSenha(
    troca.value.senhaAtual,
    troca.value.novaSenha
  );
  // Sem sessão (alguém mandou a etapa sem passar pela senha), recomeça.
  if (!resposta.ok) return recusaNaEtapa(resposta.error, nestaEtapa);
  return seguir(resposta.value, voltarDe(valores));
}

/** O que o navegador devolveu do estado anterior, só para mostrar de novo. */
function autenticadorMostrado(
  anterior: EstadoDoAcesso
): ConfiguracaoDoAutenticador | undefined {
  const atual = anterior.autenticador;
  if (
    !atual ||
    typeof atual.qrCode !== "string" ||
    !atual.qrCode.startsWith("data:image/svg+xml;base64,") ||
    typeof atual.chave !== "string" ||
    !/^[A-Z2-7]+=*$/.test(atual.chave) ||
    !Array.isArray(atual.codigosDeRecuperacao) ||
    !atual.codigosDeRecuperacao.every((c) => typeof c === "string")
  )
    return undefined;
  return atual;
}

async function configurarAutenticador(
  anterior: EstadoDoAcesso,
  valores: Valores
): Promise<EstadoDoAcesso> {
  const nestaEtapa = (resto: Partial<EstadoDoAcesso>): EstadoDoAcesso => ({
    etapa: "configurarDoisFatores",
    ...resto,
  });

  const recusada = await semSessaoAberta();
  if (recusada) return recusada;

  // Primeiro passo: a senha de novo, para gerar o segredo.
  if (valores.fase !== "codigo") {
    const senha = lerConfirmacaoDeSenha(valores);
    if (!senha.ok) return nestaEtapa({ erros: senha.error });
    const configuracao = await iniciarAutenticador(senha.value);
    if (!configuracao.ok) return recusaNaEtapa(configuracao.error, nestaEtapa);
    return nestaEtapa({ autenticador: configuracao.value });
  }

  // Segundo passo: o código do aplicativo confirma o cadastro.
  const autenticador = autenticadorMostrado(anterior);
  const codigo = lerCodigo({ codigo: valores.codigo });
  if (!codigo.ok) return nestaEtapa({ autenticador, erros: codigo.error });
  const confirmacao = await confirmarAutenticador(codigo.value.codigo);
  if (!confirmacao.ok)
    return recusaNaEtapa(confirmacao.error, (resto) =>
      nestaEtapa({ autenticador, ...resto })
    );
  redirect(voltarDe(valores));
}

/** A entrada no sistema, etapa por etapa. Usada com `useActionState`. */
export async function avancarNaEntrada(
  anterior: EstadoDoAcesso,
  dados: FormData
): Promise<EstadoDoAcesso> {
  const valores = Object.fromEntries(dados);
  switch (valores.etapa) {
    case "doisFatores":
      return confirmarCodigo(valores);
    case "trocaDeSenha":
      return concluirTrocaDeSenha(valores);
    case "configurarDoisFatores":
      return configurarAutenticador(anterior, valores);
    default:
      return apresentarCredenciais(valores);
  }
}

export type MensagemDeRecuperacao = "muitasTentativas" | "falha";

export type EstadoDaRecuperacao = {
  erros?: ErrosDeCampo<CampoDeRecuperacao>;
  mensagem?: MensagemDeRecuperacao;
  concluido?: { email: string };
} | null;

/**
 * Pede o link de redefinição. A resposta é a mesma exista ou não a conta: o
 * Better Auth não diz, e o e-mail sai depois da resposta (`after`).
 */
export async function solicitarNovaSenha(
  _anterior: EstadoDaRecuperacao,
  dados: FormData
): Promise<EstadoDaRecuperacao> {
  const pedido = lerPedidoDeRecuperacao(Object.fromEntries(dados));
  if (!pedido.ok) return { erros: pedido.error };

  const chaves = chavesDaRedefinicao(
    resumo(pedido.value.email),
    resumo(await ipDaOrigem())
  );
  const limite = [chaves.conta, chaves.ip];
  const bloqueada = await algumaBloqueada(limite);
  if (!bloqueada.ok) {
    toActionResult(bloqueada);
    return { mensagem: "falha" };
  }
  if (bloqueada.value) return { mensagem: "muitasTentativas" };
  // Todo pedido conta, exista a conta ou não: é o que limita o envio de e-mails.
  await registrarFalha(limite);

  const resposta = await pedirRedefinicao(pedido.value.email);
  if (!resposta.ok) {
    if (mensagemDa(resposta.error) === "muitasTentativas")
      return { mensagem: "muitasTentativas" };
    if (!recusaDe(resposta.error)) return { mensagem: "falha" };
  }
  return { concluido: { email: pedido.value.email } };
}

export type MensagemDeRedefinicao =
  "linkInvalido" | "senhaCurta" | "muitasTentativas" | "falha";

export type EstadoDaRedefinicao = {
  erros?: ErrosDeCampo<CampoDeRedefinicao>;
  mensagem?: MensagemDeRedefinicao;
  concluido?: true;
} | null;

/** A senha nova a partir do link do e-mail. */
export async function salvarNovaSenha(
  _anterior: EstadoDaRedefinicao,
  dados: FormData
): Promise<EstadoDaRedefinicao> {
  const redefinicao = lerRedefinicao(Object.fromEntries(dados));
  if (!redefinicao.ok) return { erros: redefinicao.error };

  const resposta = await redefinirSenha(
    redefinicao.value.token,
    redefinicao.value.novaSenha
  );
  if (resposta.ok) return { concluido: true };

  const recusa = recusaDe(resposta.error);
  if (!recusa) {
    toActionResult(resposta);
    return { mensagem: "falha" };
  }
  const motivo = motivoDaRecusa(recusa);
  return {
    mensagem:
      motivo === "linkInvalido" ||
      motivo === "senhaCurta" ||
      motivo === "muitasTentativas"
        ? motivo
        : "falha",
  };
}

export type MensagemDoCadastro =
  | "emailEmUso"
  | "senhaCurta"
  | "muitasTentativas"
  | "cadastroFechado"
  | "servicoIndisponivel"
  | "falha";

export type EstadoDoCadastro = {
  erros?: ErrosDeCampo<CampoDeCadastro>;
  mensagem?: MensagemDoCadastro;
  /** O que foi digitado, para não sumir quando o servidor recusa (sem a senha). */
  valores?: { nome: string; email: string };
} | null;

/**
 * Cria a conta e entra. Limite por IP (cada tentativa conta). E-mail já
 * cadastrado recebe a mesma resposta neutra que manda entrar ou recuperar a
 * senha, sem confirmar a existência da conta com detalhes.
 */
export async function criarConta(
  _anterior: EstadoDoCadastro,
  dados: FormData
): Promise<EstadoDoCadastro> {
  const brutos = Object.fromEntries(dados);
  const valores = {
    nome: typeof brutos.nome === "string" ? brutos.nome : "",
    email: typeof brutos.email === "string" ? brutos.email : "",
  };
  const cadastro = lerCadastro(brutos);
  if (!cadastro.ok) return { erros: cadastro.error, valores };

  const limite = [chaveDoCadastro(resumo(await ipDaOrigem()))];
  const bloqueada = await algumaBloqueada(limite);
  if (!bloqueada.ok) {
    toActionResult(bloqueada);
    return { mensagem: "servicoIndisponivel", valores };
  }
  if (bloqueada.value) return { mensagem: "muitasTentativas", valores };
  await registrarFalha(limite);

  const criada = await cadastrar(cadastro.value);
  if (!criada.ok) {
    const recusa = recusaDe(criada.error);
    if (!recusa) {
      toActionResult(criada);
      return {
        mensagem:
          criada.error.category === "infrastructure"
            ? "servicoIndisponivel"
            : "falha",
        valores,
      };
    }
    const motivo = motivoDaRecusa(recusa);
    return {
      mensagem:
        motivo === "emailEmUso" ||
        motivo === "senhaCurta" ||
        motivo === "muitasTentativas" ||
        motivo === "cadastroFechado"
          ? motivo
          : "falha",
      valores,
    };
  }
  // Boas-vindas depois da resposta: falha do provedor não atrapalha a entrada.
  const { email, nome } = cadastro.value;
  after(async () => {
    const envio = await enviarEmail(
      emailDeBoasVindas({ para: email, nome, url: ambienteServidor().appUrl })
    );
    if (!envio.ok)
      console.error(`[acesso] boas-vindas não enviado: ${envio.error.code}`);
  });
  redirect(voltarDe(brutos));
}
