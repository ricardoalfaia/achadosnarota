import { expect, test } from "@playwright/test";

const BASE = "/t/escritorio-demo";

const ITENS = [
  ["Início", ""],
  ["Documentos", "/documentos"],
  ["Modelos", "/modelos"],
  ["Assinaturas", "/assinaturas"],
  ["Clientes", "/clientes"],
  ["Equipe", "/equipe"],
  ["Relatórios", "/relatorios"],
  ["Integrações", "/integracoes"],
  ["Configurações", "/configuracoes"],
] as const;

test("o menu lateral leva aos nove itens do tenant e marca só o atual", async ({
  page,
}) => {
  await page.goto(BASE);
  const menu = page.getByRole("navigation", { name: "Menu principal" });
  await expect(menu.getByRole("link")).toHaveCount(ITENS.length);

  for (const [nome, rota] of ITENS) {
    const item = menu.getByRole("link", { name: nome, exact: true });
    await item.click();
    await expect(page).toHaveURL(
      new RegExp(`127\.0\.0\.1:4401${BASE}${rota}$`)
    );
    await expect(item).toHaveAttribute("aria-current", "page");
    await expect(menu.locator('[aria-current="page"]')).toHaveCount(1);
    if (rota !== "") {
      await expect(
        page.getByRole("heading", { name: nome, level: 1 })
      ).toBeVisible();
      await expect(page.getByText("Em construção")).toBeVisible();
      await expect(
        page.getByRole("navigation", { name: "Trilha de navegação" })
      ).toContainText(nome);
    }
  }
});

test("endereço fora do menu continua dando 404", async ({ page }) => {
  const resposta = await page.goto(`${BASE}/documentoss`);
  expect(resposta?.status()).toBe(404);
});

test("recolher o menu deixa só os ícones e a escolha vem pronta do servidor", async ({
  page,
}) => {
  await page.goto(BASE);
  const menu = page.getByRole("complementary", { name: "Menu lateral" });
  await expect(menu).toHaveCSS("width", "256px");

  await page.getByRole("button", { name: "Recolher menu" }).click();
  await expect(menu).toHaveCSS("width", "72px");
  // Recolhido, o nome sai da tela mas continua no rótulo do link.
  await expect(menu.getByText("Documentos")).toBeHidden();
  await expect(menu.getByRole("link", { name: "Documentos" })).toBeVisible();

  const resposta = await page.reload();
  expect(await resposta?.text()).toContain("w-18");
  await expect(menu).toHaveCSS("width", "72px");

  await page.getByRole("button", { name: "Expandir menu" }).click();
  await expect(menu).toHaveCSS("width", "256px");
});
