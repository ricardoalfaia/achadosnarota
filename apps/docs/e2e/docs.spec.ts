import { expect, test } from "@playwright/test";

test("a página inicial abre em português e leva à documentação", async ({
  page,
}) => {
  const errors: Error[] = [];
  page.on("pageerror", (error) => errors.push(error));

  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await page.getByRole("link", { name: "Começar a ler" }).click();

  await expect(page).toHaveURL(/\/pt-BR\/docs$/);
  await expect(
    page.getByRole("heading", { name: "Visão geral", level: 1 })
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("a página inicial mostra a marca e as áreas do menu em construção", async ({
  page,
}) => {
  await page.goto("/pt-BR");

  await expect(
    page.getByRole("img", { name: "Achados na Rota" }).first()
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Descubra lugares que valem a pena.",
      level: 1,
    })
  ).toBeVisible();
  const areas = page.getByRole("link", { name: /Em construção/ });
  await expect(areas).toHaveCount(4);
  await expect(areas.first()).toContainText("Explorar");
});

test("páginas abertas direto pelo endereço hidratam sem erro", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/pt-BR/docs/primeiros-passos/preferencias");
  await expect(
    page.getByRole("heading", { name: "Preferências", level: 1 })
  ).toBeVisible();

  await page.goto("/en/docs/primeiros-passos/preferencias");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("heading", { name: "Preferences", level: 1 })
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("página sem tradução aparece em português no site em inglês", async ({
  page,
}) => {
  await page.goto("/en/docs/modulos");

  await expect(
    page.getByRole("heading", { name: "Módulos", level: 1 })
  ).toBeVisible();
});

test("a busca encontra uma página pelo conteúdo", async ({ request }) => {
  const resposta = await request.get("/api/search?query=tema&locale=pt-BR");

  expect(resposta.status()).toBe(200);
  const resultados = (await resposta.json()) as { url: string }[];
  expect(
    resultados.some((r) => r.url.includes("/primeiros-passos/preferencias"))
  ).toBe(true);
});

test("a busca da página inicial abre a janela de busca", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Buscar na documentação" }).click();

  await expect(page.getByRole("dialog")).toBeVisible();
});

test("trocar de idioma leva à mesma página em inglês, sem erro", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (mensagem) => {
    if (mensagem.type() === "error") errors.push(mensagem.text());
  });

  await page.goto("/pt-BR/docs/primeiros-passos/preferencias");
  await page.getByRole("button", { name: "Escolher idioma" }).click();
  await page.getByRole("button", { name: "English" }).click();

  await expect(page).toHaveURL(/\/en\/docs\/primeiros-passos\/preferencias$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("heading", { name: "Preferences", level: 1 })
  ).toBeVisible();
  expect(errors).toEqual([]);
});
