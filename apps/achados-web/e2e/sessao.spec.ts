import { expect, test } from "@playwright/test";

import { apresentar, logado, VISITANTE } from "./apoio/acesso";

test("o cookie da sessão é HttpOnly, Lax e invisível para o JavaScript da página", async ({
  page,
  context,
}) => {
  await page.goto("/");
  const cookie = (await context.cookies()).find(
    (c) => c.name === "achados.session_token"
  );

  expect(cookie).toBeDefined();
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.sameSite).toBe("Lax");
  // O cookie é o token opaco assinado: nada da pessoa em claro.
  expect(cookie?.value).not.toContain("assinante@");
  expect(await page.evaluate(() => document.cookie)).not.toContain(
    "session_token"
  );
});

test("nada do token nem do e-mail chega ao HTML", async ({ page, context }) => {
  const resposta = await page.goto("/perfil");
  const html = (await resposta?.text()) ?? "";
  const token = (await context.cookies())
    .find((c) => c.name === "achados.session_token")
    ?.value.split(".")[0];

  expect(html).toContain("Ana Viajante");
  expect(token && token.length > 10).toBe(true);
  expect(html).not.toContain(token!);
  expect(html).not.toContain("assinante@achados.local");
});

test("com sessão, a tela de login volta para o app", async ({ page }) => {
  await page.goto("/login?voltar=%2Fpassaporte");
  await expect(page).toHaveURL(/\/passaporte$/);
});

test.describe("sem sessão", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("o perfil exige conta e volta para ele depois de entrar", async ({
    page,
  }) => {
    await page.goto("/perfil");
    await expect(page).toHaveURL(/\/login\?voltar=%2Fperfil$/);
  });

  test("um cookie de sessão inventado não abre nada", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: "achados.session_token",
        value: "token-inventado.assinatura-falsa",
        url: "http://127.0.0.1:4501",
      },
    ]);
    await page.goto("/perfil");
    await expect(page).toHaveURL(/\/login\?voltar=%2Fperfil$/);
  });

  test("o destino de volta não pode ser outro site", async ({ page }) => {
    await apresentar(
      page,
      VISITANTE,
      undefined,
      "/login?voltar=%2F%2Fmalicioso.example"
    );
    await expect(page).toHaveURL(/127\.0\.0\.1:4501\/$/);
  });

  test("sair encerra a sessão, mesmo com o cookie antigo devolvido", async ({
    page,
    context,
  }) => {
    await apresentar(page, VISITANTE, undefined, "/login?voltar=%2Fperfil");
    await expect(page).toHaveURL(/\/perfil$/);
    const antigo = (await context.cookies()).find(
      (c) => c.name === "achados.session_token"
    );
    expect(antigo).toBeDefined();

    await page.getByRole("button", { name: "Sair da conta" }).click();
    await expect(page).toHaveURL(/127\.0\.0\.1:4501\/$/);
    await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible();

    // Revogada no servidor: devolver o cookie antigo não reabre.
    await context.addCookies([antigo!]);
    await page.goto("/perfil");
    await expect(page).toHaveURL(/\/login/);
  });

  test("depois de entrar, o avatar leva ao perfil", async ({ page }) => {
    await apresentar(page, VISITANTE);
    await logado(page);
    await page.getByRole("link", { name: "Meu perfil" }).click();
    await expect(
      page.getByRole("heading", { name: "Bruno Estradeiro", level: 1 })
    ).toBeVisible();
  });
});
