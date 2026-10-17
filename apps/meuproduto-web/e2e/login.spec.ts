import { expect, test } from "@playwright/test";

import {
  alerta,
  apresentar,
  email,
  noPainel,
  SENHA,
  senha,
} from "./apoio/acesso";

// Estes testes começam sem sessão: é a tela de quem ainda não entrou.
test.use({ storageState: { cookies: [], origins: [] } });

test("a tela de login mostra a marca, o formulário e o painel do Meuproduto", async ({
  page,
}) => {
  const errors: Error[] = [];
  page.on("pageerror", (error) => errors.push(error));

  const response = await page.goto("/login");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Entrar · Meuproduto");
  await expect(
    page.getByRole("heading", { name: "Meuproduto", level: 1 })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Entrar", level: 2 })
  ).toBeVisible();
  await expect(email(page)).toBeVisible();
  await expect(senha(page)).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Seus documentos ganham vida.",
      level: 2,
    })
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("em tela estreita o painel da marca some e o formulário ocupa a tela", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");

  await expect(email(page)).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Seus documentos ganham vida.",
      level: 2,
    })
  ).toBeHidden();
});

test("sem sessão, as telas do sistema levam ao login", async ({ page }) => {
  for (const rota of [
    "/",
    "/t/escritorio-demo",
    "/t/escritorio-demo/documentos",
    "/t/nao-existe/configuracoes",
  ]) {
    await page.goto(rota);
    await expect(page).toHaveURL(/\/login$/);
  }
});

test("um cookie de sessão inventado não abre o sistema nem prende a tela em laço", async ({
  page,
  context,
}) => {
  await context.addCookies([
    {
      name: "meuproduto.session_token",
      value: "token-inventado.assinatura-falsa",
      url: "http://127.0.0.1:4401",
    },
  ]);

  // O proxy deixa passar (há cookie); quem recusa é o servidor, no banco.
  await page.goto("/t/escritorio-demo");

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { name: "Entrar", level: 2 })
  ).toBeVisible();
});

test("enviar sem preencher aponta os campos obrigatórios", async ({ page }) => {
  await page.goto("/login");

  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(alerta(page, "Campo obrigatório")).toHaveCount(2);
});

test("o que não é e-mail é recusado antes de ir ao servidor", async ({
  page,
}) => {
  await apresentar(page, "ana", SENHA);

  await expect(alerta(page, "Informe um e-mail válido")).toBeVisible();
});

test("e-mail ou senha errados recebem a mesma mensagem, sem dizer qual", async ({
  page,
}) => {
  await apresentar(page, "operador@meuproduto.local", "senha-errada");
  await expect(alerta(page, "E-mail ou senha inválidos.")).toBeVisible();

  await apresentar(page, "nao-existe@meuproduto.local", SENHA);
  await expect(alerta(page, "E-mail ou senha inválidos.")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("com e-mail e senha certos, entra no tenant com os dados de quem entrou", async ({
  page,
}) => {
  await apresentar(page, "Operador@Meuproduto.local");

  await expect(page).toHaveURL(/\/t\/escritorio-demo$/);
  await noPainel(page);
  await expect(page.getByText("Olá, Operador 👋")).toBeVisible();
  await page.getByRole("button", { name: /Operador Demo/ }).click();
  const menu = page.getByRole("dialog", { name: "Menu do usuário" });
  await expect(menu).toContainText("operador@meuproduto.local");
  await expect(menu).toContainText("Organização Demo");
});

test("senha provisória obriga a definir uma nova antes de entrar", async ({
  page,
}) => {
  await apresentar(page, "troca@meuproduto.local");

  await expect(
    page.getByRole("heading", { name: "Defina uma nova senha", level: 2 })
  ).toBeVisible();
  // Já há sessão, mas o sistema não abre enquanto a troca não acontece.
  await page.goto("/t/escritorio-demo");
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { name: "Defina uma nova senha", level: 2 })
  ).toBeVisible();

  // Recarregada a tela, a senha atual não está mais na memória: o campo aparece.
  await page.getByLabel("Senha atual", { exact: true }).fill(SENHA);
  const nova = page.getByLabel("Nova senha", { exact: true });
  const confirmacao = page.getByLabel("Confirmar nova senha", { exact: true });
  const salvar = page.getByRole("button", { name: "Salvar e entrar" });

  await nova.fill("Uma-Senha-Forte-1");
  await confirmacao.fill("outra");
  await salvar.click();
  await expect(alerta(page, "As senhas não são iguais")).toBeVisible();

  await page.getByLabel("Senha atual", { exact: true }).fill(SENHA);
  await nova.fill("curta");
  await confirmacao.fill("curta");
  await salvar.click();
  await expect(alerta(page, "pelo menos 10 caracteres")).toBeVisible();

  await page.getByLabel("Senha atual", { exact: true }).fill(SENHA);
  await nova.fill("Uma-Senha-Forte-1");
  await confirmacao.fill("Uma-Senha-Forte-1");
  await salvar.click();
  await expect(page).toHaveURL(/\/t\/escritorio-demo$/);
  await noPainel(page);
});

test("muitas senhas erradas seguidas para a mesma conta travam novas tentativas", async ({
  page,
}) => {
  await page.goto("/login");
  await email(page).fill("alvo-de-forca-bruta@meuproduto.local");
  for (let tentativa = 1; tentativa <= 10; tentativa++) {
    await senha(page).fill(`chute-${tentativa}`);
    const resposta = page.waitForResponse(
      (r) => r.request().method() === "POST"
    );
    await page.getByRole("button", { name: "Entrar" }).click();
    await resposta;
    await expect(alerta(page, "E-mail ou senha inválidos.")).toBeVisible();
  }

  await senha(page).fill("chute-11");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(alerta(page, "Muitas tentativas seguidas")).toBeVisible();
});

test("a senha pode ser mostrada e ocultada", async ({ page }) => {
  await page.goto("/login");
  await senha(page).fill("segredo");
  await expect(senha(page)).toHaveAttribute("type", "password");

  await page.getByRole("button", { name: "Mostrar Senha" }).click();
  await expect(senha(page)).toHaveAttribute("type", "text");

  await page.getByRole("button", { name: "Ocultar Senha" }).click();
  await expect(senha(page)).toHaveAttribute("type", "password");
});

test("o e-mail lembrado volta preenchido na próxima visita", async ({
  page,
}) => {
  await page.goto("/login");
  await email(page).fill("lembrado@meuproduto.local");
  await senha(page).fill("qualquer");
  await page.getByRole("checkbox", { name: "Lembrar meu e-mail" }).check();
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(alerta(page, "E-mail ou senha inválidos.")).toBeVisible();

  await page.goto("/login");

  await expect(email(page)).toHaveValue("lembrado@meuproduto.local");
  await expect(
    page.getByRole("checkbox", { name: "Lembrar meu e-mail" })
  ).toBeChecked();
});

test("esqueci a senha leva à recuperação e volta para o login", async ({
  page,
}) => {
  await page.goto("/login");

  await page.getByRole("link", { name: "Esqueceu a senha?" }).click();

  await expect(page).toHaveURL(/\/login\/esqueci-a-senha$/);
  await expect(
    page.getByRole("heading", { name: "Recuperar senha", level: 2 })
  ).toBeVisible();

  await page.getByRole("button", { name: "Enviar instruções" }).click();
  await expect(alerta(page, "Campo obrigatório")).toBeVisible();

  await page.getByRole("link", { name: "Voltar para o login" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("a etapa é decidida pelo servidor: adulterar o formulário não pula a senha", async ({
  page,
}) => {
  await page.goto("/login");
  await email(page).fill("operador@meuproduto.local");
  await senha(page).fill("qualquer");
  // Quem nunca passou pela senha diz ao servidor que já está na troca de senha.
  await page
    .locator('input[name="etapa"]')
    .evaluate((campo: HTMLInputElement) => (campo.value = "trocaDeSenha"));

  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(
    alerta(page, "O tempo para concluir a entrada acabou")
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Entrar", level: 2 })
  ).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("a coluna do formulário segue o tema do sistema", async ({ page }) => {
  const fundo = () =>
    page
      .locator("main")
      .locator("..")
      .locator("..")
      .evaluate((elemento) => getComputedStyle(elemento).backgroundColor);

  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/login");
  const claro = await fundo();

  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(fundo).not.toBe(claro);
});
