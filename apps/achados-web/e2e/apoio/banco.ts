// O banco do E2E: o mesmo Postgres do docker-compose (ou o service container
// da CI), num banco separado. O E2E liga e desliga autenticador, troca senha e
// zera limites; no banco de desenvolvimento isso deixava o admin do seed com
// uma chave de autenticador que só o teste conhecia.

export const BANCO_DO_E2E = "achados_e2e";

/** Os padrões de dev de scripts/load-env.mjs, quando o processo não define. */
const PADROES = {
  DATABASE_URL: "postgresql://achados_app:achados_app@127.0.0.1:4550/achados",
  DATABASE_URL_ADMIN: "postgresql://achados:achados@127.0.0.1:4550/achados",
};

/** A mesma URL apontando para outro banco. */
export function comBanco(url: string, banco: string): string {
  const endereco = new URL(url);
  endereco.pathname = `/${banco}`;
  return endereco.toString();
}

/** As URLs de origem (dev ou CI) e as do banco do E2E. */
export function urlsDoBanco() {
  const app = process.env.DATABASE_URL || PADROES.DATABASE_URL;
  const admin = process.env.DATABASE_URL_ADMIN || PADROES.DATABASE_URL_ADMIN;
  return {
    /** Dono, no banco de origem: só para criar o banco do E2E. */
    adminDaOrigem: admin,
    DATABASE_URL: comBanco(app, BANCO_DO_E2E),
    DATABASE_URL_ADMIN: comBanco(admin, BANCO_DO_E2E),
  };
}
