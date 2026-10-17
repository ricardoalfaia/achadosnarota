// Deixa o banco do E2E (apoio/banco.ts, nunca o de desenvolvimento) no estado
// que o E2E espera. Roda com as variáveis do banco carregadas pelo carregador
// da raiz (DATABASE_URL_ADMIN só existe neste processo; o app do teste nunca
// a recebe):
//
//   node ../../scripts/with-env.mjs -- node e2e/preparar-banco.mjs
//
// Antes disto, o global setup roda `pnpm db:migrate` e `pnpm db:seed` (o seed
// é idempotente). Aqui, só o que é do E2E, tudo sintético:
//   - zera o rate limit (as rodadas seguidas não herdam tentativas);
//   - volta os favoritos das contas do seed ao estado do seed;
//   - apaga as contas criadas pelo teste de cadastro;
//   - recria as contas próprias do E2E com senha conhecida.
import { randomBytes } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import postgres from "postgres";

if (process.env.APP_ENV === "production") {
  console.error("✗ preparar-banco é só para o E2E local e da CI.");
  process.exit(1);
}
const url = process.env.DATABASE_URL_ADMIN;
if (!url) throw new Error("DATABASE_URL_ADMIN não definida.");

const SENHA = "achados123";

/** Contas só do E2E. `troca` começa com senha provisória. */
const CONTAS = [
  { email: "troca@achados.local", nome: "Troca Provisória", troca: true },
  { email: "redefinir@achados.local", nome: "Redefinir Senha", troca: false },
];

/** Favoritos de cada conta do seed no começo da rodada. */
const FAVORITOS_DO_SEED = {
  "assinante@achados.local": ["rancho-portugues", "cafe-da-serra"],
  "visitante@achados.local": [],
};

// ULID (ADR-0024) sem depender do pacote: 10 caracteres do tempo e 16
// aleatórios, em Crockford base32. O banco confere o formato.
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
function novoId() {
  let tempo = Date.now();
  let prefixo = "";
  for (let i = 0; i < 10; i++) {
    prefixo = CROCKFORD[tempo % 32] + prefixo;
    tempo = Math.floor(tempo / 32);
  }
  const sorte = [...randomBytes(16)].map((b) => CROCKFORD[b % 32]).join("");
  return prefixo + sorte;
}

const sql = postgres(url, { max: 1, onnotice: () => {} });
try {
  await sql.begin(async (tx) => {
    await tx`delete from rate_limit`;

    for (const [email, slugs] of Object.entries(FAVORITOS_DO_SEED)) {
      await tx`
        delete from favorite
        where user_id = (select id from "user" where email = ${email})`;
      if (slugs.length > 0)
        await tx`
          insert into favorite (user_id, place_id)
          select u.id, p.id from "user" u, place p
          where u.email = ${email} and p.slug in ${tx(slugs)}`;
    }

    // Contas criadas pelo teste de cadastro em rodadas anteriores.
    await tx`delete from "user" where email like 'cadastro-%@teste.achados.local'`;

    const hash = await hashPassword(SENHA);
    for (const conta of CONTAS) {
      const [existente] = await tx`
        select id from "user" where email = ${conta.email}`;
      const id = existente?.id ?? novoId();
      if (existente) {
        await tx`
          update "user"
          set name = ${conta.nome}, must_change_password = ${conta.troca},
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
          values (${id}, ${conta.nome}, ${conta.email}, true, ${conta.troca})`;
        await tx`
          insert into account (id, account_id, provider_id, user_id, password)
          values (${novoId()}, ${id}, 'credential', ${id}, ${hash})`;
      }
    }
  });
  console.log("✓ banco pronto para o E2E");
} finally {
  await sql.end({ timeout: 5 });
}
