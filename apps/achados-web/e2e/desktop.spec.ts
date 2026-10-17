import { expect, test } from "@playwright/test";

// A versão desktop é o mesmo app a partir de 1024px (ADR-0025).
test.use({
  storageState: { cookies: [], origins: [] },
  viewport: { width: 1440, height: 900 },
  isMobile: false,
  hasTouch: false,
});

test("no desktop, cabeçalho com navegação e rodapé; sem a barra do celular", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("navigation", { name: "Seções" }).getByRole("link")
  ).toHaveCount(5);
  await expect(
    page.getByRole("heading", {
      name: "Descubra lugares que valem a pena",
      level: 1,
    })
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Navegação principal" })
  ).toBeHidden();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Por que usar o Achados na Rota?" })
  ).toBeVisible();
  // Os seis lugares do seed em grade.
  await expect(page.getByRole("article")).toHaveCount(6);
});

test("no desktop, a busca do topo filtra e as categorias de vidro também", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("searchbox", { name: /Buscar lugares/ })
    .fill("Campos do Jordão");
  await page.getByRole("button", { name: "Buscar" }).click();
  await expect(page).toHaveURL(/q=Campos/);
  await expect(page.getByRole("article")).toHaveCount(1);

  await page
    .getByRole("navigation", { name: "Categorias" })
    .getByRole("link", { name: "Todas" })
    .click();
  await page
    .getByRole("navigation", { name: "Categorias" })
    .getByRole("link", { name: "Bares" })
    .click();
  await expect(page).toHaveURL(/categoria=bares/);
});

test("no desktop, a ficha mostra foto e informações lado a lado", async ({
  page,
}) => {
  await page.goto("/lugar/rancho-portugues");
  const titulo = page.getByRole("heading", {
    name: "Rancho Português",
    level: 1,
  });
  const foto = page.getByRole("img", { name: /Salão iluminado/ });
  await expect(titulo).toBeVisible();
  const [caixaDoTitulo, caixaDaFoto] = await Promise.all([
    titulo.boundingBox(),
    foto.boundingBox(),
  ]);
  expect(caixaDoTitulo!.x).toBeGreaterThan(caixaDaFoto!.x + caixaDaFoto!.width);
});
