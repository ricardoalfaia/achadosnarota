// Carregador de variáveis para o que roda FORA do Next: drizzle-kit, seed,
// bootstrap, setup do papel da app e testes de integração do @achados/db.
//
// Ordem de precedência (a primeira que tiver a variável vence):
//   1. o próprio processo (pipeline/CI, ou `DATABASE_URL=... pnpm ...`);
//   2. `.env.local` na raiz do monorepo, quando existir (fora do git);
//   3. os padrões de desenvolvimento abaixo (o Postgres do docker-compose),
//      que NUNCA são aplicados com APP_ENV=production.
//
// Os padrões apontam só para 127.0.0.1 e usam as senhas fixas de dev do
// docker-compose.yml. Segredo de produção nunca entra aqui nem em arquivo
// versionado (docs/produto/04).
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";

export const RAIZ = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

export const PADROES_DEV = {
  // achados_app: papel da aplicação, sujeito a RLS (docker/postgres/init).
  DATABASE_URL: "postgresql://achados_app:achados_app@127.0.0.1:4550/achados",
  // Dono do schema: migrations, seed e bootstrap.
  DATABASE_URL_ADMIN: "postgresql://achados:achados@127.0.0.1:4550/achados",
};

/** host:porta/banco, sem usuário nem senha — seguro para log. */
export function rotuloBanco(url) {
  try {
    const u = new URL(url);
    return `${u.username}@${u.hostname}:${u.port}${u.pathname}`;
  } catch {
    return "(sem URL)";
  }
}

export function carregarEnv({ silencioso = false } = {}) {
  const arquivo = path.join(RAIZ, ".env.local");
  const origem = {};
  if (existsSync(arquivo)) {
    for (const [chave, valor] of Object.entries(
      parseEnv(readFileSync(arquivo, "utf8"))
    )) {
      if (process.env[chave] === undefined) {
        process.env[chave] = valor;
        origem[chave] = ".env.local";
      }
    }
  }
  const producao = process.env.APP_ENV === "production";
  if (!producao) {
    for (const [chave, valor] of Object.entries(PADROES_DEV)) {
      if (process.env[chave] === undefined) {
        process.env[chave] = valor;
        origem[chave] = "padrão de dev";
      }
    }
  }
  if (!silencioso) {
    console.error(
      `> banco da app: ${rotuloBanco(process.env.DATABASE_URL)}` +
        ` · admin: ${rotuloBanco(process.env.DATABASE_URL_ADMIN)}` +
        (producao ? " · APP_ENV=production" : "")
    );
  }
  return { arquivo: existsSync(arquivo) ? arquivo : null, origem };
}
