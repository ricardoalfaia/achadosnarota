/**
 * Papéis da equipe (ADR-003 e ADR-004 de produto): o que cada papel lê e
 * escreve, provado no banco com o papel do app (achados_app) sob RLS. Pulado
 * sem banco, como em isolamento.test.ts.
 */
import { randomBytes } from "node:crypto";
import { Ok } from "@achados/core";
import { eq, inArray } from "drizzle-orm";
import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { criarDb, encerrarDb, type Db } from "./client";
import { withUser } from "./escopo";
import { novoId } from "./id";
import {
  auditEvents,
  categories,
  cities,
  editorialReviews,
  offers,
  partnerOperators,
  places,
  staffMembers,
  users,
} from "./schema";

const EXIGIR = process.env.ACHADOS_EXIGIR_BANCO === "1";
const APP_URL = process.env.DATABASE_URL;
const ADMIN_URL = process.env.DATABASE_URL_ADMIN;

async function sondar(): Promise<string | null> {
  if (!APP_URL || !ADMIN_URL)
    return "DATABASE_URL/DATABASE_URL_ADMIN não definidas";
  const c = postgres(ADMIN_URL, {
    max: 1,
    connect_timeout: 3,
    onnotice: () => {},
  });
  try {
    const [tabela] = await c`select to_regclass('public.staff_member') as t`;
    if (!tabela?.t) return "migrações não aplicadas (pnpm db:migrate)";
  } catch (erro) {
    return `banco não respondeu (${(erro as Error).message})`;
  } finally {
    await c.end({ timeout: 1 });
  }
  return null;
}

const motivo = await sondar();
if (motivo) {
  if (EXIGIR) throw new Error(`ACHADOS_EXIGIR_BANCO=1, mas ${motivo}.`);
  process.stderr.write(
    `\n[@achados/db] testes da equipe PULADOS: ${motivo}.\n`
  );
}

describe.skipIf(motivo !== null)("papéis da equipe (RLS)", () => {
  let admin: Db;
  let app: Db;
  const sufixo = randomBytes(4).toString("hex");
  const administradora = novoId();
  const curador = novoId();
  const comercial = novoId();
  const semPapel = novoId();
  const pessoas = [administradora, curador, comercial, semPapel];
  const ids = { cidade: novoId(), categoria: novoId(), rascunho: novoId() };

  /** Quantas linhas a pessoa consegue alterar (RLS some com as outras). */
  const renomear = (pessoa: string) =>
    withUser(app, pessoa, async (tx) => {
      const linhas = await tx
        .update(places)
        .set({ name: `Renomeada ${sufixo}` })
        .where(eq(places.id, ids.rascunho))
        .returning({ id: places.id });
      return Ok(linhas.length);
    });

  beforeAll(async () => {
    admin = criarDb(ADMIN_URL!, { max: 2 });
    app = criarDb(APP_URL!, { max: 2 });
    await admin.insert(users).values(
      pessoas.map((id, i) => ({
        id,
        name: `Equipe ${i}`,
        email: `equipe-${i}-${sufixo}@teste.achados.local`,
      }))
    );
    await admin.insert(staffMembers).values([
      { userId: administradora, role: "admin" },
      { userId: curador, role: "curator" },
      { userId: comercial, role: "commercial" },
    ]);
    await admin.insert(cities).values({
      id: ids.cidade,
      name: "Cidade Equipe",
      state: "SP",
      slug: `cidade-equipe-${sufixo}`,
    });
    await admin.insert(categories).values({
      id: ids.categoria,
      slug: `categoria-equipe-${sufixo}`,
      name: "Categoria Equipe",
      icon: "utensils",
    });
    await admin.insert(places).values({
      id: ids.rascunho,
      cityId: ids.cidade,
      categoryId: ids.categoria,
      slug: `rascunho-equipe-${sufixo}`,
      name: "Rascunho",
      specialty: "Teste",
      summary: "Casa em rascunho.",
      status: "draft",
    });
  });

  afterAll(async () => {
    if (!admin) return;
    await admin
      .delete(auditEvents)
      .where(inArray(auditEvents.actorId, pessoas));
    await admin
      .delete(partnerOperators)
      .where(eq(partnerOperators.placeId, ids.rascunho));
    await admin.delete(offers).where(eq(offers.placeId, ids.rascunho));
    await admin
      .delete(editorialReviews)
      .where(eq(editorialReviews.placeId, ids.rascunho));
    await admin.delete(places).where(eq(places.id, ids.rascunho));
    await admin.delete(categories).where(eq(categories.id, ids.categoria));
    await admin.delete(cities).where(eq(cities.id, ids.cidade));
    await admin
      .delete(staffMembers)
      .where(inArray(staffMembers.userId, pessoas));
    await admin.delete(users).where(inArray(users.id, pessoas));
    await Promise.all([encerrarDb(admin), encerrarDb(app)]);
  });

  it("a equipe lê casa em rascunho; quem não é da equipe não lê", async () => {
    const ler = (pessoa: string) =>
      withUser(app, pessoa, async (tx) =>
        Ok(
          (
            await tx
              .select({ id: places.id })
              .from(places)
              .where(eq(places.id, ids.rascunho))
          ).length
        )
      );
    expect(await ler(comercial)).toEqual(Ok(1));
    expect(await ler(semPapel)).toEqual(Ok(0));
  });

  it("curador e administração editam a casa; comercial e quem não é da equipe, não", async () => {
    expect(await renomear(curador)).toEqual(Ok(1));
    expect(await renomear(administradora)).toEqual(Ok(1));
    expect(await renomear(comercial)).toEqual(Ok(0));
    expect(await renomear(semPapel)).toEqual(Ok(0));
  });

  it("o curador escreve a curadoria e não a promoção; o comercial, o contrário", async () => {
    const avaliar = (pessoa: string) =>
      withUser(app, pessoa, async (tx) => {
        await tx.insert(editorialReviews).values({
          placeId: ids.rascunho,
          score: "4.5",
          summary: "Parecer.",
          visitedOn: "2026-10-01",
          status: "draft",
        });
        return Ok(true);
      });
    const promover = (pessoa: string) =>
      withUser(app, pessoa, async (tx) => {
        await tx.insert(offers).values({
          placeId: ids.rascunho,
          title: "Promoção",
          terms: "Regras.",
          kind: "discount",
          icon: "percent",
          status: "draft",
        });
        return Ok(true);
      });

    expect((await avaliar(curador)).ok).toBe(true);
    expect((await promover(curador)).ok).toBe(false);
    expect((await promover(comercial)).ok).toBe(true);
    expect((await avaliar(comercial)).ok).toBe(false);
  });

  it("só a administração vincula operadores ao balcão", async () => {
    const vincular = (pessoa: string) =>
      withUser(app, pessoa, async (tx) => {
        await tx
          .insert(partnerOperators)
          .values({ userId: semPapel, placeId: ids.rascunho });
        return Ok(true);
      });
    expect((await vincular(curador)).ok).toBe(false);
    expect((await vincular(administradora)).ok).toBe(true);
  });

  it("a equipe registra a auditoria em nome próprio; só a administração lê", async () => {
    const registrar = (pessoa: string, ator = pessoa) =>
      withUser(app, pessoa, async (tx) => {
        await tx.insert(auditEvents).values({
          actorId: ator,
          action: "casa.alterada",
          entity: "place",
          entityId: ids.rascunho,
          details: { campos: ["name"] },
        });
        return Ok(true);
      });
    expect((await registrar(curador)).ok).toBe(true);
    expect((await registrar(semPapel)).ok).toBe(false);
    expect((await registrar(curador, administradora)).ok).toBe(false);

    const ler = (pessoa: string) =>
      withUser(app, pessoa, async (tx) =>
        Ok(
          (
            await tx
              .select({ id: auditEvents.id })
              .from(auditEvents)
              .where(eq(auditEvents.entityId, ids.rascunho))
          ).length
        )
      );
    expect(await ler(curador)).toEqual(Ok(0));
    expect(await ler(administradora)).toEqual(Ok(1));

    // Ninguém apaga a auditoria pelo app.
    const apagar = await withUser(app, administradora, async (tx) =>
      Ok(
        (
          await tx
            .delete(auditEvents)
            .where(eq(auditEvents.entityId, ids.rascunho))
            .returning({ id: auditEvents.id })
        ).length
      )
    );
    expect(apagar).toEqual(Ok(0));
  });
});
