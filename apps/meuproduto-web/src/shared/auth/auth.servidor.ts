import "server-only";

import { after } from "next/server";
import { authSchema, users } from "@meuproduto/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins/two-factor";
import { eq } from "drizzle-orm";

import { ambienteServidor } from "@/shared/config/ambiente.servidor";
import { banco } from "@/shared/db/banco.servidor";
import { enviarEmail } from "@/shared/email/enviar.servidor";
import { emailDeRedefinicao } from "@/shared/email/transporte";
import {
  LIMITES_DO_AUTH,
  SESSAO,
  TAMANHO_MINIMO_DA_SENHA,
  VALIDADE_DO_LINK_DE_REDEFINICAO_EM_SEGUNDOS,
} from "./regras";

// O servidor de identidade do Meuproduto (ADR-0020): Better Auth 1.7.5 no
// próprio app, sobre as tabelas de `@meuproduto/db`. Somente servidor.
//
// O que NÃO está aqui de propósito:
//   - plugin organization: organização, tenant e vínculo são do Meuproduto;
//   - cookieCache: desligado, para a revogação valer na requisição seguinte;
//   - cadastro aberto por padrão: só com SIGNUP_ENABLED=true.
// Nenhum log daqui leva e-mail, senha, código ou token.

export const PREFIXO_DOS_COOKIES = "meuproduto";

/** Gancho para o convite: hoje não há convites, então a porta fechada é fechada. */
function podeCriarConta(cadastroAberto: boolean): boolean {
  return cadastroAberto;
}

function criarAuth() {
  const { appUrl, segredoDoAuth, cadastroAberto } = ambienteServidor();

  return betterAuth({
    appName: "Meuproduto",
    baseURL: appUrl,
    secret: segredoDoAuth,
    trustedOrigins: [appUrl],
    telemetry: { enabled: false },
    database: drizzleAdapter(banco(), { provider: "pg", schema: authSchema }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: TAMANHO_MINIMO_DA_SENHA,
      disableSignUp: !cadastroAberto,
      resetPasswordTokenExpiresIn: VALIDADE_DO_LINK_DE_REDEFINICAO_EM_SEGUNDOS,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, token }) => {
        // O link aponta para a tela do app, não para o endpoint do Better Auth.
        const url = `${appUrl}/login/redefinir?token=${encodeURIComponent(token)}`;
        // Depois da resposta: o pedido responde no mesmo tempo exista ou não a
        // conta, e falha do provedor não vira erro na tela (que é neutra).
        after(async () => {
          const envio = await enviarEmail(
            emailDeRedefinicao({
              para: user.email,
              nome: user.name,
              url,
              validadeEmMinutos:
                VALIDADE_DO_LINK_DE_REDEFINICAO_EM_SEGUNDOS / 60,
            })
          );
          if (!envio.ok)
            console.error(
              `[auth] e-mail de redefinição não enviado: ${envio.error.code}`
            );
        });
      },
      // Quem redefiniu escolheu a própria senha: a troca obrigatória acabou.
      onPasswordReset: async ({ user }) => {
        await banco()
          .update(users)
          .set({ mustChangePassword: false })
          .where(eq(users.id, user.id));
      },
    },
    user: {
      additionalFields: {
        // Gravados só pelo servidor (bootstrap, convite, aceite): nenhum vem do navegador.
        mustChangePassword: {
          type: "boolean",
          required: false,
          defaultValue: false,
          input: false,
        },
        termsVersion: { type: "string", required: false, input: false },
        termsAcceptedAt: { type: "date", required: false, input: false },
      },
    },
    databaseHooks: {
      user: {
        create: {
          // Porta única de criação de conta: todo cadastro passa por aqui,
          // inclusive quem chamar o endpoint direto. Quando os convites
          // existirem, é aqui que o convite pendente abre a porta.
          before: async (user) => {
            if (!podeCriarConta(cadastroAberto))
              throw new APIError("FORBIDDEN", {
                code: "CADASTRO_FECHADO",
                message: "O cadastro não está aberto.",
              });
            return { data: user };
          },
        },
      },
    },
    session: {
      expiresIn: SESSAO.expiraEmSegundos,
      updateAge: SESSAO.renovaDepoisDeSegundos,
      // Desligado: cada leitura da sessão vai ao banco, então sessão revogada
      // (sair, troca ou redefinição de senha) deixa de valer na hora.
      cookieCache: { enabled: false },
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 100,
      customRules: LIMITES_DO_AUTH,
    },
    advanced: {
      cookiePrefix: PREFIXO_DOS_COOKIES,
      // https liga Secure (e o prefixo __Secure-); o local roda em http.
      useSecureCookies: appUrl.startsWith("https://"),
    },
    plugins: [
      twoFactor({ issuer: "Meuproduto" }),
      // Por último: grava nos cookies do Next o que os outros plugins puseram
      // na resposta (inclusive o cookie do 2FA pendente).
      nextCookies(),
    ],
  });
}

export type Auth = ReturnType<typeof criarAuth>;
export type SessaoDoAuth = Auth["$Infer"]["Session"];

let instancia: Auth | undefined;

/** O Better Auth, criado na primeira chamada (não no import: ver ambiente.servidor.ts). */
export function auth(): Auth {
  instancia ??= criarAuth();
  return instancia;
}
