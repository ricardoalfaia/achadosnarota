import { randomBytes } from "node:crypto";
import { expect, test } from "@playwright/test";

import { alerta, ASSINANTE, logado } from "./apoio/acesso";

test.use({ storageState: { cookies: [], origins: [] } });

test("criar conta entra no app e volta para onde a pessoa estava", async ({
  page,
}) => {
  const conta = `cadastro-${randomBytes(4).toString("hex")}@teste.achados.local`;
  await page.goto("/cadastro?voltar=%2Ffavoritos");

  await page.locator('input[name="nome"]').fill("Pessoa de Teste");
  await page.locator('input[name="email"]').fill(conta);
  await page.locator('input[name="senha"]').fill("Uma-Senha-Forte-1");
  await page.getByRole("checkbox", { name: /Li e aceito/ }).check();
  await page.getByRole("button", { name: "Criar conta" }).click();

  await expect(page).toHaveURL(/\/favoritos$/);
  await logado(page);
  await page.goto("/perfil");
  await expect(
    page.getByRole("heading", { name: "Pessoa de Teste", level: 1 })
  ).toBeVisible();
});

test("sem aceitar os termos não cria a conta", async ({ page }) => {
  await page.goto("/cadastro");
  await page.locator('input[name="nome"]').fill("Pessoa de Teste");
  await page
    .locator('input[name="email"]')
    .fill("sem-aceite@teste.achados.local");
  await page.locator('input[name="senha"]').fill("Uma-Senha-Forte-1");
  await page.getByRole("button", { name: "Criar conta" }).click();

  await expect(alerta(page, "aceite os termos")).toBeVisible();
  await expect(page).toHaveURL(/\/cadastro$/);
  // O que foi digitado continua no formulário.
  await expect(page.locator('input[name="nome"]')).toHaveValue(
    "Pessoa de Teste"
  );
});

test("e-mail já cadastrado recebe resposta neutra", async ({ page }) => {
  await page.goto("/cadastro");
  await page.locator('input[name="nome"]').fill("Outra Pessoa");
  await page.locator('input[name="email"]').fill(ASSINANTE);
  await page.locator('input[name="senha"]').fill("Uma-Senha-Forte-1");
  await page.getByRole("checkbox", { name: /Li e aceito/ }).check();
  await page.getByRole("button", { name: "Criar conta" }).click();

  await expect(
    alerta(page, "Se você já tem conta, entre ou recupere a senha")
  ).toBeVisible();
});
