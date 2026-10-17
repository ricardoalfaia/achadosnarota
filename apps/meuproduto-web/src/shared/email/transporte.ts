import type { Ambiente } from "@/shared/config/ambiente";

// Regras puras do envio de e-mail: qual transporte este ambiente usa e o texto
// das mensagens. O envio em si está em `enviar.servidor.ts`.

export type Transporte = "resend" | "caixa" | "console" | "nenhum";

export type ConfiguracaoDoTransporte = {
  ambiente: Ambiente;
  appUrl: string;
  remetente?: string | undefined;
  resendApiKey?: string | undefined;
  caixaDeTeste?: string | undefined;
};

/** 127.0.0.1, ::1 ou localhost: o servidor que só a própria máquina alcança. */
export function ehEnderecoLocal(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return ["127.0.0.1", "localhost", "[::1]"].includes(hostname);
  } catch {
    return false;
  }
}

/**
 * Na ordem:
 *   1. caixa de teste do E2E: só com o app num endereço local, para um
 *      `EMAIL_CAIXA_DE_TESTE` esquecido num servidor real não gravar e-mails
 *      (com links de redefinição) em disco;
 *   2. Resend, com chave e remetente;
 *   3. console, só no ambiente local;
 *   4. nenhum: fora do local, sem transporte, o envio falha. Nunca some calado
 *      nem cai no console de homologação ou produção.
 */
export function resolverTransporte(
  configuracao: ConfiguracaoDoTransporte
): Transporte {
  if (configuracao.caixaDeTeste && ehEnderecoLocal(configuracao.appUrl))
    return "caixa";
  if (configuracao.resendApiKey && configuracao.remetente) return "resend";
  if (configuracao.ambiente === "local") return "console";
  return "nenhum";
}

export type MensagemDeEmail = {
  para: string;
  assunto: string;
  texto: string;
  html: string;
};

const escapar = (texto: string) =>
  texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** O e-mail com o link de redefinição de senha. Só o primeiro nome, nada além. */
export function emailDeRedefinicao({
  para,
  nome,
  url,
  validadeEmMinutos,
}: {
  para: string;
  nome: string;
  url: string;
  validadeEmMinutos: number;
}): MensagemDeEmail {
  const primeiro = nome.trim().split(/\s+/)[0] ?? "";
  const saudacao = primeiro ? `Olá, ${primeiro}.` : "Olá.";
  const corpo =
    "Recebemos um pedido para redefinir a sua senha do Meuproduto. Use o link abaixo para criar uma nova.";
  const validade = `O link vale por ${validadeEmMinutos} minutos e só pode ser usado uma vez. Ao redefinir, as sessões abertas são encerradas.`;
  const rodape =
    "Se você não pediu a redefinição, ignore este e-mail: a senha atual continua valendo.";
  const p = (texto: string) =>
    `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1f2937">${escapar(texto)}</p>`;
  return {
    para,
    assunto: "Redefinição de senha do Meuproduto",
    texto: [saudacao, "", corpo, "", url, "", validade, "", rodape].join("\n"),
    html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:32px">
${p(saudacao)}${p(corpo)}
<p style="margin:0 0 24px"><a href="${escapar(url)}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:8px">Redefinir senha</a></p>
${p(validade)}${p(rodape)}
</div>`,
  };
}
