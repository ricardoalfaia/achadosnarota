import { expect, test } from "@playwright/test";

import { apresentar, noPainel } from "./apoio/acesso";

test("o cookie da sessão é HttpOnly, Lax e invisível para o JavaScript da página", async ({
  page,
  context,
}) => {
  await page.goto("/t/escritorio-demo");
  const cookie = (await context.cookies()).find(
    (c) => c.name === "meuproduto.session_token"
  );

  expect(cookie).toBeDefined();
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.sameSite).toBe("Lax");
  // O cookie é o token opaco assinado: nada do usuário em claro.
  expect(cookie?.value).not.toContain("admin@");
  expect(await page.evaluate(() => document.cookie)).not.toContain(
    "session_token"
  );
});

test("nada do token chega ao HTML nem aos dados da página", async ({
  page,
  context,
}) => {
  const resposta = await page.goto("/t/escritorio-demo");
  const html = (await resposta?.text()) ?? "";
  const token = (await context.cookies())
    .find((c) => c.name === "meuproduto.session_token")
    ?.value.split(".")[0];

  expect(html).toContain("Admin Demo");
  expect(token && token.length > 10).toBe(true);
  expect(html).not.toContain(token!);
});

test("com sessão, a tela de login e a raiz levam direto ao tenant", async ({
  page,
}) => {
  await page.goto("/login");
  await expect(page).toHaveURL(/127\.0\.0\.1:4401\/t\/escritorio-demo$/);
  await noPainel(page);

  await page.goto("/");
  await expect(page).toHaveURL(/\/t\/escritorio-demo$/);
});

test.describe("sair", () => {
  // Sessão própria: sair revoga a sessão no banco, e a do setup é compartilhada.
  test.use({ storageState: { cookies: [], origins: [] } });

  test("sair volta ao login e a sessão deixa de valer, mesmo com o cookie antigo", async ({
    page,
    context,
  }) => {
    await apresentar(page, "operador@meuproduto.local");
    await noPainel(page);
    const antigo = (await context.cookies()).find(
      (c) => c.name === "meuproduto.session_token"
    );
    expect(antigo).toBeDefined();

    await page.getByRole("button", { name: /Operador Demo/ }).click();
    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.goto("/t/escritorio-demo/documentos");
    await expect(page).toHaveURL(/\/login$/);

    // Revogada no servidor: devolver o cookie antigo ao navegador não reabre.
    await context.addCookies([antigo!]);
    await page.goto("/t/escritorio-demo");
    await expect(page).toHaveURL(/\/login$/);
  });
});
