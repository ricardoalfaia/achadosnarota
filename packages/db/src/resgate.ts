import { createHash, randomInt } from "node:crypto";
import { AppErrors, Err, Ok, type AppError, type Result } from "@achados/core";
import {
  and,
  count,
  eq,
  gt,
  gte,
  inArray,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";

import type { Db, DbExecutor } from "./client";
import { withUser } from "./escopo";
import { novoId } from "./id";
import {
  cities,
  courtesies,
  offers,
  partnerOperators,
  places,
  redemptionAttempts,
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

/**
 * O que autoriza o benefício agora: a assinatura paga vigente ou, sem ela, a
 * cortesia vigente e não revogada. Devolve a coluna do resgate que aponta
 * para ele.
 */
async function passaporteVigente(
  tx: DbExecutor,
  userId: string,
  agora: Date
): Promise<{ subscriptionId: string } | { courtesyId: string } | null> {
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
  if (assinatura) return { subscriptionId: assinatura.id };

  const [cortesia] = await tx
    .select({ id: courtesies.id })
    .from(courtesies)
    .where(
      and(
        eq(courtesies.userId, userId),
        isNull(courtesies.revokedAt),
        lte(courtesies.startsAt, agora),
        gt(courtesies.endsAt, agora)
      )
    )
    .limit(1);
  return cortesia ? { courtesyId: cortesia.id } : null;
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
    const passaporte = await passaporteVigente(tx, userId, agora);
    if (!passaporte) {
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
      ...passaporte,
      tokenHash: hashDoCodigo(codigo),
      expiresAt: expiraEm,
    });
    return Ok({ codigo, expiraEm });
  });
}

export type ResgateConsumido = {
  resgateId: string;
  usadoEm: Date;
  /** O benefício que o garçom deve aplicar ("Compre um prato…"). */
  beneficio: string;
};

/** Erros seguidos que bloqueiam o operador, e por quanto tempo se contam. */
export const TENTATIVAS_ERRADAS_PERMITIDAS = 5;
export const JANELA_DAS_TENTATIVAS_EM_MINUTOS = 15;

const naoEncontrado = () =>
  AppErrors.domain(
    "RESGATE_NAO_ENCONTRADO",
    "Código não encontrado para esta casa, ou já usado."
  );

/** O desfecho dentro da transação: falhas que gravam (expirar) não desfazem. */
type Desfecho =
  { ok: true; valor: ResgateConsumido } | { ok: false; erro: AppError };

async function tentativasErradasRecentes(
  tx: DbExecutor,
  operadorId: string,
  agora: Date
): Promise<number> {
  const desde = new Date(
    agora.getTime() - JANELA_DAS_TENTATIVAS_EM_MINUTOS * 60_000
  );
  const [linha] = await tx
    .select({ total: count() })
    .from(redemptionAttempts)
    .where(
      and(
        eq(redemptionAttempts.userId, operadorId),
        eq(redemptionAttempts.succeeded, false),
        gte(redemptionAttempts.createdAt, desde)
      )
    );
  return linha?.total ?? 0;
}

/**
 * O operador do balcão consome o código, com o papel do app e sob RLS: só
 * enxerga e altera códigos das casas que opera (`partner_operator`). Recusa
 * quem não opera a casa, quem errou demais nos últimos minutos, código de
 * outra casa, expirado ou já usado, e confere o limite da oferta de novo sob a
 * trava. A troca `issued → redeemed` é condicional: se dois operadores
 * tentarem ao mesmo tempo, um só consegue. Toda tentativa fica registrada, sem
 * o código digitado.
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
  const formatoValido =
    normalizado.length === TAMANHO_DO_CODIGO &&
    [...normalizado].every((c) => ALFABETO_DO_CODIGO.includes(c));

  const resultado = await withUser(db, operadorId, async (tx) => {
    const [vinculo] = await tx
      .select({ placeId: partnerOperators.placeId })
      .from(partnerOperators)
      .where(
        and(
          eq(partnerOperators.userId, operadorId),
          eq(partnerOperators.placeId, placeId)
        )
      )
      .limit(1);
    if (!vinculo) {
      return Err(
        AppErrors.security(
          "RESGATE_OPERADOR_SEM_CASA",
          "Sua conta não opera esta casa."
        )
      );
    }
    if (
      (await tentativasErradasRecentes(tx, operadorId, agora)) >=
      TENTATIVAS_ERRADAS_PERMITIDAS
    ) {
      return Err(
        AppErrors.domain(
          "RESGATE_TENTATIVAS_EXCEDIDAS",
          `Muitos códigos errados. Tente de novo em ${JANELA_DAS_TENTATIVAS_EM_MINUTOS} minutos.`
        )
      );
    }

    const desfecho = await consumirNaCasa(tx, {
      normalizado,
      formatoValido,
      placeId,
      operadorId,
      agora,
    });
    await tx.insert(redemptionAttempts).values({
      id: novoId(),
      userId: operadorId,
      placeId,
      succeeded: desfecho.ok,
      createdAt: agora,
    });
    return Ok(desfecho);
  });

  if (!resultado.ok) return resultado;
  return resultado.value.ok
    ? Ok(resultado.value.valor)
    : Err(resultado.value.erro);
}

async function consumirNaCasa(
  tx: DbExecutor,
  {
    normalizado,
    formatoValido,
    placeId,
    operadorId,
    agora,
  }: {
    normalizado: string;
    formatoValido: boolean;
    placeId: string;
    operadorId: string;
    agora: Date;
  }
): Promise<Desfecho> {
  if (!formatoValido) {
    return {
      ok: false,
      erro: AppErrors.validation("RESGATE_CODIGO_INVALIDO", "Código inválido."),
    };
  }
  const [resgate] = await tx
    .select({
      id: redemptions.id,
      userId: redemptions.userId,
      offerId: redemptions.offerId,
      expiresAt: redemptions.expiresAt,
      beneficio: offers.title,
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
  if (!resgate) return { ok: false, erro: naoEncontrado() };

  if (resgate.expiresAt <= agora) {
    await tx
      .update(redemptions)
      .set({ status: "expired", updatedAt: agora })
      .where(
        and(eq(redemptions.id, resgate.id), eq(redemptions.status, "issued"))
      );
    return {
      ok: false,
      erro: AppErrors.domain(
        "RESGATE_EXPIRADO",
        "O código expirou. Peça para gerar outro no app."
      ),
    };
  }
  if (resgate.userId === operadorId) {
    return {
      ok: false,
      erro: AppErrors.security(
        "RESGATE_PROPRIO_CODIGO",
        "Quem opera a casa não valida o próprio código."
      ),
    };
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
    return { ok: false, erro: limiteAtingido(resgate, agora) };
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
  if (!consumido) return { ok: false, erro: naoEncontrado() };
  return {
    ok: true,
    valor: {
      resgateId: consumido.id,
      usadoEm: agora,
      beneficio: resgate.beneficio,
    },
  };
}

export type UsoDoBeneficio = {
  /** Usos já confirmados na janela atual. */
  usados: number;
  /** Ainda dá para usar nesta janela. */
  disponivel: boolean;
  /** Quando a janela seguinte começa (`null` sem limite). */
  renovaEm: Date | null;
};

/**
 * Para a ficha: quanto a pessoa já usou de cada oferta na janela atual, no
 * escopo dela (RLS). Ofertas sem uso não aparecem no mapa.
 */
export async function usosDosBeneficios(
  db: Db,
  userId: string,
  ofertas: readonly { id: string; limite: number; periodo: OfferUsagePeriod }[],
  agora: Date = new Date()
): Promise<Result<Map<string, UsoDoBeneficio>>> {
  return withUser(db, userId, async (tx) => {
    const usos = new Map<string, UsoDoBeneficio>();
    for (const oferta of ofertas) {
      if (oferta.periodo === "unlimited") continue;
      const regra = {
        limitPerUser: oferta.limite,
        usagePeriod: oferta.periodo,
      };
      const usados = await usosNoPeriodo(tx, userId, oferta.id, regra, agora);
      if (usados === 0) continue;
      usos.set(oferta.id, {
        usados,
        disponivel: usados < oferta.limite,
        renovaEm: fimDoPeriodo(oferta.periodo, agora),
      });
    }
    return Ok(usos);
  });
}

export type ResgateDoHistorico = {
  id: string;
  /** Título da oferta; `null` se ela não está mais visível (encerrada). */
  beneficio: string | null;
  lugarNome: string | null;
  lugarSlug: string | null;
  cidade: string | null;
  situacao: "redeemed" | "expired";
  /** Quando foi usado, ou quando o código expirou. */
  quando: Date;
};

/**
 * O histórico da pessoa para o passaporte: usados e códigos que expiraram sem
 * uso, mais recentes primeiro. Nunca devolve hash nem operador.
 */
export async function historicoDeResgates(
  db: Db,
  userId: string,
  agora: Date = new Date()
): Promise<Result<ResgateDoHistorico[]>> {
  return withUser(db, userId, async (tx) => {
    const linhas = await tx
      .select({
        id: redemptions.id,
        status: redemptions.status,
        redeemedAt: redemptions.redeemedAt,
        expiresAt: redemptions.expiresAt,
        beneficio: offers.title,
        lugarNome: places.name,
        lugarSlug: places.slug,
        cidade: cities.name,
      })
      .from(redemptions)
      .leftJoin(offers, eq(offers.id, redemptions.offerId))
      .leftJoin(places, eq(places.id, redemptions.placeId))
      .leftJoin(cities, eq(cities.id, places.cityId))
      .where(
        and(
          eq(redemptions.userId, userId),
          or(
            inArray(redemptions.status, ["redeemed", "expired"]),
            and(
              eq(redemptions.status, "issued"),
              lte(redemptions.expiresAt, agora)
            )
          )
        )
      )
      .orderBy(
        sql`coalesce(${redemptions.redeemedAt}, ${redemptions.expiresAt}) desc`
      )
      .limit(100);
    return Ok(
      linhas.map((linha) => ({
        id: linha.id,
        beneficio: linha.beneficio,
        lugarNome: linha.lugarNome,
        lugarSlug: linha.lugarSlug,
        cidade: linha.cidade,
        situacao: linha.status === "redeemed" ? "redeemed" : "expired",
        quando:
          linha.status === "redeemed" && linha.redeemedAt
            ? linha.redeemedAt
            : linha.expiresAt,
      }))
    );
  });
}
