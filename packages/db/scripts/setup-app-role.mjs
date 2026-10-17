// Cria (ou ajusta) o papel da aplicação, meuproduto_app, onde o init do Docker
// não roda: volume local já existente, Postgres gerenciado (Neon etc.), CI.
// Equivale a docker/postgres/init/01-app-role.sql.
//
// meuproduto_app não é dono das tabelas: as policies de RLS valem para ele. O
// dono (DATABASE_URL_ADMIN) roda migrations, seed e bootstrap.
//
// Idempotente: cria o papel se faltar, refaz grants e default privileges.
// A senha vem da própria DATABASE_URL (usuário meuproduto_app); nunca é impressa.
//
//   pnpm --filter @meuproduto/db db:setup-app-role
//
// Ordem em ambiente novo: setup-app-role → db:migrate (os default privileges
// cobrem as tabelas criadas depois) — ou o contrário, os GRANT ON ALL TABLES
// cobrem as que já existem.
import postgres from "postgres";

const PAPEL = "meuproduto_app";
const adminUrl = process.env.DATABASE_URL_ADMIN;
const appUrl = process.env.DATABASE_URL;
if (!adminUrl) throw new Error("DATABASE_URL_ADMIN não definida.");
if (!appUrl) throw new Error("DATABASE_URL não definida.");

const app = new URL(appUrl);
if (decodeURIComponent(app.username) !== PAPEL) {
  throw new Error(`DATABASE_URL precisa usar o usuário ${PAPEL}.`);
}
const senha = decodeURIComponent(app.password);
if (!senha) throw new Error("DATABASE_URL sem senha para o papel da app.");

const admin = new URL(adminUrl);
const dono = decodeURIComponent(admin.username);
const banco = decodeURIComponent(admin.pathname.slice(1));

const sql = postgres(adminUrl, { max: 1, onnotice: () => {} });
try {
  const [existe] = await sql`select 1 from pg_roles where rolname = ${PAPEL}`;
  const ident = (nome) => `"${nome.replace(/"/g, '""')}"`;
  const literal = (texto) => `'${texto.replace(/'/g, "''")}'`;
  const atributos = `login password ${literal(senha)} nosuperuser nocreatedb nocreaterole noinherit nobypassrls`;

  await sql.begin(async (tx) => {
    await tx.unsafe(
      existe
        ? `alter role ${PAPEL} with ${atributos}`
        : `create role ${PAPEL} ${atributos}`
    );
    await tx.unsafe(`grant connect on database ${ident(banco)} to ${PAPEL}`);
    await tx.unsafe(`grant usage on schema public to ${PAPEL}`);
    await tx.unsafe(
      `grant select, insert, update, delete on all tables in schema public to ${PAPEL}`
    );
    await tx.unsafe(
      `grant usage, select on all sequences in schema public to ${PAPEL}`
    );
    await tx.unsafe(
      `alter default privileges for role ${ident(dono)} in schema public grant select, insert, update, delete on tables to ${PAPEL}`
    );
    await tx.unsafe(
      `alter default privileges for role ${ident(dono)} in schema public grant usage, select on sequences to ${PAPEL}`
    );
  });
  console.log(
    `papel ${PAPEL} ${existe ? "atualizado" : "criado"} em ${admin.hostname}:${admin.port}/${banco} (dono: ${dono}).`
  );
} finally {
  await sql.end();
}
