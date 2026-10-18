import "server-only";

import { AppErrors, Err, Ok, unwrapOrThrow, type Result } from "@achados/core";
import { z } from "zod";

// As variáveis do painel, lidas e validadas uma vez no servidor. Nenhuma vai
// para o navegador. Mesmas regras do app do assinante (ADR-0020): o painel se
// conecta como achados_app, sujeito a RLS, e recusa a conexão do dono.

export const TAMANHO_MINIMO_DO_SEGREDO = 32;

const esquema = z.object({
  APP_URL: z.url({ protocol: /^https?$/ }),
  DATABASE_URL: z.string().regex(/^postgres(?:ql)?:\/\/.+/),
  BETTER_AUTH_SECRET: z.string().min(TAMANHO_MINIMO_DO_SEGREDO),
  DATABASE_URL_ADMIN: z
    .string()
    .max(0, "o painel não recebe DATABASE_URL_ADMIN")
    .optional(),
});

export type AmbienteDoPainel = {
  appUrl: string;
  databaseUrl: string;
  segredoDoAuth: string;
};

export function lerAmbienteDoPainel(
  fonte: Record<string, string | undefined>
): Result<AmbienteDoPainel> {
  const lido = esquema.safeParse(fonte);
  if (!lido.success) {
    const variaveis = [
      ...new Set(lido.error.issues.map((issue) => issue.path.join("."))),
    ];
    return Err(
      AppErrors.validation(
        "AMBIENTE_INVALIDO",
        `Variáveis ausentes ou inválidas: ${variaveis.join(", ")}.`,
        { variaveis }
      )
    );
  }
  return Ok({
    appUrl: lido.data.APP_URL.replace(/\/$/, ""),
    databaseUrl: lido.data.DATABASE_URL,
    segredoDoAuth: lido.data.BETTER_AUTH_SECRET,
  });
}

let lido: AmbienteDoPainel | undefined;

export function ambienteDoPainel(): AmbienteDoPainel {
  lido ??= unwrapOrThrow(lerAmbienteDoPainel(process.env));
  return lido;
}
