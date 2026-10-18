"use server";

import {
  AppErrors,
  Err,
  Ok,
  toActionResult,
  type ActionResult,
} from "@achados/core";

import { ambienteServidor } from "@/shared/config/ambiente.servidor";
import { stripe } from "@/shared/pagamentos/stripe.servidor";
import { ROTAS } from "@/shared/rotas";
import { sessaoDaAcao } from "@/shared/sessao/sessao.servidor";
import { lerPlanoAtivo } from "./consultas.servidor";
import {
  ASSINATURA_INDISPONIVEL,
  SESSAO_NECESSARIA_PARA_ASSINAR,
} from "./domain/assinatura";

/** O Pix gerado vale uma hora; depois a sessão expira e nada é cobrado. */
const VALIDADE_DO_PIX_EM_SEGUNDOS = 60 * 60;

/**
 * Abre o Checkout da Stripe para o passaporte anual (ADR-006 de produto):
 * pagamento único com cartão ou Pix, no preço do plano ativo do banco. Quem
 * compra vem da sessão. Nada é ativado aqui: a assinatura nasce só do webhook
 * assinado, depois que a Stripe confirma o pagamento.
 */
export async function assinarPassaporte(): Promise<
  ActionResult<{ url: string }>
> {
  const sessao = await sessaoDaAcao();
  if (!sessao.ok) return toActionResult(sessao);
  if (!sessao.value)
    return toActionResult(
      Err(
        AppErrors.security(
          SESSAO_NECESSARIA_PARA_ASSINAR,
          "Entre para assinar o passaporte."
        )
      )
    );
  const cliente = stripe();
  const plano = await lerPlanoAtivo();
  if (!cliente || !plano.ok || !plano.value)
    return toActionResult(
      Err(
        AppErrors.domain(
          ASSINATURA_INDISPONIVEL,
          "A assinatura está indisponível no momento."
        )
      )
    );

  const { appUrl } = ambienteServidor();
  const pessoa = sessao.value;
  const metadados = { userId: pessoa.id, planId: plano.value.id };
  try {
    const checkout = await cliente.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "pix"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: plano.value.moeda.toLowerCase(),
            unit_amount: plano.value.precoEmCentavos,
            product_data: {
              name: plano.value.nome,
              description: "Passaporte Achados na Rota, válido por 12 meses.",
            },
          },
        },
      ],
      // O e-mail vai para o recibo da Stripe; a conta é identificada pelo id.
      customer_email: pessoa.email,
      client_reference_id: pessoa.id,
      metadata: metadados,
      payment_intent_data: { metadata: metadados },
      payment_method_options: {
        pix: { expires_after_seconds: VALIDADE_DO_PIX_EM_SEGUNDOS },
      },
      locale: "pt-BR",
      success_url: `${appUrl}${ROTAS.passaporte}?pagamento=retorno`,
      cancel_url: `${appUrl}${ROTAS.passaporte}?pagamento=cancelado`,
    });
    if (!checkout.url)
      return toActionResult(
        Err(AppErrors.integration("STRIPE_SEM_URL", "Checkout sem endereço."))
      );
    return toActionResult(Ok({ url: checkout.url }));
  } catch (causa) {
    return toActionResult(
      Err(
        AppErrors.integration(
          "STRIPE_INDISPONIVEL",
          "Não foi possível abrir o pagamento agora.",
          causa
        )
      )
    );
  }
}
