import { test as entrada } from "@playwright/test";

import { SESSAO_DO_TESTE } from "../playwright.config";
import { apresentar, ASSINANTE, logado } from "./apoio/acesso";

// A assinante do seed (passaporte ativo de fixture) entra uma vez e a sessão
// fica guardada para os testes que começam logados.
entrada("a assinante entra e a sessão fica guardada", async ({ page }) => {
  await apresentar(page, ASSINANTE);
  await page.waitForURL((url) => url.pathname === "/");
  await logado(page);
  await page.context().storageState({ path: SESSAO_DO_TESTE });
});
