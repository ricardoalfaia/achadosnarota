/**
 * A rota do webhook da Stripe de ponta a ponta, contra o Postgres local: o
 * evento é assinado como a Stripe assina (SDK oficial, segredo de teste) e a
 * rota grava com o papel achados_pagamentos. Pulado sem o banco local.
 */
import { randomBytes } from "node:crypto";
import {
  criarDb,
  encerrarDb,
  novoId,
  paymentEvents,
  plans,
  subscriptions,
  users,
  type Db,
} from "@achados/db";
import { eq, inArray } from "drizzle-orm";
import postgres from "postgres";
import Stripe from "stripe";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const ADMIN_URL = "postgresql://achados:achados@127.0.0.1:4550/achados";
const PAGAMENTOS_URL =
  "postgresql://achados_pagamentos:achados_pagamentos@127.0.0.1:4550/achados";
const SEGREDO = "whsec_teste_local_do_webhook";
const stripeDeTeste = new Stripe("sk_test_nao_usada_na_rede");

vi.mock("server-only", () => ({}));
// O e-mail de confirmação: capturado aqui, sem rede.
const enviados = vi.hoisted(() => [] as { para: string; assunto: string }[]);
vi.mock("@/shared/email/enviar.servidor", () => ({
  enviarEmail: async (mensagem: { para: string; assunto: string }) => {
    enviados.push(mensagem);
    return { ok: true, value: undefined };
  },
}));
vi.mock("@/shared/config/ambiente.servidor", () => ({
  ambienteServidor: () => ({ appUrl: "http://localhost:4500" }),
}));
// Fora de um pedido do Next, o `after` roda na hora.
vi.mock("next/server", async (original) => ({
  ...(await original<typeof import("next/server")>()),
  after: async (tarefa: () => Promise<void>) => {
    await tarefa();
  },
}));
vi.mock("@/shared/pagamentos/stripe.servidor", () => ({
  configuracaoDosPagamentos: () => ({
    chaveSecreta: "sk_test_nao_usada_na_rede",
    segredoDoWebhook: SEGREDO,
    databaseUrl: PAGAMENTOS_URL,
  }),
  stripe: () => stripeDeTeste,
  bancoDosPagamentos: () => criarDb(PAGAMENTOS_URL),
}));

const { POST } = await import("./route");

async function bancoNoAr(): Promise<boolean> {
  const c = postgres(PAGAMENTOS_URL, { max: 1, connect_timeout: 2 });
  try {
    await c`select 1 from payment_event limit 1`;
    return true;
  } catch {
    return false;
  } finally {
    await c.end({ timeout: 1 });
  }
}
const noAr = await bancoNoAr();

function pedidoAssinado(evento: object, segredo = SEGREDO): Request {
  const corpo = JSON.stringify(evento);
  return new Request("http://localhost/api/stripe/webhook", {
    method: "POST",
    body: corpo,
    headers: {
      "stripe-signature": stripeDeTeste.webhooks.generateTestHeaderString({
        payload: corpo,
        secret: segredo,
      }),
    },
  });
}

describe.skipIf(!noAr)("webhook da Stripe (rota)", () => {
  let admin: Db;
  const sufixo = randomBytes(4).toString("hex");
  const pessoa = novoId();
  const plano = novoId();
  const eventoPago = {
    id: `evt_rota_${sufixo}`,
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: `cs_rota_${sufixo}`,
        object: "checkout.session",
        mode: "payment",
        payment_status: "paid",
        amount_total: 12900,
        currency: "brl",
        payment_intent: `pi_rota_${sufixo}`,
        metadata: { userId: pessoa, planId: plano },
      },
    },
  };

  beforeAll(async () => {
    admin = criarDb(ADMIN_URL, { max: 1 });
    await admin.insert(users).values({
      id: pessoa,
      name: "Pagante da rota",
      email: `rota-${sufixo}@teste.achados.local`,
    });
    await admin.insert(plans).values({
      id: plano,
      name: `Plano rota ${sufixo}`,
      priceCents: 12900,
    });
  });

  afterAll(async () => {
    await admin.delete(subscriptions).where(eq(subscriptions.userId, pessoa));
    await admin
      .delete(paymentEvents)
      .where(inArray(paymentEvents.id, [eventoPago.id]));
    await admin.delete(plans).where(eq(plans.id, plano));
    await admin.delete(users).where(eq(users.id, pessoa));
    await encerrarDb(admin);
  });

  it("recusa evento sem assinatura válida e não grava nada", async () => {
    const resposta = await POST(pedidoAssinado(eventoPago, "whsec_outro"));
    expect(resposta.status).toBe(400);
    expect(
      await admin
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, pessoa))
    ).toEqual([]);
  });

  it("pagamento confirmado ativa o passaporte; o mesmo evento de novo não duplica", async () => {
    const primeira = await POST(pedidoAssinado(eventoPago));
    expect(primeira.status).toBe(200);
    expect(await primeira.json()).toMatchObject({ desfecho: "ativado" });

    // O e-mail de "passaporte ativo" foi para a pessoa certa.
    await vi.waitFor(() =>
      expect(enviados).toContainEqual(
        expect.objectContaining({
          para: `rota-${sufixo}@teste.achados.local`,
          assunto: "Seu Passaporte Achados na Rota está ativo",
        })
      )
    );

    const segunda = await POST(pedidoAssinado(eventoPago));
    expect(await segunda.json()).toMatchObject({ desfecho: "duplicado" });

    const assinaturas = await admin
      .select({ status: subscriptions.status })
      .from(subscriptions)
      .where(eq(subscriptions.userId, pessoa));
    expect(assinaturas).toEqual([{ status: "active" }]);
  });
});
