import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://127.0.0.1:4531",
    // Endereço sem idioma segue o idioma do navegador; os testes usam português.
    locale: "pt-BR",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Sem --hostname: com ele, o proxy de idiomas redireciona para "localhost",
    // outra origem para quem abriu 127.0.0.1.
    command: "pnpm start --port 4531",
    url: "http://127.0.0.1:4531",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
