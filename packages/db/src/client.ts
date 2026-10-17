import { createHash } from "node:crypto";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

export type CriarDbOpcoes = {
  /** Conexões no pool. Padrão 10; scripts usam 1 ou 2. */
  max?: number;
};

function abrir(url: string, max: number) {
  const client = postgres(url, {
    max,
    // Sem prepared statements: compatível com pgbouncer/pooler em modo
    // transação (Neon, Supabase), onde a conexão muda entre comandos.
    prepare: false,
    onnotice: () => {},
  });
  return drizzle(client, { schema });
}

export type Db = ReturnType<typeof abrir>;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
/** Qualquer executor Drizzle: conexão ou transação. */
export type DbExecutor = Db | Tx;

// Pools guardados em globalThis, não em variável de módulo, por dois motivos
// que o CRM aprendeu na prática:
//   1. HMR do Next: cada recarga reavalia o módulo; com variável de módulo,
//      cada recarga abriria um pool novo até o Postgres esgotar conexões.
//   2. O Next empacota o pacote separadamente por rota, então o mesmo schema
//      aparece como objetos diferentes. Chave por identidade de objeto fazia
//      uma rota fechar o pool que outra (o adapter do Better Auth) ainda usava
//      → CONNECTION_ENDED.
// Por isso a chave é estável: hash da URL (a senha não fica legível na chave)
// + max + assinatura do schema (tabelas e colunas). Coluna nova via migration
// + HMR muda a assinatura e nasce outra instância; senão o Drizzle seguiria
// com o schema antigo em memória. O pool antigo nunca é fechado aqui, porque
// alguém pode ter guardado a referência.
const CHAVE_GLOBAL = Symbol.for("achados.db.pools");
type Registro = { [CHAVE_GLOBAL]?: Map<string, Db> };

const ASSINATURA = Object.entries(schema as Record<string, unknown>)
  .filter(([, valor]) => typeof valor === "object" && valor !== null)
  .map(
    ([nome, valor]) =>
      `${nome}(${Object.keys(valor as object)
        .sort()
        .join("|")})`
  )
  .sort()
  .join(",");

function pools(): Map<string, Db> {
  const registro = globalThis as Registro;
  registro[CHAVE_GLOBAL] ??= new Map();
  return registro[CHAVE_GLOBAL];
}

/**
 * Db (Drizzle + postgres.js) para a URL dada, reaproveitado no processo.
 *
 * A app usa DATABASE_URL (papel achados_app, sujeito a RLS) e sempre acessa
 * dados pessoais por withUser(). DATABASE_URL_ADMIN (dono) é só para
 * migrations e seed.
 */
export function criarDb(url: string, opcoes: CriarDbOpcoes = {}): Db {
  const max = opcoes.max ?? 10;
  const chave = `${createHash("sha256").update(url).digest("hex")}|${max}|${ASSINATURA}`;
  const mapa = pools();
  let db = mapa.get(chave);
  if (!db) {
    db = abrir(url, max);
    mapa.set(chave, db);
  }
  return db;
}

/**
 * Fecha o pool e o tira do registro. Só para scripts e testes, que precisam
 * encerrar o processo; a app nunca fecha o pool (ver comentário acima).
 */
export async function encerrarDb(db: Db): Promise<void> {
  const mapa = pools();
  for (const [chave, valor] of mapa) if (valor === db) mapa.delete(chave);
  await db.$client.end({ timeout: 5 });
}
