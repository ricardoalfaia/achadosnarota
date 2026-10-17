import { expect, test } from "@playwright/test";

test("o avatar abre o menu do usuário, que troca o tema e o idioma", async ({
  page,
}) => {
  await page.goto("/t/escritorio-demo");
  const avatar = page.getByRole("button", { name: /Admin Demo/ });
  const menu = page.getByRole("dialog", { name: /Menu do usuário|User menu/ });

  await expect(avatar).toContainText("AD");
  await avatar.click();
  await expect(menu).toBeVisible();
  await expect(menu).toContainText("Admin Demo");
  await expect(menu).toContainText("admin@meuproduto.local");
  await expect(menu).toContainText("Organização Demo");

  await menu.getByRole("radio", { name: "Escuro" }).check();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await menu.getByRole("radio", { name: "Auto" }).check();

  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(avatar).toBeFocused();

  // O idioma troca no mesmo menu, sem sair da tela.
  await avatar.click();
  await menu.getByRole("radio", { name: "English" }).check();
  await expect(menu).toContainText("Sign out");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await menu.getByRole("radio", { name: "Português" }).check();
  await expect(menu).toContainText("Sair");
});

test("as notas de versão abrem pelo menu do usuário", async ({ page }) => {
  await page.goto("/t/escritorio-demo");
  const notas = page.getByRole("dialog", { name: "Notas de versão" });

  await page.getByRole("button", { name: /Admin Demo/ }).click();
  await page.getByRole("button", { name: /Notas de versão/ }).click();

  await expect(notas).toBeVisible();
  await expect(notas).toContainText("Versão 0.1.0");
  await notas.getByRole("button", { name: "Entendido" }).click();
  await expect(notas).toBeHidden();
});
