import "server-only";

import { AppErrors, Err, Ok, unwrapOrThrow, type Result } from "@achados/core";
import { z } from "zod";

// As variáveis do painel, lidas e validadas uma vez no servidor. Nenhuma vai
// para o navegador. Mesmas regras do app do assinante (ADR-0020): o painel se
// conecta como achados_app, sujeito a RLS, e recusa a conexão do dono.

export const TAMANHO_MINIMO_DO_SEGREDO = 32;

/** Texto vazio no arquivo de ambiente vale como ausente. */
const opcional = z
  .string()
  .trim()
  .optional()
  .transform((valor) => (valor ? valor : undefined));

const esquema = z.object({
  APP_URL: z.url({ protocol: /^https?$/ }),
  DATABASE_URL: z.string().regex(/^postgres(?:ql)?:\/\/.+/),
  BETTER_AUTH_SECRET: z.string().min(TAMANHO_MINIMO_DO_SEGREDO),
  // Bucket do R2 para a foto da equipe (ADR-0027). Sem ele, o painel funciona
  // e o envio de foto avisa que está indisponível.
  R2_ACCOUNT_ID: opcional,
  R2_API_KEY: opcional,
  R2_SECRET: opcional,
  R2_BUCKET: opcional,
  R2_PUBLIC_URL: opcional.pipe(z.url({ protocol: /^https$/ }).optional()),
  DATABASE_URL_ADMIN: z
    .string()
    .max(0, "o painel não recebe DATABASE_URL_ADMIN")
    .optional(),
});

export type ConfiguracaoDoArmazenamento = {
  contaId: string;
  /** Access Key ID do token S3 do R2 (`R2_API_KEY`). */
  chaveDeAcesso: string;
  /** Secret Access Key (`R2_SECRET`). */
  segredo: string;
  bucket: string;
  /** Endereço público do bucket, sem barra no fim. */
  urlPublica: string;
};

export type AmbienteDoPainel = {
  appUrl: string;
  databaseUrl: string;
  segredoDoAuth: string;
  armazenamento?: ConfiguracaoDoArmazenamento | undefined;
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
  const v = lido.data;
  return Ok({
    appUrl: v.APP_URL.replace(/\/$/, ""),
    databaseUrl: v.DATABASE_URL,
    segredoDoAuth: v.BETTER_AUTH_SECRET,
    armazenamento:
      v.R2_ACCOUNT_ID &&
      v.R2_API_KEY &&
      v.R2_SECRET &&
      v.R2_BUCKET &&
      v.R2_PUBLIC_URL
        ? {
            contaId: v.R2_ACCOUNT_ID,
            chaveDeAcesso: v.R2_API_KEY,
            segredo: v.R2_SECRET,
            bucket: v.R2_BUCKET,
            urlPublica: v.R2_PUBLIC_URL.replace(/\/+$/, ""),
          }
        : undefined,
  });
}

let lido: AmbienteDoPainel | undefined;

export function ambienteDoPainel(): AmbienteDoPainel {
  lido ??= unwrapOrThrow(lerAmbienteDoPainel(process.env));
  return lido;
}
