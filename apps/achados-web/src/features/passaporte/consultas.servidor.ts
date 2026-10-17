import "server-only";

import { cache } from "react";
import { Ok, type Result } from "@achados/core";
import { lerPublico, plans, subscriptions, withUser } from "@achados/db";
import { asc, desc } from "drizzle-orm";

import { banco } from "@/shared/db/banco.servidor";
import { passaporteDe, type Passaporte, type Plano } from "./domain/passaporte";

/**
 * O passaporte de quem está logado. O app só lê a própria assinatura (RLS);
 * quem cria e muda o estado é o webhook do provedor de pagamento.
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
      return Ok(passaporteDe(linhas, new Date()));
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
