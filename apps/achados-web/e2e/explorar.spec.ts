import { expect, test } from "@playwright/test";

import { navegacao } from "./apoio/acesso";

// A exploração e a ficha são públicas: estes testes começam sem sessão.
test.use({ storageState: { cookies: [], origins: [] } });

test("a página inicial mostra a marca, a busca, as categorias e os destaques, sem erro", async ({
  page,
}) => {
  const erros: Error[] = [];
  page.on("pageerror", (erro) => erros.push(erro));

  const resposta = await page.goto("/");

  expect(resposta?.status()).toBe(200);
  await expect(page).toHaveTitle(/Achados na Rota/);
  await expect(
    page.getByRole("link", { name: "Achados na Rota, início" })
  ).toBeVisible();
  await expect(
    page.getByRole("searchbox", { name: /Buscar lugares/ })
  ).toBeVisible();
  const categorias = page.getByRole("navigation", { name: "Categorias" });
  await expect(categorias.getByRole("link", { name: "Todas" })).toHaveAttribute(
    "aria-current",
    "page"
  );
  await expect(
    page.getByRole("heading", { name: "Destaques da Rota", level: 2 })
  ).toBeVisible();
  // Os seis lugares publicados do seed.
  await expect(page.getByRole("article")).toHaveCount(6);
  await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible();
  await expect(navegacao(page).getByRole("link")).toHaveCount(4);
  expect(erros).toEqual([]);
});

test("a categoria filtra pela URL e pode ser desfeita", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Categorias" })
    .getByRole("link", { name: "Cafés" })
    .click();

  await expect(page).toHaveURL(/\?categoria=cafes$/);
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article")).toContainText("Café da Serra");

  await page.getByRole("link", { name: "Ver todos" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("article")).toHaveCount(6);
});

test("a busca filtra por cidade enquanto se digita", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("searchbox", { name: /Buscar lugares/ })
    .fill("Pindamonhangaba");

  await expect(page).toHaveURL(/q=Pindamonhangaba/);
  await expect(page.getByRole("article")).toHaveCount(2);
});

test("busca sem resultado mostra o aviso e o caminho de volta", async ({
  page,
}) => {
  await page.goto("/?q=lugar-que-nao-existe");
  await expect(
    page.getByRole("heading", { name: "Nenhum lugar encontrado" })
  ).toBeVisible();
  await page.getByRole("link", { name: "Ver todos os lugares" }).click();
  await expect(page.getByRole("article")).toHaveCount(6);
});

test("filtro inválido na URL é ignorado, não quebra a página", async ({
  page,
}) => {
  const resposta = await page.goto("/?categoria=%27%3B%20drop&cidade=%3Cx%3E");
  expect(resposta?.status()).toBe(200);
  await expect(page.getByRole("article")).toHaveCount(6);
});

test("o cartão leva à ficha do lugar", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Rancho Português" }).click();

  await expect(page).toHaveURL(/\/lugar\/rancho-portugues$/);
  await expect(
    page.getByRole("heading", { name: "Rancho Português", level: 1 })
  ).toBeVisible();
});

test("a ficha mostra curadoria, ações, benefícios com regras e as outras abas", async ({
  page,
}) => {
  await page.goto("/lugar/rancho-portugues");

  await expect(page.getByText("Curadoria Achados na Rota")).toBeVisible();
  await expect(page.getByLabel("Nota 4,8 de 5").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Ligar para/ })).toHaveAttribute(
    "href",
    /^tel:\+55/
  );
  await expect(page.getByRole("link", { name: "Como chegar" })).toHaveAttribute(
    "href",
    /google\.com\/maps\/search/
  );

  const beneficios = page.getByRole("region", {
    name: "Benefícios exclusivos",
  });
  await expect(beneficios.getByRole("listitem")).toHaveCount(2);
  await expect(beneficios).toContainText("Válido de segunda a sexta");

  await page.getByRole("tab", { name: "Avaliações" }).click();
  await expect(page.getByText(/Visita da curadoria em/)).toBeVisible();
  await expect(
    page
      .getByRole("tabpanel")
      .getByText(/não pagam por notas, selos ou posição/)
  ).toBeVisible();

  await page.getByRole("tab", { name: "Fotos" }).click();
  await expect(page.getByRole("tabpanel").getByRole("img")).toHaveCount(4);

  await page.getByRole("tab", { name: "Sobre" }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Pindamonhangaba");
});

test("o total de fotos do topo abre a aba de fotos", async ({ page }) => {
  await page.goto("/lugar/rancho-portugues");
  await page.getByRole("link", { name: "4 fotos" }).click();
  await expect(page).toHaveURL(/\?aba=fotos$/);
  await expect(page.getByRole("tab", { name: "Fotos" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
});

test("lugar inexistente responde 404 com o caminho de volta", async ({
  page,
}) => {
  const resposta = await page.goto("/lugar/nao-existe");
  expect(resposta?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Lugar não encontrado" })
  ).toBeVisible();
});

test("sem conta, Resgatar pede para entrar e leva de volta à ficha", async ({
  page,
}) => {
  await page.goto("/lugar/rancho-portugues");
  await page.getByRole("button", { name: "Resgatar" }).first().click();

  const dialogo = page.getByRole("dialog", {
    name: "10% de desconto no almoço",
  });
  await expect(dialogo).toContainText("Regras:");
  await dialogo.getByRole("link", { name: "Entrar para resgatar" }).click();
  await expect(page).toHaveURL(/\/login\?voltar=%2Flugar%2Francho-portugues$/);
});

test("o botão central abre o leitor, que avisa que a leitura ainda não existe", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Abrir o leitor do passaporte" })
    .click();
  const leitor = page.getByRole("dialog", { name: "Leitor do Passaporte" });
  await expect(leitor).toContainText("chega junto com o resgate");
  await leitor.getByRole("button", { name: "Fechar" }).click();
  await expect(leitor).toBeHidden();
});

test("trocar de categoria não recarrega a página e voltar usa o cache", async ({
  page,
}) => {
  await page.goto("/");
  const pedidos: string[] = [];
  page.on("request", (pedido) => {
    if (pedido.resourceType() === "document") pedidos.push("documento");
    if (pedido.url().includes("/api/lugares")) pedidos.push(pedido.url());
  });
  const categorias = page.getByRole("navigation", { name: "Categorias" });

  await categorias.getByRole("link", { name: "Bares" }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page).toHaveURL(/\?categoria=bares$/);

  // "Todas" já veio hidratado do servidor: nenhuma busca nova.
  await categorias.getByRole("link", { name: "Todas" }).click();
  await expect(page.getByRole("article")).toHaveCount(6);

  expect(pedidos.filter((p) => p === "documento")).toHaveLength(0);
  expect(pedidos.filter((p) => p.includes("categoria=bares"))).toHaveLength(1);
  expect(pedidos).toHaveLength(1);
});
