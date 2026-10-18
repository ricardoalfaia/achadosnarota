// Configura o papel dos pagamentos, achados_pagamentos (ADR-006 de produto):
// só a rota do webhook da Stripe conecta com ele. Pode ler o plano e a conta,
// e criar e atualizar assinaturas e eventos de pagamento. Nada mais: sem
// catálogo, sem favoritos, sem curadoria.
//
// Idempotente. A senha vem da própria DATABASE_URL_PAGAMENTOS (usuário
// achados_pagamentos); nunca é impressa.
//
//   pnpm --filter @achados/db db:setup-papel-de-pagamentos
import postgres from "postgres";

const PAPEL = "achados_pagamentos";
const adminUrl = process.env.DATABASE_URL_ADMIN;
const pagamentosUrl = process.env.DATABASE_URL_PAGAMENTOS;
if (!adminUrl) throw new Error("DATABASE_URL_ADMIN não definida.");
if (!pagamentosUrl) throw new Error("DATABASE_URL_PAGAMENTOS não definida.");

const url = new URL(pagamentosUrl);
if (decodeURIComponent(url.username) !== PAPEL)
  throw new Error(`DATABASE_URL_PAGAMENTOS precisa usar o usuário ${PAPEL}.`);
const senha = decodeURIComponent(url.password);
if (!senha) throw new Error("DATABASE_URL_PAGAMENTOS sem senha.");
const banco = decodeURIComponent(new URL(adminUrl).pathname.slice(1));

const sql = postgres(adminUrl, { max: 1, onnotice: () => {} });
try {
  const [existe] = await sql`select 1 from pg_roles where rolname = ${PAPEL}`;
  const literal = (texto) => `'${texto.replace(/'/g, "''")}'`;
  const atributos = `login password ${literal(senha)} nosuperuser nocreatedb nocreaterole noinherit nobypassrls`;
  await sql.begin(async (tx) => {
    // Já existente (a migração 0007 cria o papel sem login): só liga o login
    // e a senha. Os provedores gerenciados (Neon) não deixam o dono mudar os
    // outros atributos, que já nascem restritivos (sem superusuário, sem
    // criar papel ou banco, sem ignorar RLS).
    await tx.unsafe(
      existe
        ? `alter role ${PAPEL} with login password ${literal(senha)}`
        : `create role ${PAPEL} ${atributos}`
    );
    await tx.unsafe(`grant connect on database "${banco}" to ${PAPEL}`);
    await tx.unsafe(`grant usage on schema public to ${PAPEL}`);
    await tx.unsafe(`grant select on "plan", "user" to ${PAPEL}`);
    await tx.unsafe(
      `grant select, insert, update on "subscription", "payment_event" to ${PAPEL}`
    );
  });
  console.log(`✓ papel ${PAPEL} pronto (login, senha e grants).`);
} finally {
  await sql.end();
}
