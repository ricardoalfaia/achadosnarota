import type { AcaoDoPagamento } from "@achados/db";

// O que cada evento da Stripe significa para o passaporte (ADR-006 de
// produto). Puro: recebe só o necessário do evento, já com a assinatura
// conferida pela rota, e decide a ação. Testado sem a Stripe.
//
//   checkout.session.completed      pago (cartão) ou pendente (Pix gerado)
//   checkout.session.async_payment_succeeded   Pix compensou: pago
//   checkout.session.async_payment_failed      Pix não pago: falhou
//   checkout.session.expired        sessão abandonada: falhou
//   charge.refunded                 estorno total: estornado
//   qualquer outro                  ignorar

type SessaoDeCheckout = {
  id: string;
  mode?: string | null;
  payment_status?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  payment_intent?: string | { id: string } | null;
  metadata?: Record<string, string> | null;
};

type Cobranca = {
  payment_intent?: string | { id: string } | null;
  amount?: number | null;
  amount_refunded?: number | null;
  refunded?: boolean | null;
};

export type EventoDaStripe = {
  id: string;
  type: string;
  data: { object: unknown };
};

const idDe = (valor: string | { id: string } | null | undefined) =>
  typeof valor === "string" ? valor : (valor?.id ?? null);

function compraDa(sessao: SessaoDeCheckout) {
  const userId = sessao.metadata?.userId;
  const planId = sessao.metadata?.planId;
  if (
    !userId ||
    !planId ||
    typeof sessao.amount_total !== "number" ||
    !sessao.currency
  )
    return null;
  return {
    userId,
    planId,
    sessaoId: sessao.id,
    pagamentoId: idDe(sessao.payment_intent),
    valorEmCentavos: sessao.amount_total,
    moeda: sessao.currency,
  };
}

export function acaoDoEventoDaStripe(evento: EventoDaStripe): AcaoDoPagamento {
  if (evento.type.startsWith("checkout.session.")) {
    const sessao = evento.data.object as SessaoDeCheckout;
    // Só o checkout do passaporte (pagamento único) interessa aqui.
    if (sessao.mode !== "payment") return { tipo: "ignorar" };

    if (
      evento.type === "checkout.session.async_payment_failed" ||
      evento.type === "checkout.session.expired"
    )
      return { tipo: "falhou", sessaoId: sessao.id };

    const compra = compraDa(sessao);
    if (!compra) return { tipo: "ignorar" };
    if (evento.type === "checkout.session.async_payment_succeeded")
      return { tipo: "pago", compra };
    if (evento.type === "checkout.session.completed")
      return sessao.payment_status === "paid"
        ? { tipo: "pago", compra }
        : { tipo: "pendente", compra };
    return { tipo: "ignorar" };
  }

  if (evento.type === "charge.refunded") {
    const cobranca = evento.data.object as Cobranca;
    const pagamentoId = idDe(cobranca.payment_intent);
    // Estorno parcial não desliga o passaporte; só o total.
    const total =
      cobranca.refunded === true ||
      (typeof cobranca.amount === "number" &&
        cobranca.amount_refunded === cobranca.amount);
    return pagamentoId && total
      ? { tipo: "estornado", pagamentoId }
      : { tipo: "ignorar" };
  }

  return { tipo: "ignorar" };
}
