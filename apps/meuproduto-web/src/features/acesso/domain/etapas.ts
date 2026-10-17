import { z } from "zod";

import { pendenciasDaConta, type EstadoDaConta } from "@/shared/auth/regras";
import type { Etapa } from "./estado";

// A próxima etapa da entrada, decidida a partir do que o Better Auth
// respondeu e do estado da conta. Regras puras, testadas sem servidor.

/** O que interessa da resposta de `signInEmail` ou da verificação do 2FA. */
export type RespostaDaEntrada =
  | { tipo: "segundoFator" }
  | {
      tipo: "sessao";
      usuario: {
        id: string;
        twoFactorEnabled: boolean;
        mustChangePassword: boolean;
      };
    };

const segundoFatorSchema = z.object({ twoFactorRedirect: z.literal(true) });

const sessaoSchema = z.object({
  user: z.object({
    id: z.string().min(1),
    twoFactorEnabled: z.boolean().nullish(),
    mustChangePassword: z.boolean().nullish(),
  }),
});

/**
 * Lê a resposta do Better Auth: com o 2FA ligado, `signInEmail` não abre
 * sessão e devolve `{ twoFactorRedirect: true }` (o cookie do desafio fica
 * com o navegador); senão, devolve o usuário. O token que vem junto é
 * descartado aqui. Formato inesperado vira `null`.
 */
export function lerRespostaDaEntrada(
  resposta: unknown
): RespostaDaEntrada | null {
  if (segundoFatorSchema.safeParse(resposta).success)
    return { tipo: "segundoFator" };
  const lido = sessaoSchema.safeParse(resposta);
  if (!lido.success) return null;
  const { id, twoFactorEnabled, mustChangePassword } = lido.data.user;
  return {
    tipo: "sessao",
    usuario: {
      id,
      twoFactorEnabled: twoFactorEnabled === true,
      mustChangePassword: mustChangePassword === true,
    },
  };
}

export type ProximoPasso = Etapa | "concluida";

/**
 * Depois de cada etapa: o segundo fator pendente vem primeiro (ninguém troca a
 * senha só com a senha); depois a troca obrigatória e, para owner/admin sem
 * autenticador, a configuração dele. Sem pendências, a entrada termina.
 */
export function proximoPasso(
  resposta: { tipo: "segundoFator" } | { tipo: "conta"; conta: EstadoDaConta }
): ProximoPasso {
  if (resposta.tipo === "segundoFator") return "doisFatores";
  return pendenciasDaConta(resposta.conta)[0] ?? "concluida";
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
