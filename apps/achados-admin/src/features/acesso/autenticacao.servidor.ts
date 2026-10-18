import "server-only";

import { headers } from "next/headers";
import {
  AppErrors,
  Err,
  fromPromise,
  Ok,
  type AppError,
  type Result,
} from "@achados/core";
import QRCode from "qrcode";

import { auth } from "@/shared/auth/auth.servidor";
import { chamarAuth } from "@/shared/auth/chamar.servidor";
import {
  chaveDoAutenticador,
  lerRespostaDaEntrada,
  type RespostaDaEntrada,
} from "./domain/entrada";

// As chamadas de acesso ao Better Auth, em Result. Os headers do pedido vão
// junto: o `nextCookies` grava no navegador sessão, desafio do 2FA e saída.
// Nenhum token, senha ou código sai daqui nem vai para log.

const inesperada = () =>
  AppErrors.unexpected("O Better Auth respondeu fora do formato esperado.");

function comoEntrada(resposta: unknown): Result<RespostaDaEntrada, AppError> {
  const lida = lerRespostaDaEntrada(resposta);
  return lida ? Ok(lida) : Err(inesperada());
}

export async function entrar(
  email: string,
  senha: string
): Promise<Result<RespostaDaEntrada, AppError>> {
  const pedido = await headers();
  const resposta = await chamarAuth("signInEmail", () =>
    auth().api.signInEmail({
      body: { email, password: senha },
      headers: pedido,
    })
  );
  return resposta.ok ? comoEntrada(resposta.value) : resposta;
}

export async function confirmarSegundoFator(codigo: {
  tipo: "autenticador" | "recuperacao";
  codigo: string;
}): Promise<Result<RespostaDaEntrada, AppError>> {
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

export type ConfiguracaoDoAutenticador = {
  qrCode: string;
  chave: string;
  codigosDeRecuperacao: string[];
};

/**
 * Gera o segredo do autenticador (ainda não verificado): o QR como SVG feito
 * aqui, no servidor (a URI com o segredo não vai a serviço de terceiros), a
 * chave para digitar e os códigos de recuperação. Pede a senha de novo.
 */
export async function iniciarAutenticador(
  senha: string
): Promise<Result<ConfiguracaoDoAutenticador, AppError>> {
  const pedido = await headers();
  const resposta = await chamarAuth("enableTwoFactor", () =>
    auth().api.enableTwoFactor({
      body: { password: senha },
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
    return Err(inesperada());
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

/** O primeiro código do autenticador recém-cadastrado liga o 2FA da conta. */
export async function confirmarAutenticador(
  codigo: string
): Promise<Result<void, AppError>> {
  const pedido = await headers();
  const resposta = await chamarAuth("verifyTOTP", () =>
    auth().api.verifyTOTP({ body: { code: codigo }, headers: pedido })
  );
  return resposta.ok ? Ok(undefined) : resposta;
}

export async function sairDoPainel(): Promise<Result<unknown, AppError>> {
  const pedido = await headers();
  return chamarAuth("signOut", () => auth().api.signOut({ headers: pedido }));
}
