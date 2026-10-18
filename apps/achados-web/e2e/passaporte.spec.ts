import { expect, test } from "@playwright/test";

import { apresentar, VISITANTE } from "./apoio/acesso";

test("com passaporte ativo, o cartão mostra a titular, a validade e o código", async ({
  page,
}) => {
  await page.goto("/passaporte");
  const cartao = page.getByRole("region", { name: "Cartão do passaporte" });
  await expect(cartao).toContainText("Passaporte ativo");
  await expect(cartao).toContainText("Ana Viajante");
  await expect(cartao).toContainText(/AR-[0-9A-Z]{6}/);
  await expect(page.getByText("Cupons utilizados")).toBeVisible();
  await expect(
    page.getByRole("tab", { name: /Disponíveis \(8\)/ })
  ).toBeVisible();

  // O histórico é real: o teste do balcão pode ter registrado um uso.
  await expect(
    page.getByRole("tab", { name: /Utilizados \(\d+\)/ })
  ).toBeVisible();
});

test("com passaporte ativo, o 2 por 1 gera um código de uso único com validade", async ({
  page,
}) => {
  await page.goto("/lugar/rancho-portugues");
  const beneficios = page.getByRole("region", {
    name: "Benefícios exclusivos",
  });
  await expect(beneficios).toContainText("1 vez por ano");
  await beneficios.getByRole("button", { name: "Usar" }).first().click();

  const dialogo = page.getByRole("dialog", {
    name: "Compre um prato principal e ganhe outro",
  });
  await dialogo
    .getByRole("button", { name: "Estou na casa: gerar código" })
    .click();
  // O código vem do servidor: 6 caracteres sem ambíguos, em duas metades.
  await expect(
    dialogo.getByText(/^[2-9A-HJ-NP-Z]{3} [2-9A-HJ-NP-Z]{3}$/)
  ).toBeVisible();
  await expect(dialogo.getByRole("timer")).toContainText(/Vale por 0?\d:\d\d/);
  await expect(dialogo).toContainText(
    "O uso só conta quando o garçom confirmar"
  );
});

test.describe("sem passaporte", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("sem conta: cartão inativo, preço do banco, assinatura indisponível", async ({
    page,
  }) => {
    await page.goto("/passaporte");
    await expect(
      page.getByRole("region", { name: "Cartão do passaporte" })
    ).toContainText("Inativo");
    await expect(page.getByText("R$ 129,00")).toBeVisible();
    await expect(page.getByRole("button", { name: "Assinar" })).toBeDisabled();
    await expect(page.getByText("não garante economia")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Criar conta grátis" })
    ).toBeVisible();
  });

  test("com conta e sem passaporte, Resgatar leva a conhecer o passaporte", async ({
    page,
  }) => {
    await apresentar(page, VISITANTE);
    await page.waitForURL((url) => url.pathname === "/");
    await page.goto("/lugar/cafe-da-serra");
    await page.getByRole("button", { name: "Resgatar" }).click();
    await page
      .getByRole("dialog")
      .getByRole("link", { name: "Conhecer o Passaporte" })
      .click();
    await expect(page).toHaveURL(/\/passaporte$/);
  });
});
