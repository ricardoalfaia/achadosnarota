/**
 * Resgate de benefício (ADR-005 de produto). Unitários sempre rodam; a parte
 * de integração usa o Postgres de verdade (achados_app para o assinante, o
 * dono no lugar do papel do painel do parceiro) e é pulada sem banco, como em
 * isolamento.test.ts.
 */
import { randomBytes } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { criarDb, encerrarDb, type Db } from "./client";
import { withUser } from "./escopo";
import { novoId } from "./id";
import {
  ALFABETO_DO_CODIGO,
  consumirResgate,
  emitirResgate,
  fimDoPeriodo,
  gerarCodigo,
  hashDoCodigo,
  historicoDeResgates,
  inicioDoPeriodo,
  TAMANHO_DO_CODIGO,
  usosDosBeneficios,
} from "./resgate";
import {
  categories,
  cities,
  offers,
  partnerOperators,
  places,
  plans,
  redemptionAttempts,
  redemptions,
  subscriptions,
  users,
} from "./schema";

// ─── Unitários ───────────────────────────────────────────────────────────────

describe("código de resgate", () => {
  it("tem 6 caracteres do alfabeto sem ambíguos", () => {
    for (let i = 0; i < 50; i++) {
      const codigo = gerarCodigo();
      expect(codigo).toHaveLength(TAMANHO_DO_CODIGO);
      expect([...codigo].every((c) => ALFABETO_DO_CODIGO.includes(c))).toBe(
        true
      );
    }
  });

  it("o hash ignora caixa, espaço e hífen do que o garçom digitou", () => {
    expect(hashDoCodigo("abc-23 4")).toBe(hashDoCodigo("ABC234"));
    expect(hashDoCodigo("ABC234")).not.toBe(hashDoCodigo("ABC235"));
  });
});

describe("janela de uso, no calendário de Brasília", () => {
  // 15/03/2026 às 01:30 em Brasília (04:30 UTC), um domingo.
  const agora = new Date("2026-03-15T04:30:00Z");

  it("ano, mês, semana (segunda) e dia começam à meia-noite de Brasília", () => {
    expect(inicioDoPeriodo("year", agora)?.toISOString()).toBe(
      "2026-01-01T03:00:00.000Z"
    );
    expect(inicioDoPeriodo("month", agora)?.toISOString()).toBe(
      "2026-03-01T03:00:00.000Z"
    );
    expect(inicioDoPeriodo("week", agora)?.toISOString()).toBe(
      "2026-03-09T03:00:00.000Z"
    );
    expect(inicioDoPeriodo("day", agora)?.toISOString()).toBe(
      "2026-03-15T03:00:00.000Z"
    );
  });

  it("antes das 3h UTC ainda é o dia anterior em Brasília", () => {
    const virada = new Date("2027-01-01T02:59:00Z"); // 31/12/2026 23:59
    expect(inicioDoPeriodo("year", virada)?.toISOString()).toBe(
      "2026-01-01T03:00:00.000Z"
    );
  });

  it("o limite renova no começo da janela seguinte; sem limite não há janela", () => {
    expect(fimDoPeriodo("year", agora)?.toISOString()).toBe(
      "2027-01-01T03:00:00.000Z"
    );
    expect(fimDoPeriodo("week", agora)?.toISOString()).toBe(
      "2026-03-16T03:00:00.000Z"
    );
    expect(inicioDoPeriodo("unlimited", agora)).toBeNull();
    expect(fimDoPeriodo("unlimited", agora)).toBeNull();
  });
});

// ─── Integração ──────────────────────────────────────────────────────────────

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
    const [tabela] = await c`select to_regclass('public.redemption') as t`;
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
    `\n[@achados/db] testes de resgate PULADOS: ${motivo}.\n`
  );
}

describe.skipIf(motivo !== null)("resgate (integração)", () => {
  let admin: Db;
  // O assinante e o operador usam o papel do app (achados_app), sob RLS.
  let app: Db;
  const sufixo = randomBytes(4).toString("hex");
  const assinante = novoId();
  const semPassaporte = novoId();
  const garcomA = novoId();
  const garcomB = novoId();
  const garcomDeOutraCasa = novoId();
  const pessoas = [
    assinante,
    semPassaporte,
    garcomA,
    garcomB,
    garcomDeOutraCasa,
  ];
  const ids = {
    cidade: novoId(),
    categoria: novoId(),
    casa: novoId(),
    outraCasa: novoId(),
    anual: novoId(),
    semLimite: novoId(),
    plano: novoId(),
    assinatura: novoId(),
  };

  const usar = (codigo: string, operadorId = garcomA, placeId = ids.casa) =>
    consumirResgate(app, { codigo, placeId, operadorId });

  const emitir = async (offerId = ids.semLimite) => {
    const r = await emitirResgate(app, assinante, offerId);
    if (!r.ok) throw new Error(r.error.code);
    return r.value;
  };

  beforeAll(async () => {
    admin = criarDb(ADMIN_URL!, { max: 4 });
    app = criarDb(APP_URL!, { max: 3 });
    await admin.insert(users).values(
      pessoas.map((id, i) => ({
        id,
        name: `Resgate ${i}`,
        email: `resgate-${i}-${sufixo}@teste.achados.local`,
      }))
    );
    await admin.insert(cities).values({
      id: ids.cidade,
      name: "Cidade Resgate",
      state: "SP",
      slug: `cidade-resgate-${sufixo}`,
    });
    await admin.insert(categories).values({
      id: ids.categoria,
      slug: `categoria-resgate-${sufixo}`,
      name: "Categoria Resgate",
      icon: "utensils",
    });
    const casa = {
      cityId: ids.cidade,
      categoryId: ids.categoria,
      specialty: "Teste",
      summary: "Casa de teste.",
      status: "published" as const,
      publishedAt: new Date(),
    };
    await admin.insert(places).values([
      { ...casa, id: ids.casa, slug: `casa-${sufixo}`, name: "Casa" },
      { ...casa, id: ids.outraCasa, slug: `outra-${sufixo}`, name: "Outra" },
    ]);
    await admin.insert(partnerOperators).values([
      { userId: garcomA, placeId: ids.casa },
      { userId: garcomB, placeId: ids.casa },
      { userId: garcomDeOutraCasa, placeId: ids.outraCasa },
    ]);
    const oferta = {
      placeId: ids.casa,
      terms: "Regras.",
      icon: "gift",
      status: "active" as const,
    };
    await admin.insert(offers).values([
      {
        ...oferta,
        id: ids.anual,
        title: "2 por 1",
        kind: "two_for_one",
        limitPerUser: 1,
        usagePeriod: "year",
      },
      {
        ...oferta,
        id: ids.semLimite,
        title: "Café cortesia",
        kind: "courtesy",
        usagePeriod: "unlimited",
      },
    ]);
    await admin.insert(plans).values({
      id: ids.plano,
      name: `Plano resgate ${sufixo}`,
      priceCents: 100,
      active: false,
    });
    await admin.insert(subscriptions).values({
      id: ids.assinatura,
      userId: assinante,
      planId: ids.plano,
      status: "active",
      startsAt: new Date(Date.now() - 86_400_000),
      endsAt: new Date(Date.now() + 86_400_000),
    });
  });

  afterAll(async () => {
    if (!admin) return;
    await admin
      .delete(redemptionAttempts)
      .where(inArray(redemptionAttempts.userId, pessoas));
    await admin.delete(redemptions).where(inArray(redemptions.userId, pessoas));
    await admin
      .delete(partnerOperators)
      .where(inArray(partnerOperators.userId, pessoas));
    await admin
      .delete(subscriptions)
      .where(inArray(subscriptions.userId, pessoas));
    await admin.delete(plans).where(eq(plans.id, ids.plano));
    await admin
      .delete(offers)
      .where(inArray(offers.placeId, [ids.casa, ids.outraCasa]));
    await admin
      .delete(places)
      .where(inArray(places.id, [ids.casa, ids.outraCasa]));
    await admin.delete(categories).where(eq(categories.id, ids.categoria));
    await admin.delete(cities).where(eq(cities.id, ids.cidade));
    await admin.delete(users).where(inArray(users.id, pessoas));
    await Promise.all([encerrarDb(admin), encerrarDb(app)]);
  });

  it("sem passaporte vigente, não emite", async () => {
    const r = await emitirResgate(app, semPassaporte, ids.anual);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("RESGATE_SEM_PASSAPORTE");
  });

  it("emite código; o banco guarda só o hash", async () => {
    const { codigo } = await emitir();
    const linhas = await admin
      .select({ tokenHash: redemptions.tokenHash })
      .from(redemptions)
      .where(
        and(
          eq(redemptions.userId, assinante),
          eq(redemptions.offerId, ids.semLimite),
          eq(redemptions.status, "issued")
        )
      );
    expect(linhas).toEqual([{ tokenHash: hashDoCodigo(codigo) }]);
    expect(JSON.stringify(linhas)).not.toContain(codigo);
  });

  it("o garçom da casa consome e vê o benefício a aplicar", async () => {
    const { codigo } = await emitir();
    const uso = await usar(codigo.toLowerCase());
    expect(uso.ok).toBe(true);
    if (uso.ok) expect(uso.value.beneficio).toBe("Café cortesia");
  });

  it("emitir de novo cancela o código anterior", async () => {
    const primeiro = await emitir();
    await emitir();
    expect((await usar(primeiro.codigo)).ok).toBe(false);
  });

  it("quem não opera a casa não consome; garçom de outra casa não acha o código", async () => {
    const { codigo } = await emitir();
    const semVinculo = await usar(codigo, garcomDeOutraCasa, ids.casa);
    expect(semVinculo.ok).toBe(false);
    if (!semVinculo.ok)
      expect(semVinculo.error.code).toBe("RESGATE_OPERADOR_SEM_CASA");

    const naOutraCasa = await usar(codigo, garcomDeOutraCasa, ids.outraCasa);
    expect(naOutraCasa.ok).toBe(false);
    if (!naOutraCasa.ok)
      expect(naOutraCasa.error.code).toBe("RESGATE_NAO_ENCONTRADO");
  });

  it("código expirado não vale e fica marcado como expirado", async () => {
    const { codigo, expiraEm } = await emitir();
    const uso = await consumirResgate(app, {
      codigo,
      placeId: ids.casa,
      operadorId: garcomB,
      agora: new Date(expiraEm.getTime() + 1_000),
    });
    expect(uso.ok).toBe(false);
    if (!uso.ok) expect(uso.error.code).toBe("RESGATE_EXPIRADO");
    const [linha] = await admin
      .select({ status: redemptions.status })
      .from(redemptions)
      .where(eq(redemptions.tokenHash, hashDoCodigo(codigo)));
    expect(linha?.status).toBe("expired");
  });

  it("dois garçons ao mesmo tempo: só um consome", async () => {
    const { codigo } = await emitir();
    const tentativas = await Promise.all([
      usar(codigo, garcomA),
      usar(codigo, garcomB),
    ]);
    expect(tentativas.filter((t) => t.ok)).toHaveLength(1);
  });

  it("2 por 1 uma vez por ano: o segundo uso no ano é recusado", async () => {
    const { codigo } = await emitir(ids.anual);
    expect((await usar(codigo)).ok).toBe(true);

    const segundo = await emitirResgate(app, assinante, ids.anual);
    expect(segundo.ok).toBe(false);
    if (!segundo.ok) {
      expect(segundo.error.code).toBe("RESGATE_LIMITE_ATINGIDO");
      expect(segundo.error.details?.renovaEm).toMatch(/-01-01T03:00:00/);
    }
  });

  it("depois de 5 códigos errados em 15 minutos, o garçom é bloqueado", async () => {
    for (let i = 0; i < 5; i++) {
      const errado = await usar("ZZZZZZ", garcomDeOutraCasa, ids.outraCasa);
      expect(errado.ok).toBe(false);
    }
    const bloqueado = await usar("ZZZZZZ", garcomDeOutraCasa, ids.outraCasa);
    expect(bloqueado.ok).toBe(false);
    if (!bloqueado.ok)
      expect(bloqueado.error.code).toBe("RESGATE_TENTATIVAS_EXCEDIDAS");
  });

  it("o garçom não apaga as próprias tentativas para zerar o limite (RLS)", async () => {
    const r = await withUser(app, garcomDeOutraCasa, async (tx) => {
      const apagadas = await tx
        .delete(redemptionAttempts)
        .where(eq(redemptionAttempts.userId, garcomDeOutraCasa))
        .returning({ id: redemptionAttempts.id });
      return { ok: true as const, value: apagadas.length };
    });
    expect(r).toEqual({ ok: true, value: 0 });
  });

  it("a pessoa não vê o resgate de outra nem marca o próprio como usado (RLS)", async () => {
    const outra = await withUser(app, semPassaporte, async (tx) => {
      const visiveis = await tx
        .select({ id: redemptions.id })
        .from(redemptions)
        .where(eq(redemptions.userId, assinante));
      return { ok: true as const, value: visiveis.length };
    });
    expect(outra).toEqual({ ok: true, value: 0 });

    const forjado = await withUser(app, assinante, async (tx) => {
      await tx.insert(redemptions).values({
        userId: assinante,
        offerId: ids.semLimite,
        placeId: ids.casa,
        subscriptionId: ids.assinatura,
        tokenHash: hashDoCodigo(gerarCodigo()),
        expiresAt: new Date(Date.now() + 60_000),
        status: "redeemed",
        redeemedAt: new Date(),
      });
      return { ok: true as const, value: true };
    });
    expect(forjado.ok).toBe(false);

    // Entrar pela política de cancelar o próprio código e sair como "usado".
    const { codigo } = await emitir();
    const autovalidado = await withUser(app, assinante, async (tx) => {
      const alteradas = await tx
        .update(redemptions)
        .set({
          status: "redeemed",
          redeemedAt: new Date(),
          operatorId: assinante,
        })
        .where(eq(redemptions.tokenHash, hashDoCodigo(codigo)))
        .returning({ id: redemptions.id });
      return { ok: true as const, value: alteradas.length };
    });
    expect(autovalidado.ok).toBe(false);
  });

  it("a ficha sabe que o 2 por 1 do ano já foi usado e quando renova", async () => {
    const usos = await usosDosBeneficios(app, assinante, [
      { id: ids.anual, limite: 1, periodo: "year" },
      { id: ids.semLimite, limite: 1, periodo: "unlimited" },
    ]);
    expect(usos.ok).toBe(true);
    if (!usos.ok) return;
    const anual = usos.value.get(ids.anual);
    expect(anual?.disponivel).toBe(false);
    expect(anual?.renovaEm?.toISOString()).toMatch(/-01-01T03:00:00/);
    expect(usos.value.has(ids.semLimite)).toBe(false);
  });

  it("o histórico traz os usos da própria pessoa, sem hash nem operador", async () => {
    const historico = await historicoDeResgates(app, assinante);
    expect(historico.ok).toBe(true);
    if (!historico.ok) return;
    expect(
      historico.value.some(
        (r) => r.beneficio === "2 por 1" && r.situacao === "redeemed"
      )
    ).toBe(true);
    expect(JSON.stringify(historico.value)).not.toMatch(/tokenHash|operator/);

    const deOutra = await historicoDeResgates(app, semPassaporte);
    expect(deOutra.ok && deOutra.value).toEqual([]);
  });
});
