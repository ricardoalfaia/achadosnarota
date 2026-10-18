import { createHash, randomInt } from "node:crypto";
import { AppErrors, Err, Ok, type Result } from "@achados/core";
import { and, count, eq, gt, gte, lte, sql } from "drizzle-orm";

import type { Db, DbExecutor } from "./client";
import { withUser } from "./escopo";
import { novoId } from "./id";
import {
  offers,
  redemptions,
  subscriptions,
  type OfferUsagePeriod,
} from "./schema";

// O resgate de um benefício (ADR-005 de produto, docs/produto/03):
//   1. o assinante emite um código curto e temporário (`emitirResgate`), só o
//      hash fica no banco;
//   2. o operador do estabelecimento digita ou lê o código e o consome
//      (`consumirResgate`) numa transação: atualização condicional
//      `status = 'issued'`, trava por pessoa e oferta e o limite conferido de
//      novo. Dois operadores não usam o mesmo código, e duas emissões
//      seguidas não furam o limite.
// Mensagens sem código, nome ou e-mail (docs/produto/04).

/** Sem 0/O, 1/I/L: o garçom lê em voz alta sem confusão. */
export const ALFABETO_DO_CODIGO = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const TAMANHO_DO_CODIGO = 6;
/** Quanto tempo o código vale depois de emitido. */
export const VALIDADE_DO_CODIGO_EM_MINUTOS = 10;

export function gerarCodigo(): string {
  let codigo = "";
  for (let i = 0; i < TAMANHO_DO_CODIGO; i++) {
    codigo += ALFABETO_DO_CODIGO[randomInt(ALFABETO_DO_CODIGO.length)];
  }
  return codigo;
}

/** Normaliza o que o operador digitou: caixa alta, sem espaço nem hífen. */
export function normalizarCodigo(digitado: string): string {
  return digitado.toUpperCase().replace(/[\s-]/g, "");
}

export function hashDoCodigo(codigo: string): string {
  return createHash("sha256").update(normalizarCodigo(codigo)).digest("hex");
}

/** O Brasil não tem horário de verão desde 2019: Brasília é UTC−3 o ano todo. */
const BRASILIA_EM_MS = -3 * 60 * 60 * 1000;

/**
 * Início da janela de uso que contém `agora`, no calendário de Brasília: o
 * dia, a semana (segunda-feira), o mês ou o ano. `null` em `unlimited`.
 */
export function inicioDoPeriodo(
  periodo: OfferUsagePeriod,
  agora: Date
): Date | null {
  if (periodo === "unlimited") return null;
  const local = new Date(agora.getTime() + BRASILIA_EM_MS);
  const ano = local.getUTCFullYear();
  const mes = local.getUTCMonth();
  const dia = local.getUTCDate();
  let inicio: number;
  if (periodo === "year") inicio = Date.UTC(ano, 0, 1);
  else if (periodo === "month") inicio = Date.UTC(ano, mes, 1);
  else if (periodo === "week") {
    const desdeSegunda = (local.getUTCDay() + 6) % 7;
    inicio = Date.UTC(ano, mes, dia - desdeSegunda);
  } else inicio = Date.UTC(ano, mes, dia);
  return new Date(inicio - BRASILIA_EM_MS);
}

/** Quando a janela seguinte começa (o limite renova). `null` em `unlimited`. */
export function fimDoPeriodo(
  periodo: OfferUsagePeriod,
  agora: Date
): Date | null {
  const inicio = inicioDoPeriodo(periodo, agora);
  if (!inicio) return null;
  const local = new Date(inicio.getTime() + BRASILIA_EM_MS);
  const [ano, mes, dia] = [
    local.getUTCFullYear(),
    local.getUTCMonth(),
    local.getUTCDate(),
  ];
  const proximo =
    periodo === "year"
      ? Date.UTC(ano + 1, 0, 1)
      : periodo === "month"
        ? Date.UTC(ano, mes + 1, 1)
        : periodo === "week"
          ? Date.UTC(ano, mes, dia + 7)
          : Date.UTC(ano, mes, dia + 1);
  return new Date(proximo - BRASILIA_EM_MS);
}

type RegraDaOferta = {
  limitPerUser: number;
  usagePeriod: OfferUsagePeriod;
};

/** Quantos usos já consumidos a pessoa tem na janela atual da oferta. */
async function usosNoPeriodo(
  tx: DbExecutor,
  userId: string,
  offerId: string,
  regra: RegraDaOferta,
  agora: Date
): Promise<number> {
  const inicio = inicioDoPeriodo(regra.usagePeriod, agora);
  const [linha] = await tx
    .select({ total: count() })
    .from(redemptions)
    .where(
      and(
        eq(redemptions.userId, userId),
        eq(redemptions.offerId, offerId),
        eq(redemptions.status, "redeemed"),
        inicio ? gte(redemptions.redeemedAt, inicio) : undefined
      )
    );
  return linha?.total ?? 0;
}

function limiteAtingido(regra: RegraDaOferta, agora: Date) {
  const renovaEm = fimDoPeriodo(regra.usagePeriod, agora);
  return AppErrors.domain(
    "RESGATE_LIMITE_ATINGIDO",
    "Você já usou este benefício no período.",
    renovaEm ? { renovaEm: renovaEm.toISOString() } : {}
  );
}

/** Trava por pessoa e oferta até o fim da transação: emissões e consumos em fila. */
async function travar(tx: DbExecutor, userId: string, offerId: string) {
  await tx.execute(
    sql`select pg_advisory_xact_lock(hashtextextended(${`${userId}:${offerId}`}, 0))`
  );
}

export type CodigoEmitido = {
  /** Mostrado uma vez na tela da pessoa; nunca gravado nem registrado em log. */
  codigo: string;
  expiraEm: Date;
};

/**
 * Emite um código para a pessoa usar a oferta, dentro do escopo dela (RLS).
 * Exige passaporte vigente, oferta visível (ativa, na validade, de lugar
 * publicado) e limite disponível na janela. Um código anterior ainda não usado
 * é cancelado: só o último vale.
 */
export async function emitirResgate(
  db: Db,
  userId: string,
  offerId: string,
  agora: Date = new Date()
): Promise<Result<CodigoEmitido>> {
  return withUser(db, userId, async (tx) => {
    await travar(tx, userId, offerId);
    const [assinatura] = await tx
      .select({ id: subscriptions.id })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, "active"),
          lte(subscriptions.startsAt, agora),
          gt(subscriptions.endsAt, agora)
        )
      )
      .limit(1);
    if (!assinatura) {
      return Err(
        AppErrors.domain(
          "RESGATE_SEM_PASSAPORTE",
          "É preciso ter o passaporte vigente para usar o benefício."
        )
      );
    }

    const [oferta] = await tx
      .select({
        placeId: offers.placeId,
        limitPerUser: offers.limitPerUser,
        usagePeriod: offers.usagePeriod,
      })
      .from(offers)
      .where(eq(offers.id, offerId))
      .limit(1);
    if (!oferta) {
      return Err(
        AppErrors.domain(
          "RESGATE_OFERTA_INDISPONIVEL",
          "Este benefício não está disponível agora."
        )
      );
    }

    if (
      oferta.usagePeriod !== "unlimited" &&
      (await usosNoPeriodo(tx, userId, offerId, oferta, agora)) >=
        oferta.limitPerUser
    ) {
      return Err(limiteAtingido(oferta, agora));
    }

    await tx
      .update(redemptions)
      .set({ status: "voided", updatedAt: agora })
      .where(
        and(
          eq(redemptions.userId, userId),
          eq(redemptions.offerId, offerId),
          eq(redemptions.status, "issued")
        )
      );

    const codigo = gerarCodigo();
    const expiraEm = new Date(
      agora.getTime() + VALIDADE_DO_CODIGO_EM_MINUTOS * 60_000
    );
    await tx.insert(redemptions).values({
      id: novoId(),
      userId,
      offerId,
      placeId: oferta.placeId,
      subscriptionId: assinatura.id,
      tokenHash: hashDoCodigo(codigo),
      expiresAt: expiraEm,
    });
    return Ok({ codigo, expiraEm });
  });
}

export type ResgateConsumido = { resgateId: string; usadoEm: Date };

/**
 * O operador do estabelecimento consome o código. Só acha código emitido para
 * a casa dele (`placeId`); expirado não vale; o limite da oferta é conferido de
 * novo sob a trava. A troca `issued → redeemed` é condicional: se dois
 * operadores tentarem ao mesmo tempo, um só consegue.
 *
 * Recebe um executor com permissão de escrita em `redemption`: o papel do
 * painel do parceiro, que decide no servidor qual casa é do operador. O papel
 * do app (`achados_app`) não consome códigos.
 */
export async function consumirResgate(
  db: Db,
  {
    codigo,
    placeId,
    operadorId,
    agora = new Date(),
  }: { codigo: string; placeId: string; operadorId: string; agora?: Date }
): Promise<Result<ResgateConsumido>> {
  const normalizado = normalizarCodigo(codigo);
  if (
    normalizado.length !== TAMANHO_DO_CODIGO ||
    [...normalizado].some((c) => !ALFABETO_DO_CODIGO.includes(c))
  ) {
    return Err(
      AppErrors.validation("RESGATE_CODIGO_INVALIDO", "Código inválido.")
    );
  }
  try {
    return await db.transaction(async (tx) => {
      const [resgate] = await tx
        .select({
          id: redemptions.id,
          userId: redemptions.userId,
          offerId: redemptions.offerId,
          expiresAt: redemptions.expiresAt,
          limitPerUser: offers.limitPerUser,
          usagePeriod: offers.usagePeriod,
        })
        .from(redemptions)
        .innerJoin(offers, eq(offers.id, redemptions.offerId))
        .where(
          and(
            eq(redemptions.tokenHash, hashDoCodigo(normalizado)),
            eq(redemptions.placeId, placeId),
            eq(redemptions.status, "issued")
          )
        )
        .limit(1);
      if (!resgate) {
        return Err(
          AppErrors.domain(
            "RESGATE_NAO_ENCONTRADO",
            "Código não encontrado para esta casa, ou já usado."
          )
        );
      }
      if (resgate.expiresAt <= agora) {
        await tx
          .update(redemptions)
          .set({ status: "expired", updatedAt: agora })
          .where(
            and(
              eq(redemptions.id, resgate.id),
              eq(redemptions.status, "issued")
            )
          );
        return Err(
          AppErrors.domain(
            "RESGATE_EXPIRADO",
            "O código expirou. Peça para gerar outro no app."
          )
        );
      }

      await travar(tx, resgate.userId, resgate.offerId);
      if (
        resgate.usagePeriod !== "unlimited" &&
        (await usosNoPeriodo(
          tx,
          resgate.userId,
          resgate.offerId,
          resgate,
          agora
        )) >= resgate.limitPerUser
      ) {
        return Err(limiteAtingido(resgate, agora));
      }

      const [consumido] = await tx
        .update(redemptions)
        .set({
          status: "redeemed",
          redeemedAt: agora,
          operatorId: operadorId,
          updatedAt: agora,
        })
        .where(
          and(eq(redemptions.id, resgate.id), eq(redemptions.status, "issued"))
        )
        .returning({ id: redemptions.id });
      if (!consumido) {
        return Err(
          AppErrors.domain(
            "RESGATE_NAO_ENCONTRADO",
            "Código não encontrado para esta casa, ou já usado."
          )
        );
      }
      return Ok({ resgateId: consumido.id, usadoEm: agora });
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
