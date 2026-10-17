import { expect, test } from "@playwright/test";

// Nenhuma tela pode ser mais larga que o celular: um vazamento de poucos
// pixels já cria rolagem lateral e faz o layout "dançar" ao arrastar.
test.use({ viewport: { width: 360, height: 780 } });

for (const rota of [
  "/",
  "/lugar/rancho-portugues",
  "/favoritos",
  "/passaporte",
  "/perfil",
  "/entrar",
]) {
  test(`sem rolagem lateral em 360px: ${rota}`, async ({ page }) => {
    await page.goto(rota);
    const { tela, conteudo } = await page.evaluate(() => ({
      tela: document.documentElement.clientWidth,
      conteudo: document.documentElement.scrollWidth,
    }));
    expect(conteudo).toBeLessThanOrEqual(tela);
  });
}
