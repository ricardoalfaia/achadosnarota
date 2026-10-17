import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

// A caixa de e-mail do E2E: o app do teste grava cada e-mail como uma linha
// JSON neste arquivo (EMAIL_CAIXA_DE_TESTE, ver shared/email). É o único jeito
// de o teste obter o link de redefinição, que não fica legível no banco.

export const CAIXA_DE_EMAIL = path.resolve(__dirname, "../saida/caixa.jsonl");

type EmailNaCaixa = { para: string; assunto: string; texto: string };

export function emailsPara(destinatario: string): EmailNaCaixa[] {
  if (!existsSync(CAIXA_DE_EMAIL)) return [];
  return readFileSync(CAIXA_DE_EMAIL, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((linha) => JSON.parse(linha) as EmailNaCaixa)
    .filter((email) => email.para === destinatario);
}

/** O link de redefinição do último e-mail para `destinatario`, ou `undefined`. */
export function linkDeRedefinicao(destinatario: string): string | undefined {
  const ultimo = emailsPara(destinatario).at(-1);
  return ultimo?.texto.match(
    /https?:\/\/\S+\/login\/redefinir\?token=\S+/
  )?.[0];
}
