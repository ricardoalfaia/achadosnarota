import { expect, type Page } from "@playwright/test";

// Passos de acesso que vários testes repetem. As contas são as do seed
// (`pnpm db:seed`) e as do E2E (`e2e/preparar-banco.mjs`), todas sintéticas.

export const SENHA = "achados123";
export const ASSINANTE = "assinante@achados.local";
export const VISITANTE = "visitante@achados.local";

export const email = (page: Page) => page.locator('input[name="email"]');
export const senha = (page: Page) => page.locator('input[name="senha"]');
export const alerta = (page: Page, texto: string | RegExp) =>
  page.getByRole("alert").filter({ hasText: texto });

export async function apresentar(
  page: Page,
  conta: string,
  segredo = SENHA,
  rota = "/login"
) {
  await page.goto(rota);
  await email(page).fill(conta);
  await senha(page).fill(segredo);
  await page.getByRole("button", { name: "Entrar" }).click();
}

/** Entrou: o cabeçalho troca "Entrar" pelo avatar que leva ao perfil. */
export const logado = (page: Page) =>
  expect(page.getByRole("link", { name: "Meu perfil" })).toBeVisible();

/** A barra de navegação inferior do app. */
export const navegacao = (page: Page) =>
  page.getByRole("navigation", { name: "Navegação principal" });
