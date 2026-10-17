import { expect, test } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test("o manifesto tem nome, cores da marca e ícones instaláveis", async ({
  request,
}) => {
  const resposta = await request.get("/manifest.webmanifest");
  expect(resposta.ok()).toBe(true);
  const manifesto = await resposta.json();
  expect(manifesto.name).toBe("Achados na Rota");
  expect(manifesto.display).toBe("standalone");
  expect(manifesto.theme_color).toBe("#f15a24");
  const tamanhos = manifesto.icons.map((i: { sizes: string }) => i.sizes);
  expect(tamanhos).toEqual(expect.arrayContaining(["192x192", "512x512"]));
  expect(
    manifesto.icons.some((i: { purpose?: string }) => i.purpose === "maskable")
  ).toBe(true);
  for (const icone of manifesto.icons)
    expect((await request.get(icone.src)).ok()).toBe(true);
});

test("o service worker nunca fica em cache do navegador", async ({
  request,
}) => {
  const resposta = await request.get("/sw.js");
  expect(resposta.ok()).toBe(true);
  expect(resposta.headers()["cache-control"]).toContain("no-store");
  expect(resposta.headers()["content-type"]).toContain("javascript");
  // Conservador: não guarda páginas nem /api.
  const codigo = await resposta.text();
  expect(codigo).toContain('url.pathname.startsWith("/api/")');
});

test("a página offline existe e não depende de dado de ninguém", async ({
  page,
}) => {
  await page.goto("/offline");
  await expect(
    page.getByRole("heading", { name: "Você está sem conexão" })
  ).toBeVisible();
});

test("os cabeçalhos de segurança acompanham as páginas", async ({
  request,
}) => {
  const resposta = await request.get("/");
  expect(resposta.headers()["x-content-type-options"]).toBe("nosniff");
  expect(resposta.headers()["x-frame-options"]).toBe("DENY");
});
