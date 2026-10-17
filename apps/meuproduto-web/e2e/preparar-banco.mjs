// Deixa o banco do E2E (apoio/banco.ts, nunca o de desenvolvimento) no estado
// que o E2E espera. Roda com as variáveis do banco carregadas pelo carregador
// da raiz (DATABASE_URL_ADMIN só existe neste
// processo; o app do teste nunca a recebe):
//
//   node ../../scripts/with-env.mjs -- node e2e/preparar-banco.mjs
//
// Antes disto, o global setup roda `pnpm db:migrate` e `pnpm db:seed` (o seed
// é idempotente). Aqui, só o que é do E2E, tudo sintético:
//   - zera o rate limit (as rodadas seguidas não herdam tentativas);
//   - desliga o 2FA dos owners do seed (o E2E configura o autenticador de novo);
//   - recria as contas próprias do E2E com senha conhecida.
import { hashPassword } from "better-auth/crypto";
import postgres from "postgres";

if (process.env.APP_ENV === "production") {
  console.error("✗ preparar-banco é só para o E2E local e da CI.");
  process.exit(1);
}
const url = process.env.DATABASE_URL_ADMIN;
if (!url) throw new Error("DATABASE_URL_ADMIN não definida.");

const SENHA = "meuproduto123";

/** Contas só do E2E. `troca` começa com senha provisória. */
const CONTAS = [
  {
    email: "troca@meuproduto.local",
    nome: "Troca Provisória",
    tenants: [["escritorio-demo", "member"]],
    trocaObrigatoria: true,
  },
  {
    email: "redefinir@meuproduto.local",
    nome: "Redefinir Senha",
    tenants: [["escritorio-demo", "member"]],
    trocaObrigatoria: false,
  },
  {
    email: "multi@meuproduto.local",
    nome: "Multi Escritório",
    tenants: [
      ["escritorio-demo", "member"],
      ["escritorio-teste", "viewer"],
    ],
    trocaObrigatoria: false,
  },
];

const OWNERS_DO_SEED = ["admin@meuproduto.local", "outro@meuproduto.local"];

const sql = postgres(url, { max: 1, onnotice: () => {} });
try {
  await sql.begin(async (tx) => {
    await tx`delete from rate_limit`;

    await tx`
      delete from two_factor
      where user_id in (select id from "user" where email in ${tx(OWNERS_DO_SEED)})`;
    await tx`
      update "user" set two_factor_enabled = false
      where email in ${tx(OWNERS_DO_SEED)}`;

    const hash = await hashPassword(SENHA);
    for (const conta of CONTAS) {
      const [existente] = await tx`
        select id from "user" where email = ${conta.email}`;
      const id = existente?.id ?? crypto.randomUUID().replace(/-/g, "");
      if (existente) {
        await tx`
          update "user"
          set name = ${conta.nome}, must_change_password = ${conta.trocaObrigatoria},
              two_factor_enabled = false
          where id = ${id}`;
        await tx`
          update account set password = ${hash}
          where user_id = ${id} and provider_id = 'credential'`;
        await tx`delete from session where user_id = ${id}`;
        await tx`delete from two_factor where user_id = ${id}`;
      } else {
        await tx`
          insert into "user" (id, name, email, email_verified, must_change_password)
          values (${id}, ${conta.nome}, ${conta.email}, true, ${conta.trocaObrigatoria})`;
        await tx`
          insert into account (id, account_id, provider_id, user_id, password)
          values (${crypto.randomUUID().replace(/-/g, "")}, ${id}, 'credential', ${id}, ${hash})`;
      }
      for (const [slug, papel] of conta.tenants) {
        await tx`
          insert into tenant_user (tenant_id, user_id, role)
          select t.id, ${id}, ${papel}::tenant_role from tenant t where t.slug = ${slug}
          on conflict (tenant_id, user_id) do update set role = excluded.role`;
      }
    }
  });
  console.log("✓ banco pronto para o E2E");
} finally {
  await sql.end({ timeout: 5 });
}
