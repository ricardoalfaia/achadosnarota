/**
 * Testes de isolamento A/B entre pessoas e de publicação do catálogo.
 *
 * Rodam contra o Postgres de verdade, conectados como achados_app (o papel da
 * app, sujeito a RLS). Sem banco no ar, ou sem as migrações aplicadas, a parte
 * de integração é PULADA com aviso, para `pnpm test` não quebrar numa máquina
 * sem Docker; com ACHADOS_EXIGIR_BANCO=1 (`pnpm --filter @achados/db
 * test:integracao`, o modo do CI) isso FALHA o teste.
 *
 * Os dados são criados aqui (como dono), com slugs aleatórios, e apagados no
 * fim: não dependem do seed nem interferem nele.
 */
import { randomBytes } from "node:crypto";
import { AppError, Err, Ok } from "@achados/core";
import { eq, inArray, sql } from "drizzle-orm";
import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { criarDb, encerrarDb, type Db } from "./client";
import { codigoPostgres, lerPublico, validarUserId, withUser } from "./escopo";
import { novoId } from "./id";
import {
  categories,
  cities,
  editorialReviews,
  favorites,
  offers,
  places,
  plans,
  subscriptions,
  users,
} from "./schema";

// ─── Unitários (sempre rodam) ────────────────────────────────────────────────

describe("validação de contexto", () => {
  it("aceita id de usuário opaco", () => {
    const id = novoId();
    expect(validarUserId(id)).toEqual(Ok(id));
  });

  it.each(["", " ", "com espaço", "x".repeat(129)])(
    "recusa userId inválido %j",
    (valor) => {
      const r = validarUserId(valor);
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.error.category).toBe("validation");
        expect(r.error.code).toBe("USER_ID_INVALID");
      }
    }
  );

  it("recusa userId que não é string", () => {
    expect(validarUserId(undefined).ok).toBe(false);
    expect(validarUserId(42).ok).toBe(false);
  });

  it("acha o SQLSTATE na cadeia de cause", () => {
    const pg = Object.assign(new Error("rls"), { code: "42501" });
    expect(codigoPostgres(new Error("drizzle", { cause: pg }))).toBe("42501");
    expect(codigoPostgres(new Error("sem código"))).toBeUndefined();
  });
});

// ─── Integração (Postgres local ou serviço do CI) ────────────────────────────

const EXIGIR = process.env.ACHADOS_EXIGIR_BANCO === "1";
const APP_URL = process.env.DATABASE_URL;
const ADMIN_URL = process.env.DATABASE_URL_ADMIN;

async function sondar(): Promise<string | null> {
  if (!APP_URL || !ADMIN_URL)
    return "DATABASE_URL/DATABASE_URL_ADMIN não definidas";
  for (const url of [APP_URL, ADMIN_URL]) {
    const c = postgres(url, { max: 1, connect_timeout: 3, onnotice: () => {} });
    try {
      await c`select 1`;
      const [tabela] = await c`select to_regclass('public.favorite') as t`;
      if (!tabela?.t) return "migrações não aplicadas (pnpm db:migrate)";
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
  if (EXIGIR) throw new Error(`ACHADOS_EXIGIR_BANCO=1, mas ${motivo}.`);
  // stderr direto: o reporter padrão do vitest esconde console.* de arquivo
  // que passou, e o aviso de que a integração não rodou não pode sumir.
  process.stderr.write(
    `\n[@achados/db] testes de isolamento PULADOS: ${motivo}.\n` +
      "  Suba o banco (pnpm infra:up && pnpm db:migrate) ou rode test:integracao no CI.\n"
  );
}

describe.skipIf(motivo !== null)(
  motivo
    ? `isolamento e publicação (RLS) PULADO: ${motivo}`
    : "isolamento e publicação (RLS)",
  () => {
    let admin: Db;
    // max: 1 → todas as queries da app usam A MESMA conexão: a conexão que fez
    // withUser é a que volta ao pool, o que prova que o contexto não vaza.
    let app: Db;
    const sufixo = randomBytes(4).toString("hex");
    const pessoaA = novoId();
    const pessoaB = novoId();
    const ids = {
      cidade: novoId(),
      categoria: novoId(),
      publicado: novoId(),
      rascunho: novoId(),
      ofertaAtiva: novoId(),
      ofertaPausada: novoId(),
      ofertaVencida: novoId(),
      plano: novoId(),
      assinaturaA: novoId(),
    };

    beforeAll(async () => {
      admin = criarDb(ADMIN_URL!, { max: 1 });
      app = criarDb(APP_URL!, { max: 1 });

      await admin.insert(users).values(
        [pessoaA, pessoaB].map((id, i) => ({
          id,
          name: `Pessoa ${i ? "B" : "A"}`,
          email: `iso-${i ? "b" : "a"}-${sufixo}@teste.achados.local`,
        }))
      );
      await admin.insert(cities).values({
        id: ids.cidade,
        name: "Cidade Teste",
        state: "SP",
        slug: `cidade-${sufixo}`,
      });
      await admin.insert(categories).values({
        id: ids.categoria,
        slug: `categoria-${sufixo}`,
        name: "Categoria Teste",
        icon: "utensils",
      });
      const lugar = {
        cityId: ids.cidade,
        categoryId: ids.categoria,
        specialty: "Teste",
        summary: "Lugar de teste.",
      };
      await admin.insert(places).values([
        {
          ...lugar,
          id: ids.publicado,
          slug: `publicado-${sufixo}`,
          name: "Publicado",
          status: "published",
          publishedAt: new Date(),
        },
        {
          ...lugar,
          id: ids.rascunho,
          slug: `rascunho-${sufixo}`,
          name: "Rascunho",
          status: "draft",
        },
      ]);
      const oferta = {
        placeId: ids.publicado,
        terms: "Regras.",
        kind: "discount" as const,
        icon: "percent",
      };
      await admin.insert(offers).values([
        { ...oferta, id: ids.ofertaAtiva, title: "Ativa", status: "active" },
        {
          ...oferta,
          id: ids.ofertaPausada,
          title: "Pausada",
          status: "paused",
        },
        {
          ...oferta,
          id: ids.ofertaVencida,
          title: "Vencida",
          status: "active",
          validUntil: new Date(Date.now() - 60_000),
        },
      ]);
      await admin.insert(editorialReviews).values([
        {
          placeId: ids.publicado,
          score: "4.5",
          summary: "Publicada.",
          visitedOn: "2026-10-01",
          status: "published",
          publishedAt: new Date(),
        },
        {
          placeId: ids.publicado,
          score: "1.0",
          summary: "Em revisão.",
          visitedOn: "2026-10-02",
          status: "in_review",
        },
      ]);
      await admin.insert(plans).values({
        id: ids.plano,
        name: `Plano ${sufixo}`,
        priceCents: 100,
        active: false,
      });
      await admin.insert(subscriptions).values({
        id: ids.assinaturaA,
        userId: pessoaA,
        planId: ids.plano,
        status: "active",
        startsAt: new Date(Date.now() - 86_400_000),
        endsAt: new Date(Date.now() + 86_400_000),
      });
      await admin
        .insert(favorites)
        .values({ userId: pessoaA, placeId: ids.publicado });
    });

    afterAll(async () => {
      if (!admin) return;
      await admin
        .delete(favorites)
        .where(inArray(favorites.userId, [pessoaA, pessoaB]));
      await admin
        .delete(subscriptions)
        .where(inArray(subscriptions.userId, [pessoaA, pessoaB]));
      await admin.delete(plans).where(eq(plans.id, ids.plano));
      await admin
        .delete(offers)
        .where(inArray(offers.placeId, [ids.publicado, ids.rascunho]));
      await admin
        .delete(editorialReviews)
        .where(
          inArray(editorialReviews.placeId, [ids.publicado, ids.rascunho])
        );
      await admin
        .delete(places)
        .where(inArray(places.id, [ids.publicado, ids.rascunho]));
      await admin.delete(categories).where(eq(categories.id, ids.categoria));
      await admin.delete(cities).where(eq(cities.id, ids.cidade));
      await admin.delete(users).where(inArray(users.id, [pessoaA, pessoaB]));
      await Promise.all([encerrarDb(admin), encerrarDb(app)]);
    });

    describe("catálogo público", () => {
      it("o app vê lugar publicado e não vê rascunho", async () => {
        const r = await lerPublico(app, (db) =>
          db
            .select({ id: places.id })
            .from(places)
            .where(inArray(places.id, [ids.publicado, ids.rascunho]))
        );
        expect(r).toEqual(Ok([{ id: ids.publicado }]));
      });

      it("só a oferta ativa e dentro da validade aparece", async () => {
        const r = await lerPublico(app, (db) =>
          db
            .select({ id: offers.id })
            .from(offers)
            .where(eq(offers.placeId, ids.publicado))
        );
        expect(r).toEqual(Ok([{ id: ids.ofertaAtiva }]));
      });

      it("avaliação em revisão não aparece", async () => {
        const r = await lerPublico(app, (db) =>
          db
            .select({ summary: editorialReviews.summary })
            .from(editorialReviews)
            .where(eq(editorialReviews.placeId, ids.publicado))
        );
        expect(r).toEqual(Ok([{ summary: "Publicada." }]));
      });

      it("plano inativo não aparece", async () => {
        const r = await lerPublico(app, (db) =>
          db.select({ id: plans.id }).from(plans).where(eq(plans.id, ids.plano))
        );
        expect(r).toEqual(Ok([]));
      });

      it("o app não grava no catálogo (sem policy de escrita)", async () => {
        const r = await lerPublico(app, (db) =>
          db
            .update(places)
            .set({ name: "Invadido" })
            .where(eq(places.id, ids.publicado))
            .returning({ id: places.id })
        );
        // UPDATE sem policy que o permita não afeta linha nenhuma.
        expect(r).toEqual(Ok([]));
        const [verdade] = await admin
          .select({ name: places.name })
          .from(places)
          .where(eq(places.id, ids.publicado));
        expect(verdade?.name).toBe("Publicado");
      });

      it("o app não cria oferta", async () => {
        const r = await lerPublico(app, (db) =>
          db.insert(offers).values({
            placeId: ids.publicado,
            title: "Falsa",
            terms: "x",
            kind: "discount",
            icon: "percent",
            status: "active",
          })
        );
        expect(r.ok).toBe(false);
        if (!r.ok) expect(r.error.category).toBe("security");
      });
    });

    describe("favoritos (dado da pessoa)", () => {
      it("A vê o próprio favorito; B não vê o de A", async () => {
        const deA = await withUser(app, pessoaA, async (tx) =>
          Ok(await tx.select({ placeId: favorites.placeId }).from(favorites))
        );
        expect(deA).toEqual(Ok([{ placeId: ids.publicado }]));

        const deB = await withUser(app, pessoaB, async (tx) =>
          Ok(
            await tx
              .select({ placeId: favorites.placeId })
              .from(favorites)
              .where(eq(favorites.userId, pessoaA))
          )
        );
        expect(deB).toEqual(Ok([]));
      });

      it("B não grava favorito em nome de A", async () => {
        const r = await withUser(app, pessoaB, async (tx) => {
          await tx
            .insert(favorites)
            .values({ userId: pessoaA, placeId: ids.rascunho });
          return Ok(true);
        });
        expect(r.ok).toBe(false);
        if (!r.ok) {
          expect(r.error).toBeInstanceOf(AppError);
          expect(r.error.category).toBe("security");
          expect(r.error.code).toBe("USER_SCOPE_VIOLATION");
        }
      });

      it("B não apaga o favorito de A", async () => {
        const r = await withUser(app, pessoaB, async (tx) =>
          Ok(
            await tx
              .delete(favorites)
              .where(eq(favorites.userId, pessoaA))
              .returning({ placeId: favorites.placeId })
          )
        );
        expect(r).toEqual(Ok([]));
        const ainda = await admin
          .select()
          .from(favorites)
          .where(eq(favorites.userId, pessoaA));
        expect(ainda).toHaveLength(1);
      });

      it("B grava e apaga o próprio favorito", async () => {
        const gravou = await withUser(app, pessoaB, async (tx) =>
          Ok(
            await tx
              .insert(favorites)
              .values({ userId: pessoaB, placeId: ids.publicado })
              .returning({ placeId: favorites.placeId })
          )
        );
        expect(gravou).toEqual(Ok([{ placeId: ids.publicado }]));
        const apagou = await withUser(app, pessoaB, async (tx) =>
          Ok(
            await tx
              .delete(favorites)
              .where(eq(favorites.userId, pessoaB))
              .returning({ placeId: favorites.placeId })
          )
        );
        expect(apagou).toEqual(Ok([{ placeId: ids.publicado }]));
      });

      it("sem contexto de pessoa, nenhum favorito aparece", async () => {
        const r = await lerPublico(app, (db) => db.select().from(favorites));
        expect(r).toEqual(Ok([]));
      });

      it("o contexto não vaza para a próxima transação da mesma conexão", async () => {
        await withUser(app, pessoaA, async () => Ok(null));
        const [linha] = await app.execute<{ atual: string | null }>(
          sql`select nullif(current_setting('app.user_id', true), '') as atual`
        );
        expect(linha?.atual ?? null).toBeNull();
      });

      it("Err devolvido por fn desfaz a transação", async () => {
        const erro = new AppError({
          category: "validation",
          code: "PARAR",
          message: "parar",
        });
        const r = await withUser(app, pessoaB, async (tx) => {
          await tx
            .insert(favorites)
            .values({ userId: pessoaB, placeId: ids.publicado });
          return Err(erro);
        });
        expect(r).toEqual(Err(erro));
        const sobrou = await admin
          .select()
          .from(favorites)
          .where(eq(favorites.userId, pessoaB));
        expect(sobrou).toHaveLength(0);
      });
    });

    describe("assinatura (só leitura da própria)", () => {
      it("A lê a própria assinatura; B não lê a de A", async () => {
        const deA = await withUser(app, pessoaA, async (tx) =>
          Ok(await tx.select({ id: subscriptions.id }).from(subscriptions))
        );
        expect(deA).toEqual(Ok([{ id: ids.assinaturaA }]));
        const deB = await withUser(app, pessoaB, async (tx) =>
          Ok(await tx.select({ id: subscriptions.id }).from(subscriptions))
        );
        expect(deB).toEqual(Ok([]));
      });

      it("ninguém ativa assinatura pelo app", async () => {
        const r = await withUser(app, pessoaB, async (tx) => {
          await tx.insert(subscriptions).values({
            userId: pessoaB,
            planId: ids.plano,
            status: "active",
            startsAt: new Date(),
            endsAt: new Date(Date.now() + 86_400_000),
          });
          return Ok(true);
        });
        expect(r.ok).toBe(false);
        if (!r.ok) expect(r.error.category).toBe("security");
      });

      it("A não muda o estado da própria assinatura", async () => {
        const r = await withUser(app, pessoaA, async (tx) =>
          Ok(
            await tx
              .update(subscriptions)
              .set({ status: "canceled" })
              .where(eq(subscriptions.id, ids.assinaturaA))
              .returning({ id: subscriptions.id })
          )
        );
        expect(r).toEqual(Ok([]));
      });
    });

    describe("ids", () => {
      it("o banco recusa id que não é ULID", async () => {
        await expect(
          admin.insert(cities).values({
            id: "nao-e-ulid",
            name: "X",
            state: "SP",
            slug: `x-${sufixo}`,
          })
        ).rejects.toThrow();
      });
    });
  }
);
