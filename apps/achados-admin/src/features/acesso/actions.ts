"use server";

import { redirect } from "next/navigation";

import { recusaDe } from "@/shared/auth/chamar.servidor";
import { ROTA_DE_ENTRADA } from "@/shared/rotas";
import {
  confirmarAutenticador,
  confirmarSegundoFator,
  entrar,
  iniciarAutenticador,
  sairDoPainel,
} from "./autenticacao.servidor";
import {
  mensagemDaRecusa,
  tipoDoCodigo,
  type EstadoDaEntrada,
  type EstadoDoAutenticador,
} from "./domain/entrada";

// As Actions da entrada (useActionState). Depois de cada passo que abre ou
// muda a sessão, voltam para /entrar: a página relê a situação no servidor
// (sem autenticador, fora da equipe ou liberada) e mostra o que vem a seguir.

function campo(dados: FormData, nome: string): string {
  const valor = dados.get(nome);
  return typeof valor === "string" ? valor : "";
}

export async function entrarComSenha(
  _anterior: EstadoDaEntrada,
  dados: FormData
): Promise<EstadoDaEntrada> {
  const email = campo(dados, "email").trim().toLowerCase();
  const senha = campo(dados, "senha");
  if (!email || !senha)
    return { etapa: "credenciais", email, erro: "Informe e-mail e senha." };
  const resposta = await entrar(email, senha);
  if (!resposta.ok)
    return {
      etapa: "credenciais",
      email,
      erro: mensagemDaRecusa(recusaDe(resposta.error)?.status),
    };
  if (resposta.value.tipo === "segundoFator") return { etapa: "codigo" };
  redirect(ROTA_DE_ENTRADA);
}

export async function confirmarCodigo(
  _anterior: EstadoDaEntrada,
  dados: FormData
): Promise<EstadoDaEntrada> {
  const codigo = tipoDoCodigo(campo(dados, "codigo"));
  if (!codigo)
    return { etapa: "codigo", erro: "Digite os 6 números do autenticador." };
  const resposta = await confirmarSegundoFator(codigo);
  if (!resposta.ok) {
    const status = recusaDe(resposta.error)?.status;
    return {
      etapa: "codigo",
      erro:
        status === 429
          ? mensagemDaRecusa(429)
          : "Código inválido ou vencido. Confira o autenticador e tente de novo.",
    };
  }
  redirect(ROTA_DE_ENTRADA);
}

export async function gerarAutenticador(
  _anterior: EstadoDoAutenticador,
  dados: FormData
): Promise<EstadoDoAutenticador> {
  const senha = campo(dados, "senha");
  if (!senha) return { etapa: "senha", erro: "Informe a sua senha." };
  const configuracao = await iniciarAutenticador(senha);
  if (!configuracao.ok)
    return {
      etapa: "senha",
      erro:
        recusaDe(configuracao.error)?.status === 429
          ? mensagemDaRecusa(429)
          : "Senha incorreta.",
    };
  return { etapa: "qr", ...configuracao.value };
}

export async function ligarAutenticador(
  anterior: EstadoDoAutenticador,
  dados: FormData
): Promise<EstadoDoAutenticador> {
  if (anterior.etapa !== "qr") return anterior;
  const codigo = tipoDoCodigo(campo(dados, "codigo"));
  if (!codigo || codigo.tipo !== "autenticador")
    return {
      ...anterior,
      erro: "Digite os 6 números que o aplicativo mostra.",
    };
  const ligado = await confirmarAutenticador(codigo.codigo);
  if (!ligado.ok)
    return {
      ...anterior,
      erro: "Código inválido. Confira a hora do celular e tente de novo.",
    };
  redirect(ROTA_DE_ENTRADA);
}

export async function sair(): Promise<void> {
  await sairDoPainel();
  redirect(ROTA_DE_ENTRADA);
}
