import { expect, test } from "@playwright/test";

import {
  alerta,
  apresentar,
  email,
  logado,
  SENHA,
  senha,
  VISITANTE,
} from "./apoio/acesso";

// Estes testes começam sem sessão: é a tela de quem ainda não entrou.
test.use({ storageState: { cookies: [], origins: [] } });

test("a tela de login mostra a marca, o formulário e o caminho para criar conta", async ({
  page,
}) => {
  const erros: Error[] = [];
  page.on("pageerror", (erro) => erros.push(erro));

  const resposta = await page.goto("/login");

  expect(resposta?.status()).toBe(200);
  await expect(page).toHaveTitle("Entrar · Achados na Rota");
  await expect(
    page.getByRole("link", { name: "Achados na Rota, início" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Entrar", level: 1 })
  ).toBeVisible();
  await expect(email(page)).toBeVisible();
  await expect(senha(page)).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Criar conta grátis" })
  ).toHaveAttribute("href", "/cadastro");
  expect(erros).toEqual([]);
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
  await apresentar(page, VISITANTE, "senha-errada");
  await expect(alerta(page, "E-mail ou senha inválidos.")).toBeVisible();

  await apresentar(page, "nao-existe@achados.local", SENHA);
  await expect(alerta(page, "E-mail ou senha inválidos.")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("com e-mail e senha certos (em qualquer caixa), entra e vai ao início", async ({
  page,
}) => {
  await apresentar(page, "Visitante@Achados.LOCAL");
  await expect(page).toHaveURL(/127\.0\.0\.1:4501\/$/);
  await logado(page);
});

test("senha provisória obriga a definir uma nova antes de usar o app", async ({
  page,
}) => {
  await apresentar(page, "troca@achados.local");
  await expect(
    page.getByRole("heading", { name: "Defina uma nova senha", level: 1 })
  ).toBeVisible();

  // Já há sessão, mas as telas com conta não abrem enquanto a troca não acontece.
  await page.goto("/perfil");
  await expect(page).toHaveURL(/\/login/);
  await expect(
    page.getByRole("heading", { name: "Defina uma nova senha", level: 1 })
  ).toBeVisible();

  const atual = page.getByLabel("Senha atual", { exact: true });
  const nova = page.getByLabel("Nova senha", { exact: true });
  const confirmacao = page.getByLabel("Confirmar nova senha", { exact: true });
  const salvar = page.getByRole("button", { name: "Salvar e entrar" });

  await atual.fill(SENHA);
  await nova.fill("Uma-Senha-Forte-1");
  await confirmacao.fill("outra");
  await salvar.click();
  await expect(alerta(page, "As senhas não são iguais")).toBeVisible();

  await atual.fill(SENHA);
  await nova.fill("curta");
  await confirmacao.fill("curta");
  await salvar.click();
  await expect(alerta(page, "pelo menos 10 caracteres")).toBeVisible();

  await atual.fill(SENHA);
  await nova.fill("Uma-Senha-Forte-1");
  await confirmacao.fill("Uma-Senha-Forte-1");
  await salvar.click();
  await expect(page).toHaveURL(/\/perfil$/);
});

test("muitas senhas erradas seguidas para a mesma conta travam novas tentativas", async ({
  page,
}) => {
  await page.goto("/login");
  await email(page).fill("alvo-de-forca-bruta@achados.local");
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
  await email(page).fill("lembrado@achados.local");
  await senha(page).fill("qualquer");
  await page.getByRole("checkbox", { name: "Lembrar meu e-mail" }).check();
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(alerta(page, "E-mail ou senha inválidos.")).toBeVisible();

  await page.goto("/login");
  await expect(email(page)).toHaveValue("lembrado@achados.local");
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
    page.getByRole("heading", { name: "Recuperar senha", level: 1 })
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
  await email(page).fill(VISITANTE);
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
    page.getByRole("heading", { name: "Entrar", level: 1 })
  ).toBeVisible();
});
