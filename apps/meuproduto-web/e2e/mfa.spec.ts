import { expect, test } from "@playwright/test";

import {
  alerta,
  apresentar,
  configurarAutenticador,
  indicadorDeClientes,
  informarCodigo,
  noPainel,
} from "./apoio/acesso";
import { codigoTotp } from "./apoio/totp";

test.use({ storageState: { cookies: [], origins: [] } });

// outro@meuproduto.local é owner do escritorio-teste. O preparo do banco desliga
// o 2FA dele a cada rodada. Um teste só, em série: o estado do autenticador
// passa de uma etapa para a outra.
test("owner sem autenticador não usa o sistema até configurá-lo; depois, entra com o código", async ({
  page,
  context,
}) => {
  await apresentar(page, "outro@meuproduto.local");

  // Com a senha certa há sessão, mas o sistema continua fechado.
  await expect(
    page.getByRole("heading", { name: "Configure o autenticador", level: 2 })
  ).toBeVisible();
  for (const rota of ["/", "/t/escritorio-teste"]) {
    await page.goto(rota);
    await expect(page).toHaveURL(/\/login$/);
  }

  // Senha errada não gera o segredo.
  await page.getByLabel("Senha", { exact: true }).fill("senha-errada");
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(alerta(page, "Senha incorreta")).toBeVisible();

  const chave = await configurarAutenticador(page);
  await expect(page).toHaveURL(/\/t\/escritorio-teste$/);
  await noPainel(page);
  // Isolamento: o escritorio-teste vê os 3 clientes dele, pelo RLS.
  await expect(indicadorDeClientes(page)).toContainText("3");

  // Sai e entra de novo: agora a senha sozinha não basta.
  await page.getByRole("button", { name: /Outro Escritório/ }).click();
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/login$/);

  await apresentar(page, "outro@meuproduto.local");
  await expect(
    page.getByRole("heading", { name: "Verificação em duas etapas", level: 2 })
  ).toBeVisible();
  const cookies = await context.cookies();
  expect(cookies.some((c) => c.name === "meuproduto.session_token")).toBe(
    false
  );
  expect(
    cookies.find((c) => c.name === "meuproduto.two_factor")?.httpOnly
  ).toBe(true);

  const codigo = page.getByLabel("Código de verificação");
  await codigo.fill("12345");
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(alerta(page, "Informe os 6 dígitos do código")).toBeVisible();

  // Um código que certamente não é o atual (o de daqui a 10 minutos).
  await codigo.fill(codigoTotp(chave, Date.now() + 10 * 60_000));
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(alerta(page, "Código incorreto")).toBeVisible();

  await informarCodigo(page, chave);
  await expect(page).toHaveURL(/\/t\/escritorio-teste$/);
  await noPainel(page);
});
