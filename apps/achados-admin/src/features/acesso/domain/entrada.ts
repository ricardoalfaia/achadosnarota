import { z } from "zod";

// As regras puras da entrada no painel: ler o que o Better Auth respondeu,
// a chave do autenticador e o tipo de código digitado. Testadas sem servidor.

/** O que interessa da resposta de `signInEmail` ou da verificação do 2FA. */
export type RespostaDaEntrada =
  { tipo: "segundoFator" } | { tipo: "sessao"; usuarioId: string };

const segundoFator = z.object({ twoFactorRedirect: z.literal(true) });
const sessao = z.object({ user: z.object({ id: z.string().min(1) }) });

/** O token que vem junto é descartado aqui; formato inesperado vira `null`. */
export function lerRespostaDaEntrada(
  resposta: unknown
): RespostaDaEntrada | null {
  if (segundoFator.safeParse(resposta).success) return { tipo: "segundoFator" };
  const lido = sessao.safeParse(resposta);
  return lido.success ? { tipo: "sessao", usuarioId: lido.data.user.id } : null;
}

/** A chave do `otpauth://` (base32), para digitar no aplicativo sem o QR. */
export function chaveDoAutenticador(totpUri: string): string | null {
  try {
    const url = new URL(totpUri);
    if (url.protocol !== "otpauth:") return null;
    const chave = url.searchParams.get("secret");
    return chave && /^[A-Z2-7]+=*$/.test(chave) ? chave : null;
  } catch {
    return null;
  }
}

/**
 * Seis dígitos são do autenticador; o resto é código de recuperação (o
 * Better Auth gera `xxxxx-xxxxx`). Espaços saem.
 */
export function tipoDoCodigo(
  digitado: string
): { tipo: "autenticador" | "recuperacao"; codigo: string } | null {
  const codigo = digitado.replace(/\s/g, "");
  if (/^\d{6}$/.test(codigo)) return { tipo: "autenticador", codigo };
  if (/^[A-Za-z0-9-]{8,32}$/.test(codigo))
    return { tipo: "recuperacao", codigo };
  return null;
}

/** O que a tela de entrada mostra depois de cada passo. */
export type EstadoDaEntrada =
  | { etapa: "credenciais"; erro?: string; email?: string }
  | { etapa: "codigo"; erro?: string };

export type EstadoDoAutenticador =
  | { etapa: "senha"; erro?: string }
  | {
      etapa: "qr";
      qrCode: string;
      chave: string;
      codigosDeRecuperacao: string[];
      erro?: string;
    };

/** A mensagem para a recusa do Better Auth, sem dizer se a conta existe. */
export function mensagemDaRecusa(status: number | undefined): string {
  if (status === 429)
    return "Muitas tentativas. Espere alguns minutos e tente de novo.";
  return "E-mail ou senha incorretos.";
}
