import "server-only";

import { authSchema, novoId } from "@achados/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins/two-factor";

import { ambienteDoPainel } from "@/shared/config/ambiente.servidor";
import { banco } from "@/shared/db/banco.servidor";

// A identidade do painel (ADR-0020, ADR-003 de produto): Better Auth sobre as
// mesmas tabelas de conta do app do assinante, com cookies próprios. Sem
// cadastro (as contas da equipe são criadas fora do app), autenticador
// obrigatório (o painel só abre com 2FA ligado) e sessões mais curtas. Quem
// é da equipe e com que papel não está aqui: é `staff_member`, lido no banco a
// cada pedido. Nenhum log daqui leva e-mail, senha ou código.

export const PREFIXO_DOS_COOKIES = "achados-admin";

/** 12 horas de sessão; renova a cada hora de uso. */
const SESSAO = {
  expiraEmSegundos: 12 * 60 * 60,
  renovaDepoisDeSegundos: 60 * 60,
};

function criarAuth() {
  const { appUrl, segredoDoAuth } = ambienteDoPainel();
  return betterAuth({
    appName: "Achados na Rota · Painel",
    baseURL: appUrl,
    secret: segredoDoAuth,
    trustedOrigins: [appUrl],
    telemetry: { enabled: false },
    database: drizzleAdapter(banco(), { provider: "pg", schema: authSchema }),
    emailAndPassword: { enabled: true, disableSignUp: true },
    session: {
      expiresIn: SESSAO.expiraEmSegundos,
      updateAge: SESSAO.renovaDepoisDeSegundos,
      cookieCache: { enabled: false },
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 60,
      customRules: {
        "/sign-in/email": { window: 15 * 60, max: 10 },
        "/two-factor/*": { window: 5 * 60, max: 15 },
      },
    },
    advanced: {
      database: { generateId: () => novoId() },
      cookiePrefix: PREFIXO_DOS_COOKIES,
      useSecureCookies: appUrl.startsWith("https://"),
    },
    plugins: [twoFactor({ issuer: "Achados na Rota · Painel" }), nextCookies()],
  });
}

let instancia: ReturnType<typeof criarAuth> | undefined;

export function auth() {
  instancia ??= criarAuth();
  return instancia;
}
