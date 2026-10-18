import "server-only";

import { cache } from "react";
import { Ok, type Result } from "@achados/core";
import {
  courtesies,
  lerPublico,
  plans,
  subscriptions,
  withUser,
} from "@achados/db";
import { asc, desc } from "drizzle-orm";

import { banco } from "@/shared/db/banco.servidor";
import { passaporteDe, type Passaporte, type Plano } from "./domain/passaporte";

/**
 * O passaporte de quem está logado. O app só lê a própria assinatura e a
 * própria cortesia (RLS); a assinatura muda pelo webhook do provedor de
 * pagamento, e a cortesia, pela administração no painel.
 */
export const lerPassaporte = cache(
  async (userId: string): Promise<Result<Passaporte>> =>
    withUser(banco(), userId, async (tx) => {
      const linhas = await tx
        .select({
          id: subscriptions.id,
          status: subscriptions.status,
          startsAt: subscriptions.startsAt,
          endsAt: subscriptions.endsAt,
        })
        .from(subscriptions)
        .orderBy(desc(subscriptions.endsAt));
      const cortesias = await tx
        .select({
          id: courtesies.id,
          startsAt: courtesies.startsAt,
          endsAt: courtesies.endsAt,
          revokedAt: courtesies.revokedAt,
        })
        .from(courtesies);
      return Ok(passaporteDe(linhas, new Date(), cortesias));
    })
);

/**
 * O plano à venda, se houver um ativo. O preço vem do banco, nunca do
 * navegador (docs/produto/07), e R$ 129/ano ainda é hipótese de teste.
 */
export const lerPlanoAtivo = cache(async (): Promise<Result<Plano | null>> => {
  const r = await lerPublico(banco(), (db) =>
    db
      .select({
        id: plans.id,
        nome: plans.name,
        precoEmCentavos: plans.priceCents,
        moeda: plans.currency,
      })
      .from(plans)
      .orderBy(asc(plans.priceCents))
      .limit(1)
  );
  return r.ok ? Ok(r.value[0] ?? null) : r;
});

/**
 * A situação das compras da pessoa: há um Pix esperando compensar (das
 * últimas 24 horas; depois disso venceu) e se ela já teve um passaporte pago
 * (para o botão dizer "Renovar").
 */
export async function situacaoDasCompras(
  userId: string
): Promise<{ pendente: boolean; jaTevePassaporte: boolean }> {
  const desde = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const resultado = await withUser(banco(), userId, async (tx) =>
    Ok(
      await tx
        .select({
          status: subscriptions.status,
          criadaEm: subscriptions.createdAt,
        })
        .from(subscriptions)
    )
  );
  if (!resultado.ok) return { pendente: false, jaTevePassaporte: false };
  return {
    pendente: resultado.value.some(
      (s) => s.status === "pending" && s.criadaEm > desde
    ),
    jaTevePassaporte: resultado.value.some((s) =>
      ["active", "expired"].includes(s.status)
    ),
  };
}
