/**
 * Assinaturas pagas (ADR-006 de produto), contra o Postgres de verdade: o
 * webhook conecta como achados_pagamentos; o papel do app só lê. Pulado sem
 * banco, como em isolamento.test.ts.
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
  processarEventoDePagamento,
  type CompraDoPassaporte,
} from "./pagamentos";
import { paymentEvents, plans, subscriptions, users } from "./schema";

const EXIGIR = process.env.ACHADOS_EXIGIR_BANCO === "1";
const APP_URL = process.env.DATABASE_URL;
const ADMIN_URL = process.env.DATABASE_URL_ADMIN;
const PAGAMENTOS_URL = process.env.DATABASE_URL_PAGAMENTOS;

async function sondar(): Promise<string | null> {
  if (!APP_URL || !ADMIN_URL || !PAGAMENTOS_URL)
    return "DATABASE_URL, _ADMIN ou _PAGAMENTOS não definidas";
  const c = postgres(PAGAMENTOS_URL, {
    max: 1,
    connect_timeout: 3,
    onnotice: () => {},
  });
  try {
    await c`select 1 from payment_event limit 1`;
  } catch (erro) {
    return `papel de pagamentos indisponível (${(erro as Error).message}); rode db:migrate e db:setup-papel-de-pagamentos`;
  } finally {
    await c.end({ timeout: 1 });
  }
  return null;
}

const motivo = await sondar();
if (motivo) {
  if (EXIGIR) throw new Error(`ACHADOS_EXIGIR_BANCO=1, mas ${motivo}.`);
  process.stderr.write(
    `\n[@achados/db] testes de pagamento PULADOS: ${motivo}.\n`
  );
}

describe.skipIf(motivo !== null)("pagamentos (integração)", () => {
  let admin: Db;
  let app: Db;
  let pagamentos: Db;
  const sufixo = randomBytes(4).toString("hex");
  const pessoa = novoId();
  const plano = novoId();
  const eventos: string[] = [];

  const evento = (tipo = "checkout.session.completed") => {
    const id = `evt_teste_${sufixo}_${eventos.length}`;
    eventos.push(id);
    return { id, tipo };
  };
  const compra = (
    sessaoId: string,
    extra: Partial<CompraDoPassaporte> = {}
  ): CompraDoPassaporte => ({
    userId: pessoa,
    planId: plano,
    sessaoId,
    pagamentoId: `pi_${sessaoId}`,
    valorEmCentavos: 12900,
    moeda: "brl",
    ...extra,
  });
  const assinaturas = () =>
    admin.select().from(subscriptions).where(eq(subscriptions.userId, pessoa));

  beforeAll(async () => {
    admin = criarDb(ADMIN_URL!, { max: 1 });
    app = criarDb(APP_URL!, { max: 1 });
    pagamentos = criarDb(PAGAMENTOS_URL!, { max: 1 });
    await admin.insert(users).values({
      id: pessoa,
      name: "Pagante",
      email: `pagante-${sufixo}@teste.achados.local`,
    });
    await admin.insert(plans).values({
      id: plano,
      name: `Plano pagamento ${sufixo}`,
      priceCents: 12900,
      active: false,
    });
  });

  afterAll(async () => {
    if (!admin) return;
    await admin.delete(subscriptions).where(eq(subscriptions.userId, pessoa));
    if (eventos.length)
      await admin
        .delete(paymentEvents)
        .where(inArray(paymentEvents.id, eventos));
    await admin.delete(plans).where(eq(plans.id, plano));
    await admin.delete(users).where(eq(users.id, pessoa));
    await Promise.all([
      encerrarDb(admin),
      encerrarDb(app),
      encerrarDb(pagamentos),
    ]);
  });

  it("Pix gerado fica pendente; o pagamento confirmado ativa por um ano", async () => {
    const agora = new Date("2026-10-18T12:00:00Z");
    expect(
      await processarEventoDePagamento(
        pagamentos,
        evento(),
        { tipo: "pendente", compra: compra(`cs_pix_${sufixo}`) },
        agora
      )
    ).toEqual(Ok("pendente"));
    expect((await assinaturas())[0]?.status).toBe("pending");

    expect(
      await processarEventoDePagamento(
        pagamentos,
        evento("checkout.session.async_payment_succeeded"),
        { tipo: "pago", compra: compra(`cs_pix_${sufixo}`) },
        agora
      )
    ).toEqual(Ok("ativado"));
    const [ativa] = await assinaturas();
    expect(ativa?.status).toBe("active");
    expect(ativa?.endsAt?.toISOString()).toBe("2027-10-18T12:00:00.000Z");
  });

  it("o mesmo evento entregue de novo não duplica nada", async () => {
    const repetido = evento("checkout.session.async_payment_succeeded");
    const acao = {
      tipo: "pago" as const,
      compra: compra(`cs_pix_${sufixo}`),
    };
    await processarEventoDePagamento(pagamentos, repetido, acao);
    expect(
      await processarEventoDePagamento(pagamentos, repetido, acao)
    ).toEqual(Ok("duplicado"));
    expect(await assinaturas()).toHaveLength(1);
  });

  it("renovar com o passaporte valendo emenda o novo ano no fim do atual", async () => {
    const resultado = await processarEventoDePagamento(
      pagamentos,
      evento(),
      { tipo: "pago", compra: compra(`cs_cartao_${sufixo}`) },
      new Date("2027-09-01T12:00:00Z")
    );
    expect(resultado).toEqual(Ok("ativado"));
    const renovada = (await assinaturas()).find(
      (s) => s.providerSubscriptionId === `cs_cartao_${sufixo}`
    );
    expect(renovada?.startsAt?.toISOString()).toBe("2027-10-18T12:00:00.000Z");
    expect(renovada?.endsAt?.toISOString()).toBe("2028-10-17T12:00:00.000Z");
  });

  it("valor diferente do plano não ativa (conciliação)", async () => {
    const divergente = await processarEventoDePagamento(pagamentos, evento(), {
      tipo: "pago",
      compra: compra(`cs_barato_${sufixo}`, { valorEmCentavos: 100 }),
    });
    expect(divergente.ok).toBe(false);
    if (!divergente.ok)
      expect(divergente.error.code).toBe("PAGAMENTO_DIVERGENTE");
    expect(
      (await assinaturas()).some(
        (s) => s.providerSubscriptionId === `cs_barato_${sufixo}`
      )
    ).toBe(false);
  });

  it("Pix que expira cancela a pendente; estorno desativa", async () => {
    await processarEventoDePagamento(pagamentos, evento(), {
      tipo: "pendente",
      compra: compra(`cs_expira_${sufixo}`),
    });
    expect(
      await processarEventoDePagamento(
        pagamentos,
        evento("checkout.session.async_payment_failed"),
        { tipo: "falhou", sessaoId: `cs_expira_${sufixo}` }
      )
    ).toEqual(Ok("cancelado"));

    expect(
      await processarEventoDePagamento(pagamentos, evento("charge.refunded"), {
        tipo: "estornado",
        pagamentoId: `pi_cs_cartao_${sufixo}`,
      })
    ).toEqual(Ok("estornado"));
    const situacoes = Object.fromEntries(
      (await assinaturas()).map((s) => [s.providerSubscriptionId, s.status])
    );
    expect(situacoes[`cs_expira_${sufixo}`]).toBe("canceled");
    expect(situacoes[`cs_cartao_${sufixo}`]).toBe("refunded");
  });

  it("o papel do app não cria assinatura, nem para si (RLS)", async () => {
    const tentativa = await withUser(app, pessoa, async (tx) => {
      await tx.insert(subscriptions).values({
        userId: pessoa,
        planId: plano,
        status: "active",
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 86_400_000),
      });
      return Ok(true);
    });
    expect(tentativa.ok).toBe(false);
  });
});
