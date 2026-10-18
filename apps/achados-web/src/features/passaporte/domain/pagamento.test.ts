import { describe, expect, it } from "vitest";

import { acaoDoEventoDaStripe, type EventoDaStripe } from "./pagamento";

const sessao = (extra: Record<string, unknown> = {}) => ({
  id: "cs_test_1",
  mode: "payment",
  payment_status: "paid",
  amount_total: 12900,
  currency: "brl",
  payment_intent: "pi_1",
  metadata: { userId: "01USUARIO", planId: "01PLANO" },
  ...extra,
});
const evento = (type: string, object: unknown): EventoDaStripe => ({
  id: "evt_1",
  type,
  data: { object },
});
const compra = {
  userId: "01USUARIO",
  planId: "01PLANO",
  sessaoId: "cs_test_1",
  pagamentoId: "pi_1",
  valorEmCentavos: 12900,
  moeda: "brl",
};

describe("eventos da Stripe", () => {
  it("cartão aprovado no checkout: pago", () => {
    expect(
      acaoDoEventoDaStripe(evento("checkout.session.completed", sessao()))
    ).toEqual({ tipo: "pago", compra });
  });

  it("Pix gerado e não pago: pendente; compensado depois: pago", () => {
    expect(
      acaoDoEventoDaStripe(
        evento(
          "checkout.session.completed",
          sessao({ payment_status: "unpaid", payment_intent: null })
        )
      )
    ).toEqual({ tipo: "pendente", compra: { ...compra, pagamentoId: null } });
    expect(
      acaoDoEventoDaStripe(
        evento("checkout.session.async_payment_succeeded", sessao())
      )
    ).toEqual({ tipo: "pago", compra });
  });

  it("Pix que não compensou ou sessão abandonada: falhou", () => {
    for (const tipo of [
      "checkout.session.async_payment_failed",
      "checkout.session.expired",
    ])
      expect(acaoDoEventoDaStripe(evento(tipo, sessao()))).toEqual({
        tipo: "falhou",
        sessaoId: "cs_test_1",
      });
  });

  it("estorno total desliga; parcial, não", () => {
    expect(
      acaoDoEventoDaStripe(
        evento("charge.refunded", {
          payment_intent: "pi_1",
          amount: 12900,
          amount_refunded: 12900,
          refunded: true,
        })
      )
    ).toEqual({ tipo: "estornado", pagamentoId: "pi_1" });
    expect(
      acaoDoEventoDaStripe(
        evento("charge.refunded", {
          payment_intent: "pi_1",
          amount: 12900,
          amount_refunded: 1000,
          refunded: false,
        })
      )
    ).toEqual({ tipo: "ignorar" });
  });

  it("sem conta ou plano nos metadados, outro modo ou outro evento: ignora", () => {
    expect(
      acaoDoEventoDaStripe(
        evento("checkout.session.completed", sessao({ metadata: {} }))
      )
    ).toEqual({ tipo: "ignorar" });
    expect(
      acaoDoEventoDaStripe(
        evento("checkout.session.completed", sessao({ mode: "subscription" }))
      )
    ).toEqual({ tipo: "ignorar" });
    expect(acaoDoEventoDaStripe(evento("customer.created", {}))).toEqual({
      tipo: "ignorar",
    });
  });
});
