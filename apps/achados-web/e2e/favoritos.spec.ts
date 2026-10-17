import { expect, test } from "@playwright/test";

import { apresentar, logado, VISITANTE } from "./apoio/acesso";

test.describe("sem conta", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("o coração leva ao login e volta para a mesma tela", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("button", { name: "Salvar Mirante do Vale nos favoritos" })
      .click();
    await expect(page).toHaveURL(/\/login\?voltar=%2F$|\/login$/);
  });

  test("a tela de favoritos convida a entrar", async ({ page }) => {
    await page.goto("/favoritos");
    await expect(
      page.getByRole("heading", {
        name: "Salve os lugares que você quer conhecer",
      })
    ).toBeVisible();
  });
});

test.describe("isolamento entre pessoas", () => {
  // Sessão própria do visitante; a da assinante vem do setup.
  test.use({ storageState: { cookies: [], origins: [] } });

  test("o visitante salva e tira um favorito, e nunca vê os da assinante", async ({
    page,
  }) => {
    await apresentar(page, VISITANTE, undefined, "/login?voltar=%2Ffavoritos");
    await expect(page).toHaveURL(/\/favoritos$/);
    await logado(page);
    // A assinante tem Rancho Português e Café da Serra; o visitante, nada.
    await expect(
      page.getByRole("heading", { name: "Nenhum favorito salvo ainda" })
    ).toBeVisible();

    await page.goto("/");
    const coracao = page.getByRole("button", {
      name: "Salvar Mirante do Vale nos favoritos",
    });
    // O coração marca na hora (otimismo); a gravação termina com a resposta.
    const gravou = page.waitForResponse((r) => r.request().method() === "POST");
    await coracao.click();
    await gravou;
    await expect(
      page.getByRole("button", { name: "Tirar Mirante do Vale dos favoritos" })
    ).toHaveAttribute("aria-pressed", "true");

    await page.goto("/favoritos");
    const lista = page.getByRole("main").getByRole("listitem");
    await expect(lista).toHaveCount(1);
    await expect(lista).toContainText("Mirante do Vale");
    await expect(page.getByText("Rancho Português")).toHaveCount(0);

    // Tirar na própria tela de favoritos; recarregada, a lista fica vazia.
    const resposta = page.waitForResponse(
      (r) => r.request().method() === "POST"
    );
    await page
      .getByRole("button", { name: "Tirar Mirante do Vale dos favoritos" })
      .click();
    await resposta;
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Nenhum favorito salvo ainda" })
    ).toBeVisible();
  });
});

test("a assinante vê os próprios favoritos do seed", async ({ page }) => {
  await page.goto("/favoritos");
  const lista = page.getByRole("main").getByRole("listitem");
  await expect(lista).toHaveCount(2);
  await expect(lista.filter({ hasText: "Rancho Português" })).toHaveCount(1);
  await expect(lista.filter({ hasText: "Café da Serra" })).toHaveCount(1);
});
