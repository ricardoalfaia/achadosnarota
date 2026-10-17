/**
 * Dados SINTÉTICOS de desenvolvimento (docs/produto/09: dado real de cliente
 * nunca entra aqui). Idempotente: rodar de novo não duplica nada nem troca
 * senha de usuário existente.
 *
 *   pnpm db:seed
 *
 * Cria a organização "Organização Demo", os tenants escritorio-demo e
 * escritorio-teste, três usuários e três clientes em cada tenant.
 *
 * Organização, tenants, usuários e memberships são gravados como DONO
 * (DATABASE_URL_ADMIN), como num bootstrap. Os clientes são gravados com o
 * papel da app (DATABASE_URL) dentro de withTenant: o seed passa pelo mesmo
 * caminho do app e já exercita as policies de escrita.
 */
import { Ok, type Result } from "@meuproduto/core";
import { generateRandomString, hashPassword } from "better-auth/crypto";
import { and, eq } from "drizzle-orm";

import { criarDb, encerrarDb, type Db } from "./client";
import * as s from "./schema";
import { withTenant } from "./tenant-scope";

if (process.env.APP_ENV === "production") {
  console.error("✗ seed é só para desenvolvimento. Em produção use bootstrap.");
  process.exit(1);
}

const ORGANIZACAO = { name: "Organização Demo", slug: "organizacao-demo" };

const TENANTS = [
  {
    slug: "escritorio-demo",
    name: "Escritório Demo",
    clientes: ["Ana Exemplo", "Bruno Fictício", "Carla Sintética"],
  },
  {
    slug: "escritorio-teste",
    name: "Escritório Teste",
    clientes: ["Daniel Exemplo", "Elisa Fictícia", "Fábio Sintético"],
  },
] as const;

type TenantSlug = (typeof TENANTS)[number]["slug"];

const USUARIOS: ReadonlyArray<{
  email: string;
  name: string;
  password: string;
  tenant: TenantSlug;
  role: s.TenantRole;
}> = [
  {
    email: "admin@meuproduto.local",
    name: "Admin Demo",
    password: "meuproduto123",
    tenant: "escritorio-demo",
    role: "owner",
  },
  {
    email: "operador@meuproduto.local",
    name: "Operador Demo",
    password: "meuproduto123",
    tenant: "escritorio-demo",
    role: "member",
  },
  {
    email: "outro@meuproduto.local",
    name: "Outro Escritório",
    password: "meuproduto123",
    tenant: "escritorio-teste",
    role: "owner",
  },
];

/** Mesmo formato de id que o Better Auth gera (32 caracteres alfanuméricos). */
const novoId = () => generateRandomString(32, "a-z", "A-Z", "0-9");

function exigir(nome: "DATABASE_URL" | "DATABASE_URL_ADMIN"): string {
  const valor = process.env[nome];
  if (!valor) throw new Error(`${nome} não definida.`);
  return valor;
}

async function garantirUsuario(
  admin: Db,
  u: (typeof USUARIOS)[number]
): Promise<string> {
  const [existente] = await admin
    .select({ id: s.users.id })
    .from(s.users)
    .where(eq(s.users.email, u.email));
  if (existente) {
    console.log(`· usuário ${u.email} já existe (senha mantida)`);
    return existente.id;
  }
  const id = novoId();
  await admin.transaction(async (tx) => {
    await tx
      .insert(s.users)
      .values({ id, name: u.name, email: u.email, emailVerified: true });
    // Mesmo formato do sign-up por e-mail e senha do Better Auth 1.7:
    // providerId "credential", accountId = user.id, password = hashPassword().
    await tx.insert(s.accounts).values({
      id: novoId(),
      accountId: id,
      providerId: "credential",
      userId: id,
      password: await hashPassword(u.password),
    });
  });
  console.log(`✓ usuário ${u.email} / senha ${u.password}`);
  return id;
}

async function main() {
  const admin = criarDb(exigir("DATABASE_URL_ADMIN"), { max: 2 });
  const app = criarDb(exigir("DATABASE_URL"), { max: 2 });
  try {
    const [organizacao] = await admin
      .insert(s.organizations)
      .values(ORGANIZACAO)
      .onConflictDoUpdate({
        target: s.organizations.slug,
        set: { name: ORGANIZACAO.name },
      })
      .returning({ id: s.organizations.id });
    if (!organizacao) throw new Error("organização não gravada");
    console.log(`✓ organização ${ORGANIZACAO.name}`);

    const tenantIds = new Map<TenantSlug, string>();
    for (const t of TENANTS) {
      const [tenant] = await admin
        .insert(s.tenants)
        .values({ organizationId: organizacao.id, slug: t.slug, name: t.name })
        .onConflictDoUpdate({ target: s.tenants.slug, set: { name: t.name } })
        .returning({
          id: s.tenants.id,
          organizationId: s.tenants.organizationId,
        });
      if (!tenant) throw new Error(`tenant ${t.slug} não gravado`);
      if (tenant.organizationId !== organizacao.id)
        throw new Error(`o slug ${t.slug} pertence a outra organização`);
      tenantIds.set(t.slug, tenant.id);
      console.log(`✓ tenant ${t.slug} (${tenant.id})`);
    }

    for (const u of USUARIOS) {
      const userId = await garantirUsuario(admin, u);
      const tenantId = tenantIds.get(u.tenant)!;
      const [membro] = await admin
        .select({ role: s.tenantUsers.role })
        .from(s.tenantUsers)
        .where(
          and(
            eq(s.tenantUsers.tenantId, tenantId),
            eq(s.tenantUsers.userId, userId)
          )
        );
      if (!membro) {
        await admin
          .insert(s.tenantUsers)
          .values({ tenantId, userId, role: u.role });
        console.log(`✓ ${u.email} é ${u.role} de ${u.tenant}`);
      }
    }

    for (const t of TENANTS) {
      const resultado: Result<number> = await withTenant(
        app,
        tenantIds.get(t.slug)!,
        async (tx) => {
          const existentes = new Set(
            (await tx.select({ name: s.clients.name }).from(s.clients)).map(
              (c) => c.name
            )
          );
          const faltando = t.clientes.filter((nome) => !existentes.has(nome));
          if (faltando.length > 0) {
            await tx.insert(s.clients).values(
              faltando.map((name) => ({
                tenantId: tenantIds.get(t.slug)!,
                name,
              }))
            );
          }
          return Ok(faltando.length);
        }
      );
      if (!resultado.ok) throw resultado.error;
      console.log(
        resultado.value > 0
          ? `✓ ${resultado.value} clientes sintéticos em ${t.slug}`
          : `· clientes de ${t.slug} já existem`
      );
    }
  } finally {
    await Promise.all([encerrarDb(admin), encerrarDb(app)]);
  }
}

main().catch((erro: unknown) => {
  console.error("✗ seed falhou:", erro);
  process.exit(1);
});
