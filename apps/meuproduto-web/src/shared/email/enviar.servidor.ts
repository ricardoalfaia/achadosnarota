import "server-only";

import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import {
  AppErrors,
  Err,
  fromPromise,
  Ok,
  type AppError,
  type Result,
} from "@meuproduto/core";

import { ambientePublico } from "@/shared/config/ambiente.publico";
import { ambienteServidor } from "@/shared/config/ambiente.servidor";
import { resolverTransporte, type MensagemDeEmail } from "./transporte";

// Envio de e-mail transacional (padrão do scribevox, sem dependência nova):
// Resend por HTTP; console no ambiente local; caixa em arquivo no E2E. SMTP
// fica como pendência (ADR-0020). Nenhum erro carrega o destinatário, o corpo
// ou o link: a resposta do provedor também não entra (pode repetir o pedido).

const RESEND_API_URL = "https://api.resend.com/emails";
const TEMPO_LIMITE_EM_MS = 15_000;

function configuracao() {
  const { appUrl, email } = ambienteServidor();
  return { ambiente: ambientePublico.ambiente, appUrl, ...email };
}

async function viaResend(
  mensagem: MensagemDeEmail,
  remetente: string,
  chave: string
): Promise<Result<void, AppError>> {
  const resposta = await fromPromise(
    () =>
      fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${chave}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: remetente,
          to: [mensagem.para],
          subject: mensagem.assunto,
          text: mensagem.texto,
          html: mensagem.html,
        }),
        signal: AbortSignal.timeout(TEMPO_LIMITE_EM_MS),
      }),
    (causa) =>
      AppErrors.integration(
        "EMAIL_INDISPONIVEL",
        "Não foi possível falar com o provedor de e-mail.",
        causa
      )
  );
  if (!resposta.ok) return resposta;
  if (resposta.value.ok) return Ok(undefined);
  return Err(
    AppErrors.integration(
      "EMAIL_RECUSADO",
      `O provedor de e-mail recusou o envio (${resposta.value.status}).`
    )
  );
}

async function naCaixa(
  mensagem: MensagemDeEmail,
  arquivo: string
): Promise<Result<void, AppError>> {
  return fromPromise(
    async () => {
      await mkdir(path.dirname(arquivo), { recursive: true });
      await appendFile(
        arquivo,
        `${JSON.stringify({ para: mensagem.para, assunto: mensagem.assunto, texto: mensagem.texto })}\n`
      );
    },
    (causa) =>
      AppErrors.infrastructure(
        "EMAIL_CAIXA_INDISPONIVEL",
        "Não foi possível gravar na caixa de e-mail de teste.",
        causa
      )
  );
}

/** Envia (ou, no local, mostra no console) um e-mail transacional. */
export async function enviarEmail(
  mensagem: MensagemDeEmail
): Promise<Result<void, AppError>> {
  const config = configuracao();
  switch (resolverTransporte(config)) {
    case "caixa":
      return naCaixa(mensagem, config.caixaDeTeste!);
    case "resend":
      return viaResend(mensagem, config.remetente!, config.resendApiKey!);
    case "console":
      // Só no ambiente local: é assim que o link de redefinição chega a quem
      // desenvolve. Nunca acontece em homologação ou produção.
      console.info(
        `[email] ambiente local, sem transporte: o e-mail não foi enviado.\n` +
          `Para: ${mensagem.para}\nAssunto: ${mensagem.assunto}\n\n${mensagem.texto}\n`
      );
      return Ok(undefined);
    case "nenhum":
      return Err(
        AppErrors.infrastructure(
          "EMAIL_NAO_CONFIGURADO",
          "Envio de e-mail não configurado: defina RESEND_API_KEY e EMAIL_FROM."
        )
      );
  }
}
