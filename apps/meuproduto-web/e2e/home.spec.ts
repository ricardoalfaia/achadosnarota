import { expect, test } from "@playwright/test";

import { indicadorDeClientes } from "./apoio/acesso";

test("o painel inicial renderiza sem erro no navegador", async ({ page }) => {
  const errors: Error[] = [];
  page.on("pageerror", (error) => errors.push(error));

  const response = await page.goto("/t/escritorio-demo");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Meuproduto");
  await expect(
    page.getByRole("heading", { name: /Seus documentos/, level: 1 })
  ).toBeVisible();
  await expect(page.getByText("Olá, Admin 👋")).toBeVisible();
  expect(errors).toEqual([]);
});

test("o painel mostra indicadores, documentos recentes, ações e modelos", async ({
  page,
}) => {
  await page.goto("/t/escritorio-demo");

  const indicadores = page.getByRole("list", { name: "Indicadores do mês" });
  await expect(indicadores.getByRole("link")).toHaveCount(4);
  await expect(indicadores).toContainText("Documentos");
  await expect(indicadores).toContainText("Pendentes");
  // O total de clientes vem do banco (3 no seed), não do dado sintético.
  await expect(indicadorDeClientes(page)).toContainText("3");

  const recentes = page.getByRole("region", { name: "Documentos recentes" });
  await expect(recentes.getByRole("row")).toHaveCount(6);
  await expect(recentes.getByText("Assinado").first()).toBeVisible();
  await expect(recentes.getByText("Em andamento")).toBeVisible();
  await expect(recentes.getByText("Aguardando")).toBeVisible();
  await expect(recentes.getByText("Rascunho")).toBeVisible();

  const acoes = page.getByRole("region", { name: "Ações rápidas" });
  await expect(acoes.getByRole("link")).toHaveCount(4);

  const modelos = page.getByRole("region", { name: "Modelos mais usados" });
  await expect(modelos.getByText("12 usos")).toBeVisible();
});

test("as ações do painel levam às telas do tenant", async ({ page }) => {
  await page.goto("/t/escritorio-demo");

  await page.getByRole("link", { name: "Gerar documento" }).click();
  await expect(page).toHaveURL(/\/t\/escritorio-demo\/documentos$/);

  await page.goto("/t/escritorio-demo");
  await page
    .getByRole("region", { name: "Ações rápidas" })
    .getByRole("link", { name: /Adicionar cliente/ })
    .click();
  await expect(page).toHaveURL(/\/t\/escritorio-demo\/clientes$/);
  await expect(page.getByText("Em construção")).toBeVisible();
});
