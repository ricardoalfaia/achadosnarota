import { expect, type Page } from "@playwright/test";

import { codigoTotp } from "./totp";

// Passos de acesso que vários testes repetem. As contas são as do seed
// (`pnpm db:seed`) e as do E2E (`e2e/preparar-banco.mjs`), todas sintéticas.

export const SENHA = "meuproduto123";

export const email = (page: Page) => page.getByLabel("E-mail", { exact: true });
export const senha = (page: Page) => page.getByLabel("Senha", { exact: true });
export const alerta = (page: Page, texto: string | RegExp) =>
  page.getByRole("alert").filter({ hasText: texto });

export async function apresentar(page: Page, conta: string, segredo = SENHA) {
  await page.goto("/login");
  await email(page).fill(conta);
  await senha(page).fill(segredo);
  await page.getByRole("button", { name: "Entrar" }).click();
}

export const noPainel = (page: Page) =>
  expect(
    page.getByRole("heading", { name: /Seus documentos/, level: 1 })
  ).toBeVisible();

/**
 * Na etapa obrigatória do autenticador: confirma a senha, lê a chave mostrada
 * (como faria o aplicativo) e ativa com o código gerado a partir dela.
 */
export async function configurarAutenticador(
  page: Page,
  segredo = SENHA
): Promise<string> {
  await expect(
    page.getByRole("heading", { name: "Configure o autenticador", level: 2 })
  ).toBeVisible();
  await senha(page).fill(segredo);
  await page.getByRole("button", { name: "Continuar" }).click();

  const chave = (
    await page.getByTestId("chave-do-autenticador").textContent()
  )?.trim();
  if (!chave) throw new Error("a tela não mostrou a chave do autenticador");
  await expect(
    page
      .getByRole("region", { name: "Códigos de recuperação" })
      .getByRole("listitem")
  ).toHaveCount(10);

  await page.getByLabel("Código de verificação").fill(codigoTotp(chave));
  await page.getByRole("button", { name: "Ativar e entrar" }).click();
  return chave;
}

/** Na etapa do segundo fator, o código atual do autenticador. */
export async function informarCodigo(page: Page, chave: string) {
  await expect(
    page.getByRole("heading", { name: "Verificação em duas etapas", level: 2 })
  ).toBeVisible();
  await page.getByLabel("Código de verificação").fill(codigoTotp(chave));
  await page.getByRole("button", { name: "Confirmar" }).click();
}

/** O valor do indicador "Clientes" do painel. */
export function indicadorDeClientes(page: Page) {
  return page
    .getByRole("list", { name: "Indicadores do mês" })
    .getByRole("listitem")
    .filter({ hasText: "Clientes" });
}
