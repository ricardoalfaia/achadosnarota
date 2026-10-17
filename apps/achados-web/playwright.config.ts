import { defineConfig, devices } from "@playwright/test";

import { urlsDoBanco } from "./e2e/apoio/banco";
import { CAIXA_DE_EMAIL } from "./e2e/apoio/caixa";

/** A sessão que o projeto `entrada` grava e os demais testes já começam com ela. */
export const SESSAO_DO_TESTE = "e2e/.auth/sessao.json";

const PORTA = 4501;
const ENDERECO = `http://127.0.0.1:${PORTA}`;

/**
 * O banco próprio do E2E (e2e/apoio/banco.ts) no Postgres do docker-compose,
 * ou no service container da CI, como achados_app: o mesmo papel sujeito a
 * RLS que o app usa. O banco de desenvolvimento não é tocado. O dono das
 * tabelas (DATABASE_URL_ADMIN) só existe nos comandos do global setup
 * (e2e/preparar.ts), nunca no servidor do app.
 */
const { DATABASE_URL } = urlsDoBanco();

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/preparar.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // Um servidor só atende a suíte inteira. Com quatro workers ele satura e
  // testes diferentes estouram o tempo a cada rodada; com dois, a suíte passa
  // estável (medido na base de origem em 11/10/2026).
  workers: process.env.CI ? 1 : 2,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: ENDERECO,
    trace: "retain-on-failure",
  },
  projects: [
    // Entra uma vez como a assinante do seed e guarda a sessão.
    { name: "entrada", testMatch: /sessao\.setup\.ts/ },
    {
      // O app é um PWA mobile-first: a suíte roda num celular (Chromium).
      name: "celular",
      use: { ...devices["Pixel 7"], storageState: SESSAO_DO_TESTE },
      dependencies: ["entrada"],
    },
  ],
  webServer: [
    {
      command: `pnpm start --hostname 127.0.0.1 --port ${PORTA}`,
      url: `${ENDERECO}/login`,
      // O app do teste usa o banco local, um segredo só dele, cadastro aberto
      // (o E2E cria contas) e a caixa de e-mail em arquivo (o link de
      // redefinição sai nela).
      env: {
        APP_URL: ENDERECO,
        DATABASE_URL,
        DATABASE_URL_ADMIN: "",
        BETTER_AUTH_SECRET: "segredo-somente-do-e2e-com-mais-de-32-caracteres",
        SIGNUP_ENABLED: "true",
        RESEND_API_KEY: "",
        EMAIL_CAIXA_DE_TESTE: CAIXA_DE_EMAIL,
      },
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
});
