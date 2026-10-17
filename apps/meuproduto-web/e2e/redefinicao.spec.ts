import { expect, test } from "@playwright/test";

import { alerta, apresentar, noPainel, SENHA } from "./apoio/acesso";
import { emailsPara, linkDeRedefinicao } from "./apoio/caixa";

test.use({ storageState: { cookies: [], origins: [] } });

const CONTA = "redefinir@meuproduto.local";
const NOVA = "Outra-Senha-Forte-2";

test("o pedido responde igual exista ou não a conta, e só a conta real recebe o link", async ({
  page,
}) => {
  for (const conta of ["ninguem-aqui@meuproduto.local", CONTA]) {
    await page.goto("/login/esqueci-a-senha");
    await page.getByLabel("E-mail").fill(conta);
    await page.getByRole("button", { name: "Enviar instruções" }).click();
    await expect(
      page.getByRole("heading", { name: "Pedido registrado", level: 2 })
    ).toBeVisible();
  }

  await expect.poll(() => linkDeRedefinicao(CONTA)).toBeTruthy();
  expect(emailsPara("ninguem-aqui@meuproduto.local")).toHaveLength(0);
  const link = linkDeRedefinicao(CONTA)!;

  // Uma sessão aberta antes da redefinição, em outro navegador.
  const outro = await page.context().browser()!.newContext();
  const antes = await outro.newPage();
  await apresentar(antes, CONTA);
  await noPainel(antes);

  await page.goto(link);
  await expect(
    page.getByRole("heading", { name: "Nova senha", level: 2 })
  ).toBeVisible();
  await page.getByLabel("Nova senha", { exact: true }).fill(NOVA);
  await page.getByLabel("Confirmar nova senha", { exact: true }).fill(NOVA);
  await page.getByRole("button", { name: "Salvar nova senha" }).click();
  await expect(
    page.getByRole("heading", { name: "Senha redefinida", level: 2 })
  ).toBeVisible();

  // A sessão de antes foi encerrada pela redefinição.
  await antes.reload();
  await expect(antes).toHaveURL(/\/login$/);
  await outro.close();

  // O link vale uma vez só.
  await page.goto(link);
  await page.getByLabel("Nova senha", { exact: true }).fill(NOVA);
  await page.getByLabel("Confirmar nova senha", { exact: true }).fill(NOVA);
  await page.getByRole("button", { name: "Salvar nova senha" }).click();
  await expect(alerta(page, "inválido ou já venceu")).toBeVisible();

  // A senha antiga não entra mais; a nova, sim.
  await apresentar(page, CONTA, SENHA);
  await expect(alerta(page, "E-mail ou senha inválidos.")).toBeVisible();
  await apresentar(page, CONTA, NOVA);
  await noPainel(page);
});

test("link sem token mostra o aviso e o caminho para pedir outro", async ({
  page,
}) => {
  await page.goto("/login/redefinir");
  await expect(alerta(page, "inválido ou já venceu")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Pedir um novo link" })
  ).toBeVisible();
});
