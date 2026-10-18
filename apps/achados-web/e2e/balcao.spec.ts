import { expect, test } from "@playwright/test";

import { alerta, apresentar, logado } from "./apoio/acesso";

// O ciclo do resgate (ADR-005 de produto): a assinante (sessão do setup) gera o
// código na ficha; a garçonete do seed, vinculada ao Rancho, confirma no
// balcão; a ficha da assinante passa a mostrar o benefício como usado.
const GARCOM = "garcom@achados.local";

test("a assinante gera o código, o garçom confirma e o benefício fica usado no ano", async ({
  page,
  browser,
}) => {
  await page.goto("/lugar/rancho-portugues");
  const beneficios = page.getByRole("region", {
    name: "Benefícios exclusivos",
  });
  // O 2 por 1 fica para o teste do passaporte; aqui, o desconto do almoço.
  await beneficios
    .getByRole("listitem")
    .filter({ hasText: "10% de desconto no almoço" })
    .getByRole("button", { name: "Usar" })
    .click();
  const dialogo = page.getByRole("dialog", {
    name: "10% de desconto no almoço",
  });
  await dialogo
    .getByRole("button", { name: "Estou na casa: gerar código" })
    .click();
  const exibido = await dialogo
    .getByText(/^[2-9A-HJ-NP-Z]{3} [2-9A-HJ-NP-Z]{3}$/)
    .textContent();
  const codigo = exibido!.replace(" ", "");

  // O garçom, em outro aparelho.
  const balcao = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });
  const garcom = await balcao.newPage();
  await apresentar(garcom, GARCOM);
  await logado(garcom);
  await garcom.goto("/balcao");
  // O rádio é visualmente oculto; o rótulo em pílula é o que se toca.
  await garcom.locator("label", { hasText: "Rancho Português" }).click();
  await expect(
    garcom.getByRole("radio", { name: "Rancho Português" })
  ).toBeChecked();
  await garcom
    .getByRole("textbox", { name: "Código que o cliente mostra" })
    .fill(codigo.toLowerCase());
  await garcom.getByRole("button", { name: "Confirmar benefício" }).click();
  await expect(
    garcom.getByRole("heading", { name: "Benefício confirmado" })
  ).toBeVisible();
  await expect(garcom.getByText("10% de desconto no almoço")).toBeVisible();

  // O mesmo código não vale duas vezes.
  await garcom.getByRole("button", { name: "Validar outro código" }).click();
  await garcom
    .getByRole("textbox", { name: "Código que o cliente mostra" })
    .fill(codigo);
  await garcom.getByRole("button", { name: "Confirmar benefício" }).click();
  await expect(alerta(garcom, "Código não encontrado")).toBeVisible();
  await balcao.close();

  // De volta à assinante: usado, com a data em que volta a valer.
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(
    beneficios
      .getByRole("listitem")
      .filter({ hasText: "10% de desconto no almoço" })
  ).toContainText(/Usado · volta em 01\/01\/\d{4}/);

  await page.goto("/passaporte");
  await page.getByRole("tab", { name: /Utilizados \(\d+\)/ }).click();
  await expect(
    page.getByRole("tabpanel").getByText("10% de desconto no almoço")
  ).toBeVisible();
});

test("conta que não opera casa vê que o balcão não é para ela", async ({
  page,
}) => {
  await page.goto("/balcao");
  await expect(
    page.getByRole("heading", { name: "Sua conta não opera nenhuma casa" })
  ).toBeVisible();
});
