import { test as entrada, expect } from "@playwright/test";

import { SESSAO_DO_TESTE } from "../playwright.config";
import { apresentar, configurarAutenticador, noPainel } from "./apoio/acesso";

// admin@meuproduto.local é owner do escritorio-demo: o MFA é obrigatório. O
// preparo do banco desliga o 2FA dele a cada rodada, então a primeira entrada
// passa pela configuração do autenticador, como num primeiro acesso.
entrada(
  "o owner configura o autenticador no primeiro acesso e a sessão fica guardada",
  async ({ page }) => {
    await apresentar(page, "admin@meuproduto.local");
    await configurarAutenticador(page);

    await expect(page).toHaveURL(/\/t\/escritorio-demo$/);
    await noPainel(page);
    await page.context().storageState({ path: SESSAO_DO_TESTE });
  }
);
