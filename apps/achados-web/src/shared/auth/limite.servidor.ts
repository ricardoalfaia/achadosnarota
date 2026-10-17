import "server-only";

import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import {
  AppErrors,
  fromPromise,
  type AppError,
  type Result,
} from "@achados/core";
import { rateLimits } from "@achados/db";
import { inArray, sql } from "drizzle-orm";

import { ambienteServidor } from "@/shared/config/ambiente.servidor";
import { banco } from "@/shared/db/banco.servidor";
import { estaBloqueado, type ChaveDeLimite } from "./limite";

// Leitura e gravação do limite de tentativas das Actions (regras em
// `limite.ts`), na tabela `rate_limit` do Better Auth, que não tem RLS. As
// chaves têm o prefixo `achados:` e não colidem com as do Better Auth.

function falhaDoBanco(causa: unknown): AppError {
  return AppErrors.infrastructure(
    "LIMITE_INDISPONIVEL",
    "Falha ao consultar o limite de tentativas.",
    causa
  );
}

/** HMAC do valor com o segredo do app: a tabela não guarda e-mail nem IP em claro. */
export function resumo(valor: string): string {
  return createHmac("sha256", ambienteServidor().segredoDoAuth)
    .update(valor.trim().toLowerCase())
    .digest("base64url");
}

/** O IP de origem como o proxy reverso informa; "desconhecido" sem ele. */
export async function ipDaOrigem(): Promise<string> {
  const pedido = await headers();
  const encaminhado = pedido.get("x-forwarded-for")?.split(",")[0]?.trim();
  return encaminhado || pedido.get("x-real-ip") || "desconhecido";
}

/** Alguma das chaves já passou do limite? */
export async function algumaBloqueada(
  chaves: readonly ChaveDeLimite[]
): Promise<Result<boolean, AppError>> {
  return fromPromise(async () => {
    const linhas = await banco()
      .select({
        key: rateLimits.key,
        count: rateLimits.count,
        lastRequest: rateLimits.lastRequest,
      })
      .from(rateLimits)
      .where(
        inArray(
          rateLimits.key,
          chaves.map((c) => c.chave)
        )
      );
    const agora = Date.now();
    return chaves.some(({ chave, regra }) =>
      estaBloqueado(
        linhas.find((linha) => linha.key === chave),
        regra,
        agora
      )
    );
  }, falhaDoBanco);
}

/**
 * Conta uma falha em cada chave, numa instrução só por chave: janela vencida
 * recomeça em 1; aberta, soma 1 e mantém o início da janela.
 */
export async function registrarFalha(
  chaves: readonly ChaveDeLimite[]
): Promise<Result<void, AppError>> {
  return fromPromise(async () => {
    const agora = Date.now();
    for (const { chave, regra } of chaves) {
      const inicio = agora - regra.janelaEmSegundos * 1000;
      await banco()
        .insert(rateLimits)
        .values({
          id: crypto.randomUUID(),
          key: chave,
          count: 1,
          lastRequest: agora,
        })
        .onConflictDoUpdate({
          target: rateLimits.key,
          set: {
            count: sql`case when ${rateLimits.lastRequest} <= ${inicio} then 1 else ${rateLimits.count} + 1 end`,
            lastRequest: sql`case when ${rateLimits.lastRequest} <= ${inicio} then ${agora} else ${rateLimits.lastRequest} end`,
          },
        });
    }
  }, falhaDoBanco);
}

/** Entrada aceita: as falhas da conta deixam de contar. */
export async function liberar(
  chaves: readonly ChaveDeLimite[]
): Promise<Result<void, AppError>> {
  return fromPromise(async () => {
    await banco()
      .delete(rateLimits)
      .where(
        inArray(
          rateLimits.key,
          chaves.map((c) => c.chave)
        )
      );
  }, falhaDoBanco);
}
