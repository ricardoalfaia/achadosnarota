import { AppErrors, Err, Ok, type AppError, type Result } from "@achados/core";
import { z } from "zod";

export const AMBIENTES = ["local", "homolog", "production"] as const;
export type Ambiente = (typeof AMBIENTES)[number];

const ambientePublicoSchema = z.object({
  NEXT_PUBLIC_APP_ENV: z.enum(AMBIENTES),
});

/** O Better Auth deriva desse segredo as chaves de cookie e de cifra; abaixo disso é fraco. */
export const TAMANHO_MINIMO_DO_SEGREDO = 32;

/** Texto vazio no arquivo de ambiente vale como ausente. */
const opcional = z
  .string()
  .trim()
  .optional()
  .transform((valor) => (valor ? valor : undefined));

const ambienteServidorSchema = z.object({
  APP_URL: z.url({ protocol: /^https?$/ }),
  // Conexão como achados_app, sujeito a RLS (ADR-0020). Nunca a do dono.
  DATABASE_URL: z.string().regex(/^postgres(?:ql)?:\/\/.+/),
  BETTER_AUTH_SECRET: z.string().min(TAMANHO_MINIMO_DO_SEGREDO),
  // Fechado por padrão: só entra quem for convidado ou criado pelo bootstrap.
  SIGNUP_ENABLED: z
    .enum(["true", "false", ""])
    .optional()
    .transform((valor) => valor === "true"),
  EMAIL_FROM: opcional,
  RESEND_API_KEY: opcional,
  // Só E2E: grava os e-mails num arquivo em vez de enviar (ver shared/email).
  EMAIL_CAIXA_DE_TESTE: opcional,
  // Cloudflare R2 pela API S3 (fotos de perfil). Todas ou nenhuma.
  R2_ACCOUNT_ID: opcional,
  R2_API_KEY: opcional,
  R2_SECRET: opcional,
  R2_BUCKET: opcional,
  R2_PUBLIC_URL: opcional.pipe(z.url({ protocol: /^https$/ }).optional()),
  // Stripe (ADR-006 de produto). Todas ou nenhuma: sem elas, a assinatura
  // fica indisponível e o resto do app funciona. A chave secreta e o segredo
  // do webhook nunca saem do servidor.
  STRIPE_SECRET_KEY: opcional.pipe(
    z
      .string()
      .regex(/^(sk|rk)_(test|live)_/)
      .optional()
  ),
  STRIPE_WEBHOOK_SECRET: opcional.pipe(
    z
      .string()
      .regex(/^whsec_/)
      .optional()
  ),
  // Conexão como achados_pagamentos: só a rota do webhook usa (escreve
  // assinaturas); o resto do app usa DATABASE_URL.
  DATABASE_URL_PAGAMENTOS: opcional.pipe(
    z
      .string()
      .regex(/^postgres(?:ql)?:\/\/.+/)
      .optional()
  ),
  // O app nunca recebe a conexão do dono das tabelas: com ela, o RLS não vale.
  DATABASE_URL_ADMIN: z
    .string()
    .max(0, "o app não recebe DATABASE_URL_ADMIN")
    .optional(),
});

export type AmbientePublico = { ambiente: Ambiente };

export type ConfiguracaoDeEmail = {
  /** Remetente ("Achados na Rota <nao-responda@...>"). */
  remetente?: string | undefined;
  resendApiKey?: string | undefined;
  /** Arquivo da caixa de teste do E2E. */
  caixaDeTeste?: string | undefined;
};

/** O bucket do R2. As chaves nunca saem do servidor. */
export type ConfiguracaoDoArmazenamento = {
  contaId: string;
  /** Access Key ID do token S3 do R2 (`R2_API_KEY`). */
  chaveDeAcesso: string;
  /** Secret Access Key (`R2_SECRET`). */
  segredo: string;
  bucket: string;
  /** Endereço público de leitura do bucket, sem a barra final. */
  urlPublica: string;
};

const VARIAVEIS_DO_R2 = [
  "R2_ACCOUNT_ID",
  "R2_API_KEY",
  "R2_SECRET",
  "R2_BUCKET",
  "R2_PUBLIC_URL",
] as const;

export type AmbienteServidor = {
  /** URL pública do app: base do Better Auth e dos links enviados por e-mail. */
  appUrl: string;
  /** Conexão do papel da aplicação (achados_app). Nunca sai do servidor. */
  databaseUrl: string;
  /** Segredo do Better Auth. Nunca sai do servidor. */
  segredoDoAuth: string;
  /** Cadastro público aberto (`SIGNUP_ENABLED=true`). */
  cadastroAberto: boolean;
  email: ConfiguracaoDeEmail;
  /** Ausente: o envio de fotos fica indisponível, o resto do app funciona. */
  armazenamento?: ConfiguracaoDoArmazenamento | undefined;
  /** Ausente: a assinatura fica indisponível, o resto do app funciona. */
  pagamentos?: ConfiguracaoDosPagamentos | undefined;
};

/** A Stripe e a conexão do webhook. Nada disso sai do servidor. */
export type ConfiguracaoDosPagamentos = {
  chaveSecreta: string;
  segredoDoWebhook: string;
  databaseUrl: string;
};

export const VARIAVEIS_DOS_PAGAMENTOS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "DATABASE_URL_PAGAMENTOS",
] as const;

type Fonte = Record<string, string | undefined>;

function falha(error: z.ZodError): AppError {
  const variaveis = [
    ...new Set(error.issues.map((issue) => issue.path.join("."))),
  ];
  return AppErrors.validation(
    "AMBIENTE_INVALIDO",
    `Variáveis de ambiente ausentes ou inválidas: ${variaveis.join(", ")}. Compare com .env.example.`,
    { variaveis }
  );
}

/** Variáveis `NEXT_PUBLIC_*`: fazem parte do bundle do navegador. */
export function lerAmbientePublico(fonte: Fonte): Result<AmbientePublico> {
  const lido = ambientePublicoSchema.safeParse(fonte);
  if (!lido.success) return Err(falha(lido.error));
  return Ok({ ambiente: lido.data.NEXT_PUBLIC_APP_ENV });
}

/** Variáveis lidas somente no servidor. */
export function lerAmbienteServidor(fonte: Fonte): Result<AmbienteServidor> {
  const lido = ambienteServidorSchema.safeParse(fonte);
  if (!lido.success) return Err(falha(lido.error));
  const v = lido.data;
  const faltandoNoR2 = VARIAVEIS_DO_R2.filter((nome) => !v[nome]);
  if (faltandoNoR2.length > 0 && faltandoNoR2.length < VARIAVEIS_DO_R2.length)
    return Err(
      AppErrors.validation(
        "AMBIENTE_INVALIDO",
        `O R2 precisa de todas as variáveis; faltam: ${faltandoNoR2.join(", ")}.`,
        { variaveis: faltandoNoR2 }
      )
    );
  const faltandoNosPagamentos = VARIAVEIS_DOS_PAGAMENTOS.filter(
    (nome) => !v[nome]
  );
  if (
    faltandoNosPagamentos.length > 0 &&
    faltandoNosPagamentos.length < VARIAVEIS_DOS_PAGAMENTOS.length
  )
    return Err(
      AppErrors.validation(
        "AMBIENTE_INVALIDO",
        `Os pagamentos precisam de todas as variáveis; faltam: ${faltandoNosPagamentos.join(", ")}.`,
        { variaveis: faltandoNosPagamentos }
      )
    );
  return Ok({
    appUrl: v.APP_URL.replace(/\/+$/, ""),
    databaseUrl: v.DATABASE_URL,
    segredoDoAuth: v.BETTER_AUTH_SECRET,
    cadastroAberto: v.SIGNUP_ENABLED,
    email: {
      remetente: v.EMAIL_FROM,
      resendApiKey: v.RESEND_API_KEY,
      caixaDeTeste: v.EMAIL_CAIXA_DE_TESTE,
    },
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
    pagamentos:
      v.STRIPE_SECRET_KEY &&
      v.STRIPE_WEBHOOK_SECRET &&
      v.DATABASE_URL_PAGAMENTOS
        ? {
            chaveSecreta: v.STRIPE_SECRET_KEY,
            segredoDoWebhook: v.STRIPE_WEBHOOK_SECRET,
            databaseUrl: v.DATABASE_URL_PAGAMENTOS,
          }
        : undefined,
  });
}
