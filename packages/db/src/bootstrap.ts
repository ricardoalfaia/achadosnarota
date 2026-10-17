/**
 * Primeiro acesso de um ambiente vazio (ex.: produção): cria o usuário
 * administrador, a organização e o primeiro tenant, com o usuário como owner.
 * NÃO cria dados de exemplo (isso é o seed, só para desenvolvimento).
 *
 *   APP_ENV=production DATABASE_URL_ADMIN=... DATABASE_URL=... \
 *     pnpm --filter @meuproduto/db bootstrap -- \
 *     --email voce@escritorio.com.br --name "Seu Nome" \
 *     --org "Escritório Exemplo" --slug escritorio-exemplo [--tenant "Nome"]
 *
 * A senha é aleatória, mostrada UMA vez no terminal e marcada como provisória
 * (must_change_password = true): o app pede a troca no primeiro acesso.
 * Idempotente: rodar de novo não duplica nada; usuário existente não tem a
 * senha alterada. Roda como dono do schema (DATABASE_URL_ADMIN).
 */
import { parseArgs } from "node:util";
import { generateRandomString, hashPassword } from "better-auth/crypto";
import { and, eq } from "drizzle-orm";

import { criarDb, encerrarDb } from "./client";
import * as s from "./schema";

const { values: args } = parseArgs({
  options: {
    email: { type: "string" },
    name: { type: "string" },
    org: { type: "string" },
    tenant: { type: "string" },
    slug: { type: "string" },
  },
  allowPositionals: true,
});

function falhar(mensagem: string): never {
  console.error(`✗ ${mensagem}`);
  process.exit(1);
}

const email = args.email?.trim().toLowerCase() ?? "";
const nomeOrg = args.org?.trim() ?? "";
const nome = args.name?.trim() || email.split("@")[0] || "";
const nomeTenant = args.tenant?.trim() || nomeOrg;
const slug = args.slug?.trim().toLowerCase() ?? "";
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) falhar("informe --email válido");
if (!nomeOrg) falhar("informe --org (nome da organização contratante)");
if (!/^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/.test(slug))
  falhar("informe --slug: minúsculas, números e hífen (endereço do tenant)");

const adminUrl = process.env.DATABASE_URL_ADMIN;
if (!adminUrl) falhar("DATABASE_URL_ADMIN não definida");

const novoId = () => generateRandomString(32, "a-z", "A-Z", "0-9");

async function main() {
  const db = criarDb(adminUrl!, { max: 2 });
  let senhaGerada: string | null = null;
  try {
    await db.transaction(async (tx) => {
      let [usuario] = await tx
        .select({ id: s.users.id })
        .from(s.users)
        .where(eq(s.users.email, email));
      if (!usuario) {
        senhaGerada = generateRandomString(20, "a-z", "A-Z", "0-9");
        const id = novoId();
        await tx.insert(s.users).values({
          id,
          name: nome,
          email,
          emailVerified: true,
          mustChangePassword: true,
        });
        await tx.insert(s.accounts).values({
          id: novoId(),
          accountId: id,
          providerId: "credential",
          userId: id,
          password: await hashPassword(senhaGerada),
        });
        usuario = { id };
        console.log(`✓ usuário ${email}`);
      } else {
        console.log(`· usuário ${email} já existe (senha mantida)`);
      }

      // A organização usa o mesmo slug do primeiro tenant.
      let [organizacao] = await tx
        .select({ id: s.organizations.id })
        .from(s.organizations)
        .where(eq(s.organizations.slug, slug));
      if (!organizacao) {
        [organizacao] = await tx
          .insert(s.organizations)
          .values({ name: nomeOrg, slug })
          .returning({ id: s.organizations.id });
        console.log(`✓ organização ${nomeOrg}`);
      }

      let [tenant] = await tx
        .select({ id: s.tenants.id, organizationId: s.tenants.organizationId })
        .from(s.tenants)
        .where(eq(s.tenants.slug, slug));
      if (tenant && tenant.organizationId !== organizacao!.id)
        falhar(`o endereço ${slug} já pertence a outra organização`);
      if (!tenant) {
        [tenant] = await tx
          .insert(s.tenants)
          .values({ organizationId: organizacao!.id, name: nomeTenant, slug })
          .returning({
            id: s.tenants.id,
            organizationId: s.tenants.organizationId,
          });
        console.log(`✓ tenant ${nomeTenant} (${slug})`);
      }

      const [membro] = await tx
        .select({ role: s.tenantUsers.role })
        .from(s.tenantUsers)
        .where(
          and(
            eq(s.tenantUsers.tenantId, tenant!.id),
            eq(s.tenantUsers.userId, usuario.id)
          )
        );
      if (!membro) {
        await tx
          .insert(s.tenantUsers)
          .values({ tenantId: tenant!.id, userId: usuario.id, role: "owner" });
        console.log(`✓ ${email} é owner de ${slug}`);
      }
    });
  } finally {
    await encerrarDb(db);
  }

  if (senhaGerada) {
    console.log(
      `\nSenha provisória de ${email} (aparece só agora; o app pede a troca no primeiro acesso):\n\n    ${senhaGerada}\n`
    );
  }
}

main().catch((erro: unknown) => {
  console.error("✗ bootstrap falhou:", erro);
  process.exit(1);
});
