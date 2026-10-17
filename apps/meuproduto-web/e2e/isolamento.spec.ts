import { expect, test } from "@playwright/test";

import { apresentar, indicadorDeClientes, noPainel } from "./apoio/acesso";

// Isolamento entre tenants (aceite do M1, docs/produto/08). O seed tem dois
// tenants com 3 clientes cada; operador@ só tem vínculo com o escritorio-demo.
test.use({ storageState: { cookies: [], origins: [] } });

test("quem é só do tenant A recebe 404 no tenant B, igual a um tenant que não existe", async ({
  page,
}) => {
  await apresentar(page, "operador@meuproduto.local");
  await expect(page).toHaveURL(/\/t\/escritorio-demo$/);
  await noPainel(page);
  await expect(indicadorDeClientes(page)).toContainText("3");

  for (const rota of [
    "/t/escritorio-teste",
    "/t/escritorio-teste/clientes",
    "/t/nao-existe",
  ]) {
    const resposta = await page.goto(rota);
    expect(resposta?.status(), rota).toBe(404);
    await expect(page.getByText("Escritório Teste")).toHaveCount(0);
  }
});

test("quem tem os dois tenants troca pelo seletor e cada um mostra os próprios 3 clientes", async ({
  page,
}) => {
  await apresentar(page, "multi@meuproduto.local");
  await expect(page).toHaveURL(/\/t\/escritorio-demo$/);
  await expect(indicadorDeClientes(page)).toContainText("3");

  // A troca mantém a tela: de Documentos em um para Documentos no outro.
  await page
    .getByRole("navigation", { name: "Menu principal" })
    .getByRole("link", { name: "Documentos", exact: true })
    .click();
  await expect(page).toHaveURL(/\/t\/escritorio-demo\/documentos$/);
  const banner = page.getByRole("banner");
  await banner.getByRole("button", { name: "Escritório Demo" }).click();
  await page.getByRole("menuitem", { name: "Escritório Teste" }).click();
  await expect(page).toHaveURL(/\/t\/escritorio-teste\/documentos$/);

  await page.goto("/t/escritorio-teste");
  await expect(indicadorDeClientes(page)).toContainText("3");
  await expect(
    banner.getByRole("button", { name: "Escritório Teste" })
  ).toBeVisible();
});
