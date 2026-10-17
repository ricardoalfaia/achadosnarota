import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";
import postgres from "postgres";

import { BANCO_DO_E2E, urlsDoBanco } from "./apoio/banco";
import { CAIXA_DE_EMAIL } from "./apoio/caixa";

// Global setup do Playwright: cria o banco próprio do E2E (apoio/banco.ts) e
// roda nele papel da app, migrações, seed e o estado do E2E, pelos mesmos
// scripts que quem desenvolve usa. O banco de desenvolvimento não é tocado.
// DATABASE_URL_ADMIN só existe nos processos filhos; não chega ao servidor do
// app.

const APP = path.resolve(__dirname, "..");
const RAIZ = path.resolve(APP, "../..");

function rodar(
  rotulo: string,
  comando: string,
  cwd: string,
  env: Record<string, string>
) {
  const saida = spawnSync(comando, {
    cwd,
    shell: true,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
  if (saida.status !== 0)
    throw new Error(
      `${rotulo} falhou (código ${saida.status}). O Postgres está no ar? (pnpm infra:up)`
    );
}

/** Cria o banco do E2E na primeira rodada; nas seguintes, reaproveita. */
async function criarBancoDoE2E(adminDaOrigem: string) {
  const sql = postgres(adminDaOrigem, { max: 1, onnotice: () => {} });
  try {
    const [existe] =
      await sql`select 1 from pg_database where datname = ${BANCO_DO_E2E}`;
    if (!existe) await sql.unsafe(`create database "${BANCO_DO_E2E}"`);
  } catch (causa) {
    throw new Error(
      `Não foi possível criar o banco ${BANCO_DO_E2E}. O Postgres está no ar? (pnpm infra:up)`,
      { cause: causa }
    );
  } finally {
    await sql.end();
  }
}

export default async function preparar() {
  const { adminDaOrigem, ...banco } = urlsDoBanco();
  await criarBancoDoE2E(adminDaOrigem);

  rodar(
    "db:setup-app-role",
    "pnpm --filter @achados/db db:setup-app-role",
    RAIZ,
    banco
  );
  rodar("db:migrate", "pnpm db:migrate", RAIZ, banco);
  rodar("db:seed", "pnpm db:seed", RAIZ, banco);
  rodar(
    "preparar-banco",
    "node ../../scripts/with-env.mjs -- node e2e/preparar-banco.mjs",
    APP,
    banco
  );
  rmSync(CAIXA_DE_EMAIL, { force: true });
}
