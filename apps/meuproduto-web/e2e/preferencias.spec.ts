import { expect, test, type Page } from "@playwright/test";

/** Abre o menu do usuário pelo avatar da faixa do topo. */
async function abrirMenuDoUsuario(page: Page) {
  await page.getByRole("button", { name: /Admin Demo/ }).click();
  const menu = page.getByRole("dialog", { name: /Menu do usuário|User menu/ });
  await expect(menu).toBeVisible();
  return menu;
}

const fundoDaPagina = (page: Page) =>
  page
    .locator("body")
    .evaluate((corpo) => getComputedStyle(corpo).backgroundColor);

test("a escolha de tema vale na hora e o servidor a mantém ao recarregar", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/t/escritorio-demo");
  const html = page.locator("html");
  await expect(html).not.toHaveAttribute("data-theme");
  const fundoClaro = await fundoDaPagina(page);

  const menu = await abrirMenuDoUsuario(page);
  await menu.getByRole("radio", { name: "Escuro" }).check();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect.poll(() => fundoDaPagina(page)).not.toBe(fundoClaro);

  // O HTML que chega do servidor já vem no tema escolhido: sem piscar no claro.
  const resposta = await page.reload();
  expect(await resposta?.text()).toContain('data-theme="dark"');
  const menuDeNovo = await abrirMenuDoUsuario(page);
  await expect(menuDeNovo.getByRole("radio", { name: "Escuro" })).toBeChecked();

  await menuDeNovo.getByRole("radio", { name: "Auto" }).check();
  await expect(html).not.toHaveAttribute("data-theme");
});

test("trocar o idioma no menu traduz a tela e continua valendo ao recarregar", async ({
  page,
}) => {
  await page.goto("/t/escritorio-demo");
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");

  const menu = await abrirMenuDoUsuario(page);
  await expect(menu.getByRole("radio", { name: "Português" })).toBeChecked();
  await menu.getByRole("radio", { name: "English" }).check();

  const tituloEmIngles = page.getByRole("heading", {
    name: /Your documents/,
    level: 1,
  });
  await expect(tituloEmIngles).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(menu).toContainText("Theme");
  await expect(menu.getByRole("radio", { name: "English" })).toBeChecked();

  const resposta = await page.reload();
  expect(await resposta?.text()).toContain('lang="en"');
  await expect(tituloEmIngles).toBeVisible();

  // Volta para o português, para não deixar o navegador do teste em inglês.
  const menuDeNovo = await abrirMenuDoUsuario(page);
  await menuDeNovo.getByRole("radio", { name: "Português" }).check();
  await expect(
    page.getByRole("heading", { name: /Seus documentos/, level: 1 })
  ).toBeVisible();
});
