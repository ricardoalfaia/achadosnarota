import "server-only";

import { headers } from "next/headers";
import {
  AppErrors,
  Err,
  fromPromise,
  Ok,
  type AppError,
  type Result,
} from "@meuproduto/core";
import { users } from "@meuproduto/db";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";

import { auth } from "@/shared/auth/auth.servidor";
import { chamarAuth } from "@/shared/auth/chamar.servidor";
import type { EstadoDaConta } from "@/shared/auth/regras";
import { banco } from "@/shared/db/banco.servidor";
import { meusVinculos } from "@/shared/sessao/sessao.servidor";
import type { CodigoDeVerificacao, Credenciais } from "./domain/credenciais";
import type { ConfiguracaoDoAutenticador } from "./domain/estado";
import {
  chaveDoAutenticador,
  lerRespostaDaEntrada,
  type RespostaDaEntrada,
} from "./domain/etapas";

// As chamadas de acesso ao Better Auth, cada uma devolvendo `Result`. Todas
// passam os headers do pedido (cookies): o `nextCookies` grava no navegador o
// que o Better Auth responde (sessão, desafio do 2FA, saída). Nenhum token
// sai daqui.

function respostaInesperada(): AppError {
  return AppErrors.unexpected(
    "O Better Auth devolveu uma resposta fora do formato esperado."
  );
}

function comoEntrada(resposta: unknown): Result<RespostaDaEntrada, AppError> {
  const lida = lerRespostaDaEntrada(resposta);
  return lida ? Ok(lida) : Err(respostaInesperada());
}

/** E-mail e senha. Com o 2FA ligado, a sessão só abre depois do código. */
export async function entrar(
  credenciais: Credenciais
): Promise<Result<RespostaDaEntrada, AppError>> {
  const pedido = await headers();
  const resposta = await chamarAuth("signInEmail", () =>
    auth().api.signInEmail({
      body: { email: credenciais.email, password: credenciais.senha },
      headers: pedido,
    })
  );
  return resposta.ok ? comoEntrada(resposta.value) : resposta;
}

/** O código do autenticador ou de recuperação, contra o desafio do cookie. */
export async function confirmarSegundoFator(
  codigo: CodigoDeVerificacao
): Promise<Result<RespostaDaEntrada, AppError>> {
  const pedido = await headers();
  const resposta = await chamarAuth("verifyTwoFactor", () =>
    codigo.tipo === "recuperacao"
      ? auth().api.verifyBackupCode({
          body: { code: codigo.codigo },
          headers: pedido,
        })
      : auth().api.verifyTOTP({
          body: { code: codigo.codigo },
          headers: pedido,
        })
  );
  return resposta.ok ? comoEntrada(resposta.value) : resposta;
}

/**
 * Troca obrigatória: a senha nova substitui a provisória, as outras sessões
 * são encerradas (uma sessão nova vem no cookie) e a marca de troca sai.
 */
export async function trocarSenha(
  senhaAtual: string,
  novaSenha: string
): Promise<Result<RespostaDaEntrada, AppError>> {
  const pedido = await headers();
  const resposta = await chamarAuth("changePassword", () =>
    auth().api.changePassword({
      body: {
        currentPassword: senhaAtual,
        newPassword: novaSenha,
        revokeOtherSessions: true,
      },
      headers: pedido,
    })
  );
  if (!resposta.ok) return resposta;
  const entrada = comoEntrada(resposta.value);
  if (!entrada.ok || entrada.value.tipo !== "sessao") return entrada;

  const usuario = entrada.value.usuario;
  const limpo = await fromPromise(
    () =>
      banco()
        .update(users)
        .set({ mustChangePassword: false })
        .where(eq(users.id, usuario.id)),
    (causa) =>
      AppErrors.infrastructure(
        "DATABASE_ERROR",
        "Falha ao acessar o banco de dados.",
        causa
      )
  );
  if (!limpo.ok) return limpo;
  return Ok({
    tipo: "sessao",
    usuario: { ...usuario, mustChangePassword: false },
  });
}

/**
 * Gera o segredo do autenticador (ainda não verificado) e devolve o QR, a
 * chave e os códigos de recuperação. Pede a senha de novo, como o Better Auth.
 */
export async function iniciarAutenticador(
  senha: string
): Promise<Result<ConfiguracaoDoAutenticador, AppError>> {
  const pedido = await headers();
  const resposta = await chamarAuth("enableTwoFactor", () =>
    auth().api.enableTwoFactor({
      body: { password: senha, issuer: "Meuproduto" },
      headers: pedido,
    })
  );
  if (!resposta.ok) return resposta;

  const { totpURI, backupCodes } = resposta.value as {
    totpURI?: unknown;
    backupCodes?: unknown;
  };
  const chave = typeof totpURI === "string" && chaveDoAutenticador(totpURI);
  if (
    !chave ||
    !Array.isArray(backupCodes) ||
    !backupCodes.every((c) => typeof c === "string")
  )
    return Err(respostaInesperada());

  // O QR é gerado aqui, no servidor, como SVG: a URI com o segredo não vai a
  // nenhum serviço de terceiros.
  const svg = await fromPromise(
    () =>
      QRCode.toString(totpURI as string, {
        type: "svg",
        margin: 1,
        errorCorrectionLevel: "M",
      }),
    (causa) => AppErrors.unexpected("Falha ao gerar o QR code.", causa)
  );
  if (!svg.ok) return svg;
  return Ok({
    qrCode: `data:image/svg+xml;base64,${Buffer.from(svg.value).toString("base64")}`,
    chave,
    codigosDeRecuperacao: backupCodes as string[],
  });
}

/** O primeiro código do autenticador recém-cadastrado: liga o 2FA da conta. */
export async function confirmarAutenticador(
  codigo: string
): Promise<Result<void, AppError>> {
  const pedido = await headers();
  const resposta = await chamarAuth("verifyTOTP", () =>
    auth().api.verifyTOTP({ body: { code: codigo }, headers: pedido })
  );
  return resposta.ok ? Ok(undefined) : resposta;
}

/** O que a conta ainda precisa cumprir: depende dos papéis em todos os tenants. */
export async function estadoDaConta(usuario: {
  id: string;
  twoFactorEnabled: boolean;
  mustChangePassword: boolean;
}): Promise<Result<EstadoDaConta, AppError>> {
  const vinculos = await meusVinculos(usuario.id);
  if (!vinculos.ok) return vinculos;
  return Ok({
    mustChangePassword: usuario.mustChangePassword,
    twoFactorEnabled: usuario.twoFactorEnabled,
    papeis: vinculos.value.map((v) => v.papel),
  });
}

/** Pede o link de redefinição. A resposta é a mesma exista ou não a conta. */
export async function pedirRedefinicao(
  email: string
): Promise<Result<void, AppError>> {
  const pedido = await headers();
  const resposta = await chamarAuth("requestPasswordReset", () =>
    auth().api.requestPasswordReset({ body: { email }, headers: pedido })
  );
  return resposta.ok ? Ok(undefined) : resposta;
}

/** Usa o link de redefinição: a senha muda e todas as sessões são encerradas. */
export async function redefinirSenha(
  token: string,
  novaSenha: string
): Promise<Result<void, AppError>> {
  const resposta = await chamarAuth("resetPassword", () =>
    auth().api.resetPassword({ body: { token, newPassword: novaSenha } })
  );
  return resposta.ok ? Ok(undefined) : resposta;
}
