/**
 * Testes de isolamento A/B (critério de aceite do M1, docs/produto/08).
 *
 * Rodam contra o Postgres de verdade, conectados como meuproduto_app (o papel da
 * app, sujeito a RLS). Sem banco no ar, a parte de integração é PULADA com
 * aviso, para `pnpm test` não quebrar numa máquina sem Docker; com
 * MEUPRODUTO_EXIGIR_BANCO=1 (`pnpm --filter @meuproduto/db test:integracao`, o
 * modo do CI) a falta de banco FALHA o teste.
 *
 * Os dados são criados aqui (como dono), com slugs aleatórios, e apagados no
 * fim: não dependem do seed nem interferem nele.
 */
import { randomBytes, randomUUID } from "node:crypto";
import { AppError, Err, Ok } from "@meuproduto/core";
import { eq, inArray, sql } from "drizzle-orm";
import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { criarDb, encerrarDb, type Db } from "./client";
import { clients, organizations, tenants, tenantUsers, users } from "./schema";
import {
  codigoPostgres,
  validarTenantId,
  validarUserId,
  withTenant,
  withUser,
} from "./tenant-scope";

// ─── Unitários (sempre rodam) ────────────────────────────────────────────────

describe("validação de contexto", () => {
  it("aceita UUID e normaliza para minúsculas", () => {
    const id = "6F9619FF-8B86-D011-B42D-00C04FC964FF";
    expect(validarTenantId(id)).toEqual(Ok(id.toLowerCase()));
  });

  it.each(["", "abc", "1", "' or 1=1 --", "6f9619ff8b86d011b42d00c04fc964ff"])(
    "recusa tenantId inválido %j",
    (valor) => {
      const r = validarTenantId(valor);
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.error.category).toBe("validation");
        expect(r.error.code).toBe("TENANT_ID_INVALID");
      }
    }
  );

  it("recusa tenantId que não é string", () => {
    expect(validarTenantId(undefined).ok).toBe(false);
    expect(validarTenantId(42).ok).toBe(false);
  });

  it("valida userId do Better Auth", () => {
    expect(validarUserId("aB3dE5gH7jK9mN1pQ3sT5vW7yZ9bC1dE").ok).toBe(true);
    expect(validarUserId("").ok).toBe(false);
    expect(validarUserId("com espaço").ok).toBe(false);
    expect(validarUserId("x".repeat(129)).ok).toBe(false);
  });

  it("withTenant com id inválido devolve Err sem tocar no banco", async () => {
    // Um db que explode se usado: prova que a validação vem antes.
    const dbQueNaoPodeSerUsado = new Proxy({} as Db, {
      get() {
        throw new Error("o banco não devia ser acessado");
      },
    });
    const r = await withTenant(dbQueNaoPodeSerUsado, "nao-e-uuid", async () =>
      Ok(1)
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.category).toBe("validation");
    const u = await withUser(dbQueNaoPodeSerUsado, "", async () => Ok(1));
    expect(u.ok).toBe(false);
  });

  it("acha o SQLSTATE na cadeia de cause", () => {
    const pg = Object.assign(new Error("rls"), { code: "42501" });
    expect(codigoPostgres(new Error("drizzle", { cause: pg }))).toBe("42501");
    expect(codigoPostgres(new Error("sem código"))).toBeUndefined();
  });
});

// ─── Integração (Postgres local ou serviço do CI) ────────────────────────────

const EXIGIR = process.env.MEUPRODUTO_EXIGIR_BANCO === "1";
const APP_URL = process.env.DATABASE_URL;
const ADMIN_URL = process.env.DATABASE_URL_ADMIN;

async function sondar(): Promise<string | null> {
  if (!APP_URL || !ADMIN_URL)
    return "DATABASE_URL/DATABASE_URL_ADMIN não definidas";
  for (const url of [APP_URL, ADMIN_URL]) {
    const c = postgres(url, { max: 1, connect_timeout: 3, onnotice: () => {} });
    try {
      await c`select 1`;
    } catch (erro) {
      return `banco não respondeu (${(erro as Error).message})`;
    } finally {
      await c.end({ timeout: 1 });
    }
  }
  return null;
}

const motivo = await sondar();
if (motivo) {
  if (EXIGIR) throw new Error(`MEUPRODUTO_EXIGIR_BANCO=1, mas ${motivo}.`);
  // stderr direto: o reporter padrão do vitest esconde console.* de arquivo
  // que passou, e o aviso de que a integração não rodou não pode sumir.
  process.stderr.write(
    `\n[@meuproduto/db] testes de isolamento PULADOS: ${motivo}.\n` +
      "  Suba o banco (pnpm infra:up && pnpm db:migrate) ou rode test:integracao no CI.\n"
  );
}

describe.skipIf(motivo !== null)(
  motivo
    ? `isolamento por tenant (RLS) PULADO: ${motivo}`
    : "isolamento por tenant (RLS)",
  () => {
    let admin: Db;
    // max: 1 → todas as queries da app usam A MESMA conexão. É o que torna o
    // teste (e) significativo: a conexão que fez withTenant é a que volta ao pool.
    let app: Db;
    const sufixo = randomBytes(4).toString("hex");
    let orgId = "";
    let tenantA = "";
    let tenantB = "";
    const userA = `teste-a-${sufixo}`;
    const userB = `teste-b-${sufixo}`;
    const userAmbos = `teste-ambos-${sufixo}`;
    const nomesA = ["A1", "A2", "A3"].map((n) => `${n}-${sufixo}`);
    const nomesB = ["B1", "B2"].map((n) => `${n}-${sufixo}`);

    beforeAll(async () => {
      admin = criarDb(ADMIN_URL!, { max: 1 });
      app = criarDb(APP_URL!, { max: 1 });

      const [org] = await admin
        .insert(organizations)
        .values({ name: `Org teste ${sufixo}`, slug: `org-teste-${sufixo}` })
        .returning({ id: organizations.id });
      orgId = org!.id;
      const [a, b] = await admin
        .insert(tenants)
        .values([
          { organizationId: orgId, slug: `iso-a-${sufixo}`, name: "Tenant A" },
          { organizationId: orgId, slug: `iso-b-${sufixo}`, name: "Tenant B" },
        ])
        .returning({ id: tenants.id, slug: tenants.slug });
      // returning não garante ordem: resolve pelo slug.
      tenantA = [a, b].find((t) => t!.slug.startsWith("iso-a"))!.id;
      tenantB = [a, b].find((t) => t!.slug.startsWith("iso-b"))!.id;

      await admin.insert(users).values(
        [userA, userB, userAmbos].map((id) => ({
          id,
          name: id,
          email: `${id}@teste.meuproduto.local`,
        }))
      );
      await admin.insert(tenantUsers).values([
        { tenantId: tenantA, userId: userA, role: "owner" },
        { tenantId: tenantB, userId: userB, role: "owner" },
        { tenantId: tenantA, userId: userAmbos, role: "viewer" },
        { tenantId: tenantB, userId: userAmbos, role: "member" },
      ]);
      await admin
        .insert(clients)
        .values([
          ...nomesA.map((name) => ({ tenantId: tenantA, name })),
          ...nomesB.map((name) => ({ tenantId: tenantB, name })),
        ]);
    });

    afterAll(async () => {
      if (!admin) return;
      if (tenantA && tenantB) {
        await admin
          .delete(clients)
          .where(inArray(clients.tenantId, [tenantA, tenantB]));
        await admin
          .delete(tenants)
          .where(inArray(tenants.id, [tenantA, tenantB]));
      }
      if (orgId)
        await admin.delete(organizations).where(eq(organizations.id, orgId));
      await admin
        .delete(users)
        .where(inArray(users.id, [userA, userB, userAmbos]));
      await Promise.all([encerrarDb(admin), encerrarDb(app)]);
    });

    /** Clientes de um tenant vistos pelo dono (sem RLS): a verdade do banco. */
    async function clientesNoBanco(tenantId: string) {
      return admin
        .select({ id: clients.id, name: clients.name })
        .from(clients)
        .where(eq(clients.tenantId, tenantId));
    }

    it("a conexão da app é meuproduto_app, sem ser dona e sem BYPASSRLS", async () => {
      const [papel] = await app.execute<{
        usuario: string;
        bypass: boolean;
        superuser: boolean;
      }>(
        sql`select current_user as usuario, rolbypassrls as bypass, rolsuper as superuser from pg_roles where rolname = current_user`
      );
      expect(papel).toEqual({
        usuario: "meuproduto_app",
        bypass: false,
        superuser: false,
      });
      const [dono] = await admin.execute<{ owner: string }>(
        sql`select tableowner as owner from pg_tables where tablename = 'client'`
      );
      expect(dono!.owner).not.toBe("meuproduto_app");
    });

    it("(a) sem withTenant, select em client devolve 0 linhas", async () => {
      expect(await app.select().from(clients)).toHaveLength(0);
      const cru = await app.execute(sql`select * from client`);
      expect(cru).toHaveLength(0);
      // E o dono enxerga tudo: as linhas existem, quem esconde é a policy.
      expect((await clientesNoBanco(tenantA)).length).toBe(3);
    });

    it("(b) withTenant(A) só vê os clients de A", async () => {
      const r = await withTenant(app, tenantA, async (tx) =>
        Ok(await tx.select().from(clients))
      );
      expect(r.ok).toBe(true);
      if (!r.ok) return;
      expect(r.value.map((c) => c.name).sort()).toEqual([...nomesA].sort());
      expect(new Set(r.value.map((c) => c.tenantId))).toEqual(
        new Set([tenantA])
      );

      const rb = await withTenant(app, tenantB, async (tx) =>
        Ok(await tx.select({ name: clients.name }).from(clients))
      );
      expect(rb.ok && rb.value.map((c) => c.name).sort()).toEqual(
        [...nomesB].sort()
      );
    });

    it("(c) withTenant(A) não consegue inserir client com tenant_id de B", async () => {
      const r = await withTenant(app, tenantA, async (tx) => {
        await tx.insert(clients).values({ tenantId: tenantB, name: "intruso" });
        return Ok("não devia chegar aqui");
      });
      expect(r.ok).toBe(false);
      if (r.ok) return;
      expect(r.error.category).toBe("security");
      expect(r.error.code).toBe("TENANT_SCOPE_VIOLATION");
      expect(r.error.retryable).toBeUndefined();
      expect(codigoPostgres(r.error.cause)).toBe("42501");
      expect(r.error.context?.tenantId).toBe(tenantA);
      // A mensagem não carrega dado nem SQL (docs/produto/04).
      expect(r.error.message).not.toMatch(/intruso|insert|client/i);
      expect((await clientesNoBanco(tenantB)).map((c) => c.name)).not.toContain(
        "intruso"
      );
    });

    it("(d) update/delete em linha de B dentro de withTenant(A) afetam 0 linhas", async () => {
      const [alvo] = await clientesNoBanco(tenantB);
      const r = await withTenant(app, tenantA, async (tx) => {
        const atualizados = await tx
          .update(clients)
          .set({ name: "alterado por A" })
          .where(eq(clients.id, alvo!.id))
          .returning();
        const apagados = await tx
          .delete(clients)
          .where(eq(clients.id, alvo!.id))
          .returning();
        // Nem sem filtro: o "update em tudo" de A só alcança as linhas de A.
        const todos = await tx
          .update(clients)
          .set({ name: sql`${clients.name}` })
          .returning({ tenantId: clients.tenantId });
        return Ok({ atualizados, apagados, todos });
      });
      expect(r.ok).toBe(true);
      if (!r.ok) return;
      expect(r.value.atualizados).toHaveLength(0);
      expect(r.value.apagados).toHaveLength(0);
      expect(r.value.todos).toHaveLength(nomesA.length);
      expect(new Set(r.value.todos.map((c) => c.tenantId))).toEqual(
        new Set([tenantA])
      );
      expect(await clientesNoBanco(tenantB)).toContainEqual(alvo);
    });

    it("(d') withTenant(A) não consegue mover um client seu para B", async () => {
      const [deA] = await clientesNoBanco(tenantA);
      const r = await withTenant(app, tenantA, async (tx) =>
        Ok(
          await tx
            .update(clients)
            .set({ tenantId: tenantB })
            .where(eq(clients.id, deA!.id))
            .returning()
        )
      );
      expect(r.ok).toBe(false);
      if (!r.ok) expect(codigoPostgres(r.error.cause)).toBe("42501");
      expect(await clientesNoBanco(tenantA)).toContainEqual(deA);
    });

    it("(e) set_config é local à transação: fora do withTenant volta a ver 0", async () => {
      const dentro = await withTenant(app, tenantA, async (tx) =>
        Ok(await tx.select().from(clients))
      );
      expect(dentro.ok && dentro.value.length).toBe(nomesA.length);

      // Mesma conexão (max: 1), logo depois da transação.
      const [{ valor } = { valor: "?" }] = await app.execute<{
        valor: string | null;
      }>(sql`select current_setting('app.tenant_id', true) as valor`);
      expect(valor ?? "").toBe("");
      expect(await app.select().from(clients)).toHaveLength(0);
    });

    it("Err devolvido por fn faz rollback do que foi gravado", async () => {
      const nome = `rollback-${sufixo}`;
      const r = await withTenant(app, tenantA, async (tx) => {
        await tx.insert(clients).values({ tenantId: tenantA, name: nome });
        return Err(
          new AppError({
            category: "domain",
            code: "RECUSADO",
            message: "recusado",
          })
        );
      });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe("RECUSADO");
      expect((await clientesNoBanco(tenantA)).map((c) => c.name)).not.toContain(
        nome
      );
    });

    it("tenant inexistente (UUID válido) não vê nada", async () => {
      const r = await withTenant(app, randomUUID(), async (tx) =>
        Ok(await tx.select().from(clients))
      );
      expect(r.ok && r.value).toEqual([]);
    });

    describe("(f) RLS em tenant_user", () => {
      it("sem contexto, 0 linhas", async () => {
        expect(await app.select().from(tenantUsers)).toHaveLength(0);
      });

      it("withTenant(A) só vê as memberships de A", async () => {
        const r = await withTenant(app, tenantA, async (tx) =>
          Ok(await tx.select().from(tenantUsers))
        );
        expect(r.ok).toBe(true);
        if (!r.ok) return;
        expect(new Set(r.value.map((m) => m.tenantId))).toEqual(
          new Set([tenantA])
        );
        expect(r.value.map((m) => m.userId).sort()).toEqual(
          [userA, userAmbos].sort()
        );
      });

      it("withUser(U) vê só as memberships do próprio U, em todos os tenants", async () => {
        const r = await withUser(app, userAmbos, async (tx) =>
          Ok(await tx.select().from(tenantUsers))
        );
        expect(r.ok).toBe(true);
        if (!r.ok) return;
        expect(r.value.map((m) => m.userId)).toEqual([userAmbos, userAmbos]);
        expect(new Set(r.value.map((m) => m.tenantId))).toEqual(
          new Set([tenantA, tenantB])
        );
      });

      it("withUser não abre os dados de negócio de nenhum tenant", async () => {
        const r = await withUser(app, userAmbos, async (tx) =>
          Ok(await tx.select().from(clients))
        );
        expect(r.ok && r.value).toEqual([]);
      });

      it("withUser não grava em tenant_user (nem para si mesmo)", async () => {
        const r = await withUser(app, userA, async (tx) => {
          await tx
            .insert(tenantUsers)
            .values({ tenantId: tenantB, userId: userA, role: "owner" });
          return Ok(null);
        });
        expect(r.ok).toBe(false);
        if (!r.ok) expect(codigoPostgres(r.error.cause)).toBe("42501");

        const promover = await withUser(app, userAmbos, async (tx) =>
          Ok(
            await tx
              .update(tenantUsers)
              .set({ role: "owner" })
              .where(eq(tenantUsers.userId, userAmbos))
              .returning()
          )
        );
        expect(promover.ok && promover.value).toEqual([]);
      });

      it("withTenant(A) não insere nem altera membership de B", async () => {
        const r = await withTenant(app, tenantA, async (tx) => {
          await tx
            .insert(tenantUsers)
            .values({ tenantId: tenantB, userId: userA, role: "owner" });
          return Ok(null);
        });
        expect(r.ok).toBe(false);
        if (!r.ok) expect(r.error.code).toBe("TENANT_SCOPE_VIOLATION");

        const d = await withTenant(app, tenantA, async (tx) =>
          Ok(
            await tx
              .delete(tenantUsers)
              .where(eq(tenantUsers.userId, userB))
              .returning()
          )
        );
        expect(d.ok && d.value).toEqual([]);
        const [ainda] = await admin
          .select()
          .from(tenantUsers)
          .where(eq(tenantUsers.userId, userB));
        expect(ainda?.tenantId).toBe(tenantB);
      });

      it("o contexto de usuário também é local à transação", async () => {
        await withUser(app, userA, async (tx) =>
          Ok(await tx.select().from(tenantUsers))
        );
        expect(await app.select().from(tenantUsers)).toHaveLength(0);
      });
    });
  }
);
