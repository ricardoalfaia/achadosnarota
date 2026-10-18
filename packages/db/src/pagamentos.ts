import { AppErrors, Err, Ok, type AppError, type Result } from "@achados/core";
import { and, desc, eq, gt } from "drizzle-orm";

import type { Db, DbExecutor } from "./client";
import { novoId } from "./id";
import { paymentEvents, plans, subscriptions, users } from "./schema";

// As assinaturas pagas (ADR-006 de produto): só o webhook do provedor chega
// aqui, conectado como achados_pagamentos. Cada evento é processado uma vez
// (payment_event), dentro de uma transação, e as operações são idempotentes
// pela sessão de checkout: o mesmo pagamento nunca vira dois passaportes.
// Nada de e-mail, nome ou dado do cartão aqui ou nos erros.

/** Um pagamento confirmado ou pendente, já conferido contra o plano. */
export type CompraDoPassaporte = {
  userId: string;
  planId: string;
  /** Sessão de checkout no provedor (`cs_...`): a chave da idempotência. */
  sessaoId: string;
  /** Pagamento no provedor (`pi_...`), quando já existe. */
  pagamentoId: string | null;
  /** O que o provedor cobrou, em centavos, e a moeda. */
  valorEmCentavos: number;
  moeda: string;
};

export type AcaoDoPagamento =
  | { tipo: "pendente"; compra: CompraDoPassaporte }
  | { tipo: "pago"; compra: CompraDoPassaporte }
  | { tipo: "falhou"; sessaoId: string }
  | { tipo: "estornado"; pagamentoId: string }
  | { tipo: "ignorar" };

export type DesfechoDoEvento =
  "duplicado" | "ignorado" | "pendente" | "ativado" | "cancelado" | "estornado";

const UM_ANO_EM_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Confere a compra contra o banco: a conta existe e o plano cobrado é o plano
 * ativo, com o mesmo preço e moeda (conciliação). Diferença não ativa nada.
 */
async function conferir(
  tx: DbExecutor,
  compra: CompraDoPassaporte
): Promise<Result<void, AppError>> {
  const [conta] = await tx
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, compra.userId))
    .limit(1);
  const [plano] = await tx
    .select({ preco: plans.priceCents, moeda: plans.currency })
    .from(plans)
    .where(eq(plans.id, compra.planId))
    .limit(1);
  if (!conta || !plano)
    return Err(
      AppErrors.domain(
        "PAGAMENTO_SEM_CONTA_OU_PLANO",
        "Pagamento sem conta ou plano conhecido."
      )
    );
  if (
    plano.preco !== compra.valorEmCentavos ||
    plano.moeda.toUpperCase() !== compra.moeda.toUpperCase()
  )
    return Err(
      AppErrors.domain(
        "PAGAMENTO_DIVERGENTE",
        "O valor pago não confere com o plano."
      )
    );
  return Ok(undefined);
}

async function daSessao(tx: DbExecutor, sessaoId: string) {
  const [linha] = await tx
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.providerSubscriptionId, sessaoId))
    .limit(1);
  return linha;
}

/** Pix gerado e ainda não pago: a compra fica pendente (o app mostra "em análise"). */
async function registrarPendente(
  tx: DbExecutor,
  compra: CompraDoPassaporte
): Promise<DesfechoDoEvento> {
  if (await daSessao(tx, compra.sessaoId)) return "ignorado";
  await tx.insert(subscriptions).values({
    id: novoId(),
    userId: compra.userId,
    planId: compra.planId,
    status: "pending",
    providerSubscriptionId: compra.sessaoId,
    providerPaymentId: compra.pagamentoId,
  });
  return "pendente";
}

/**
 * Pagamento confirmado: o passaporte vale um ano. Se a pessoa ainda tem um
 * passaporte valendo, o novo ano começa quando o atual termina (renovação
 * antecipada não perde dias).
 */
async function ativar(
  tx: DbExecutor,
  compra: CompraDoPassaporte,
  agora: Date
): Promise<DesfechoDoEvento> {
  const existente = await daSessao(tx, compra.sessaoId);
  if (existente?.status === "active") return "ignorado";

  const [vigente] = await tx
    .select({ endsAt: subscriptions.endsAt })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, compra.userId),
        eq(subscriptions.status, "active"),
        gt(subscriptions.endsAt, agora)
      )
    )
    .orderBy(desc(subscriptions.endsAt))
    .limit(1);
  const inicio =
    vigente?.endsAt && vigente.endsAt > agora ? vigente.endsAt : agora;
  const fim = new Date(inicio.getTime() + UM_ANO_EM_MS);

  if (existente) {
    await tx
      .update(subscriptions)
      .set({
        status: "active",
        startsAt: inicio,
        endsAt: fim,
        providerPaymentId: compra.pagamentoId ?? existente.providerPaymentId,
        updatedAt: agora,
      })
      .where(eq(subscriptions.id, existente.id));
  } else {
    await tx.insert(subscriptions).values({
      id: novoId(),
      userId: compra.userId,
      planId: compra.planId,
      status: "active",
      providerSubscriptionId: compra.sessaoId,
      providerPaymentId: compra.pagamentoId,
      startsAt: inicio,
      endsAt: fim,
    });
  }
  return "ativado";
}

/**
 * Processa um evento do provedor, uma única vez. `db` precisa estar conectado
 * como achados_pagamentos (o papel do app não escreve assinaturas).
 */
export async function processarEventoDePagamento(
  db: Db,
  evento: { id: string; tipo: string },
  acao: AcaoDoPagamento,
  agora: Date = new Date()
): Promise<Result<DesfechoDoEvento, AppError>> {
  try {
    return await db.transaction(async (tx) => {
      const [novo] = await tx
        .insert(paymentEvents)
        .values({ id: evento.id, type: evento.tipo })
        .onConflictDoNothing()
        .returning({ id: paymentEvents.id });
      if (!novo) return Ok("duplicado" as const);

      if (acao.tipo === "ignorar") return Ok("ignorado" as const);

      if (acao.tipo === "pendente" || acao.tipo === "pago") {
        const conferida = await conferir(tx, acao.compra);
        // Divergência: o evento fica registrado (não é reprocessado à toa),
        // mas nada é ativado; a falha volta para o log e a reconciliação.
        if (!conferida.ok) return conferida;
        return Ok(
          acao.tipo === "pago"
            ? await ativar(tx, acao.compra, agora)
            : await registrarPendente(tx, acao.compra)
        );
      }

      if (acao.tipo === "falhou") {
        const alteradas = await tx
          .update(subscriptions)
          .set({ status: "canceled", updatedAt: agora })
          .where(
            and(
              eq(subscriptions.providerSubscriptionId, acao.sessaoId),
              eq(subscriptions.status, "pending")
            )
          )
          .returning({ id: subscriptions.id });
        return Ok(alteradas.length > 0 ? "cancelado" : "ignorado");
      }

      const estornadas = await tx
        .update(subscriptions)
        .set({ status: "refunded", updatedAt: agora })
        .where(
          and(
            eq(subscriptions.providerPaymentId, acao.pagamentoId),
            eq(subscriptions.status, "active")
          )
        )
        .returning({ id: subscriptions.id });
      return Ok(estornadas.length > 0 ? "estornado" : "ignorado");
    });
  } catch (causa) {
    return Err(
      AppErrors.infrastructure(
        "DATABASE_ERROR",
        "Falha ao acessar o banco de dados.",
        causa
      )
    );
  }
}
