import { expect, test } from "@playwright/test";

test("Ctrl+K leva à busca da faixa do topo", async ({ page }) => {
  await page.goto("/t/escritorio-demo");
  const busca = page.getByRole("searchbox", {
    name: "Buscar documentos, clientes ou modelos...",
  });

  await page.keyboard.press("Control+k");
  await expect(busca).toBeFocused();
});

test("a faixa mostra o espaço de trabalho ativo", async ({ page }) => {
  await page.goto("/t/escritorio-demo");
  // Com um tenant só, o nome aparece sem o menu de troca.
  await expect(
    page.getByRole("banner").getByText("Escritório Demo")
  ).toBeVisible();
  await expect(
    page.getByRole("banner").getByRole("button", { name: "Escritório Demo" })
  ).toHaveCount(0);
});

test("as notificações mostram o contador, filtram e marcam todas como lidas", async ({
  page,
}) => {
  await page.goto("/t/escritorio-demo");
  const sino = page.getByRole("button", { name: /^Notificações/ });
  await expect(sino).toHaveAccessibleName("Notificações (3 não lidas)");

  await sino.click();
  const painel = page.getByRole("dialog", { name: "Notificações" });
  await expect(painel).toBeVisible();
  await expect(painel.getByText("Hoje")).toBeVisible();
  await expect(painel.getByText("Anteriores")).toBeVisible();

  await painel
    .getByRole("button", { name: "Assinaturas", exact: true })
    .click();
  await expect(painel.getByText("Proposta comercial gerada")).toBeHidden();
  await expect(
    painel.getByText("Procuração aguardando assinatura")
  ).toBeVisible();

  await painel.getByRole("button", { name: "Marcar todas como lidas" }).click();
  await expect(sino).toHaveAccessibleName("Notificações (0 não lidas)");

  await page.keyboard.press("Escape");
  await expect(painel).toBeHidden();
});

test("em tela estreita, o botão da faixa esconde e traz de volta o menu lateral", async ({
  page,
}) => {
  await page.setViewportSize({ width: 800, height: 900 });
  await page.goto("/t/escritorio-demo");
  const menu = page.getByRole("complementary", { name: "Menu lateral" });
  const alternar = page.getByRole("button", {
    name: "Mostrar ou esconder o menu lateral",
  });

  await expect(menu).toBeVisible();
  await alternar.click();
  await expect(menu).toBeHidden();
  await alternar.click();
  await expect(menu).toBeVisible();
});
