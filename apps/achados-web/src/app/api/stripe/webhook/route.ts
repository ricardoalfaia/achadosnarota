import { processarEventoDePagamento } from "@achados/db";

import { acaoDoEventoDaStripe } from "@/features/passaporte/domain/pagamento";
import {
  bancoDosPagamentos,
  configuracaoDosPagamentos,
  stripe,
} from "@/shared/pagamentos/stripe.servidor";

/**
 * O webhook da Stripe (ADR-006 de produto): o único caminho que ativa,
 * cancela ou estorna um passaporte. A assinatura do evento é conferida sobre
 * o corpo cru; evento sem assinatura válida é recusado (400). Cada evento é
 * processado uma vez (payment_event), com o papel achados_pagamentos.
 * Responde 200 rápido também para eventos que não interessam, e 500 quando o
 * banco falha, para a Stripe tentar de novo. Nada do pagador vai para o log.
 */
export async function POST(pedido: Request) {
  const config = configuracaoDosPagamentos();
  const cliente = stripe();
  const db = bancoDosPagamentos();
  if (!config || !cliente || !db)
    return new Response("Pagamentos não configurados.", { status: 503 });

  const assinatura = pedido.headers.get("stripe-signature");
  if (!assinatura) return new Response("Sem assinatura.", { status: 400 });
  const corpo = await pedido.text();

  let evento;
  try {
    evento = await cliente.webhooks.constructEventAsync(
      corpo,
      assinatura,
      config.segredoDoWebhook
    );
  } catch {
    return new Response("Assinatura inválida.", { status: 400 });
  }

  const resultado = await processarEventoDePagamento(
    db,
    { id: evento.id, tipo: evento.type },
    acaoDoEventoDaStripe(evento)
  );
  if (!resultado.ok) {
    console.error(
      `[stripe] evento ${evento.id} (${evento.type}) não aplicado: ${resultado.error.code}`
    );
    // Divergência de valor ou conta: registrado e não reprocessado (200);
    // falha de banco: a Stripe tenta de novo (500).
    return new Response(null, {
      status: resultado.error.category === "infrastructure" ? 500 : 200,
    });
  }
  return Response.json({ recebido: true, desfecho: resultado.value });
}
