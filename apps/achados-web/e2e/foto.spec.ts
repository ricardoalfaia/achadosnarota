import { randomBytes } from "node:crypto";
import { expect, test, type Browser, type Page } from "@playwright/test";
import sharp from "sharp";

import { alerta } from "./apoio/acesso";

// A foto do perfil: escolher, ajustar no círculo, salvar e remover; o
// isolamento entre duas contas; e o endpoint público do Better Auth sem
// poder trocar a imagem. Contas novas, para não mexer na assinante do seed
// que os outros testes usam. O envio de verdade precisa do R2 (`.env.local`);
// sem ele, o teste do envio se pula ao ver o aviso de indisponível.

test.use({ storageState: { cookies: [], origins: [] } });

async function novaConta(browser: Browser, nome: string): Promise<Page> {
  const pagina = await browser.newPage();
  const conta = `foto-${randomBytes(4).toString("hex")}@teste.achados.local`;
  await pagina.goto("/cadastro?voltar=%2Fperfil");
  await pagina.locator('input[name="nome"]').fill(nome);
  await pagina.locator('input[name="email"]').fill(conta);
  await pagina.locator('input[name="senha"]').fill("Uma-Senha-Forte-1");
  await pagina.getByRole("checkbox", { name: /Li e aceito/ }).check();
  await pagina.getByRole("button", { name: "Criar conta" }).click();
  await expect(pagina).toHaveURL(/\/perfil$/);
  return pagina;
}

/** Uma foto sintética deitada, com uma faixa de cor para o recorte ter o que mostrar. */
async function fotoSintetica(): Promise<Buffer> {
  const faixa = await sharp({
    create: { width: 400, height: 800, channels: 3, background: "#0a1e2e" },
  })
    .png()
    .toBuffer();
  return sharp({
    create: { width: 1200, height: 800, channels: 3, background: "#f15a24" },
  })
    .composite([{ input: faixa, left: 0, top: 0 }])
    .jpeg()
    .toBuffer();
}

const fotoDoPerfil = (pagina: Page, nome: string) =>
  pagina
    .getByRole("region", { name: "Quem está na rota" })
    .getByRole("img", { name: nome })
    .first();

test("ajusta a foto no círculo, salva e remove; outra conta não vê", async ({
  browser,
}) => {
  const ana = await novaConta(browser, "Ana Foto");
  const bruno = await novaConta(browser, "Bruno Sem Foto");

  await ana.getByRole("button", { name: "Pôr uma foto no perfil" }).click();
  const janela = ana.getByRole("dialog", { name: "Foto do perfil" });
  await janela.locator('input[type="file"]').setInputFiles({
    name: "minha-foto.jpg",
    mimeType: "image/jpeg",
    buffer: await fotoSintetica(),
  });

  // Ajuste: zoom pelo controle, arrastar e setas do teclado.
  const area = janela.getByRole("group", { name: /Ajuste da foto/ });
  await expect(area.locator("img")).toBeVisible();
  const zoom = janela.getByRole("slider", { name: "Zoom" });
  await zoom.fill("2");
  await expect(zoom).toHaveValue("2");
  const caixa = await area.boundingBox();
  if (!caixa) throw new Error("área de ajuste sem tamanho");
  await ana.mouse.move(caixa.x + caixa.width / 2, caixa.y + caixa.height / 2);
  await ana.mouse.down();
  await ana.mouse.move(caixa.x + caixa.width / 2 + 60, caixa.y + 40, {
    steps: 5,
  });
  await ana.mouse.up();
  await area.press("ArrowLeft");

  await janela.getByRole("button", { name: "Salvar foto" }).click();
  const indisponivel = alerta(ana, "indisponível");
  await Promise.race([
    janela.waitFor({ state: "hidden" }),
    indisponivel.waitFor({ state: "visible" }),
  ]);
  test.skip(
    await indisponivel.isVisible(),
    "R2 não configurado no servidor do teste"
  );

  await expect(janela).toBeHidden();
  const foto = fotoDoPerfil(ana, "Ana Foto");
  await expect(foto).toHaveAttribute("src", /\/avatares\/[0-9A-Z]{26}\.webp$/);
  // A foto gravada é o quadrado do avatar, servido pela URL pública.
  const resposta = await ana.request.get(
    (await foto.getAttribute("src")) ?? ""
  );
  expect(resposta.headers()["content-type"]).toBe("image/webp");

  // Isolamento: a outra conta continua com as iniciais.
  await bruno.reload();
  await expect(
    bruno.getByRole("region", { name: "Quem está na rota" }).locator("img")
  ).toHaveCount(0);

  // Remover devolve as iniciais.
  await ana.getByRole("button", { name: "Mudar a foto do perfil" }).click();
  await janela.getByRole("button", { name: "Remover foto" }).click();
  await expect(janela).toBeHidden();
  await expect(
    ana.getByRole("region", { name: "Quem está na rota" }).locator("img")
  ).toHaveCount(0);
});

test("o endpoint público do Better Auth não troca a foto", async ({
  browser,
  baseURL,
}) => {
  const pagina = await novaConta(browser, "Carla Endpoint");
  const resposta = await pagina.request.post("/api/auth/update-user", {
    headers: { Origin: baseURL ?? "" },
    data: { image: "https://externo.example/rastreio.png" },
  });
  expect(resposta.status()).toBeLessThan(500);

  await pagina.reload();
  await expect(
    pagina.getByRole("region", { name: "Quem está na rota" }).locator("img")
  ).toHaveCount(0);
});

test("arquivo que não é imagem não abre o ajuste", async ({ browser }) => {
  const pagina = await novaConta(browser, "Davi Arquivo");
  await pagina.getByRole("button", { name: "Pôr uma foto no perfil" }).click();
  const janela = pagina.getByRole("dialog", { name: "Foto do perfil" });
  await janela.locator('input[type="file"]').setInputFiles({
    name: "notas.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("não sou uma foto"),
  });
  await expect(alerta(pagina, "JPG, PNG ou WebP")).toBeVisible();
  await expect(
    janela.getByRole("group", { name: /Ajuste da foto/ })
  ).toHaveCount(0);
});
