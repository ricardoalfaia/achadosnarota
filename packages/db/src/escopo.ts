import {
  AppError,
  AppErrors,
  Err,
  fromPromise,
  Ok,
  type Result,
} from "@achados/core";
import { sql } from "drizzle-orm";

import type { Db, Tx } from "./client";

// Por que Result e não exceção: withUser é a fronteira de infra chamada pelos
// casos de uso, e no core "infra captura exceções na borda e converte em
// Err(AppError)" (packages/core/src/result.ts). Então:
//   - userId inválido → Err(validation), sem abrir transação;
//   - `fn` devolve Result: Err faz ROLLBACK e volta como está;
//   - exceção do banco → Err via fromPromise. Violação de RLS (SQLSTATE 42501,
//     "new row violates row-level security policy") vira Err(security), não
//     retryable; o resto vira Err(infrastructure), retryable.
// A mensagem é genérica de propósito: nada da query nem dos dados vai para o
// erro (docs/produto/04); o erro original fica só em `cause`, para log.

/**
 * Valida um id de usuário. Os ids do Better Auth são ULID (ADR-0024), mas a
 * regra aceita qualquer texto opaco sem espaços: contas criadas antes da troca
 * de gerador, ou por outro provedor, continuam válidas.
 */
export function validarUserId(userId: unknown): Result<string> {
  if (
    typeof userId !== "string" ||
    userId.length === 0 ||
    userId.length > 128 ||
    /\s/.test(userId)
  ) {
    return Err(
      AppErrors.validation("USER_ID_INVALID", "Usuário inválido.", {
        field: "userId",
      })
    );
  }
  return Ok(userId);
}

/** Código SQLSTATE em qualquer nível da cadeia de `cause` (o Drizzle embrulha). */
export function codigoPostgres(erro: unknown): string | undefined {
  let atual: unknown = erro;
  for (let i = 0; i < 5 && atual && typeof atual === "object"; i++) {
    const codigo = (atual as { code?: unknown }).code;
    if (typeof codigo === "string" && /^[0-9A-Z]{5}$/.test(codigo))
      return codigo;
    atual = (atual as { cause?: unknown }).cause;
  }
  return undefined;
}

class Rollback extends Error {
  constructor(readonly erro: AppError) {
    super(erro.message);
  }
}

function traduzir(causa: unknown, contexto: Record<string, string>): AppError {
  if (causa instanceof Rollback) return causa.erro;
  if (causa instanceof AppError) return causa;
  const erro =
    codigoPostgres(causa) === "42501"
      ? new AppError({
          category: "security",
          code: "USER_SCOPE_VIOLATION",
          message: "Operação fora do escopo permitido.",
          cause: causa,
        })
      : AppErrors.infrastructure(
          "DATABASE_ERROR",
          "Falha ao acessar o banco de dados.",
          causa
        );
  return AppErrors.withContext(erro, { module: "db", ...contexto });
}

/**
 * Executa `fn` numa transação com o usuário fixado em `app.user_id`.
 *
 * As policies de RLS das tabelas pessoais (favoritos, assinatura) só deixam
 * passar linhas com user_id igual a esse valor: o isolamento entre pessoas
 * está no banco, não na disciplina de cada query. Use SEMPRE o `tx` recebido,
 * nunca o `db` de fora. As tabelas públicas do catálogo também são lidas pelo
 * `tx`, com as mesmas regras de publicação.
 */
export async function withUser<T>(
  db: Db,
  userId: string,
  fn: (tx: Tx) => Promise<Result<T>>
): Promise<Result<T>> {
  const id = validarUserId(userId);
  if (!id.ok) return id;
  return fromPromise(
    () =>
      db.transaction(async (tx) => {
        // is_local = true: vale só até o fim desta transação. A conexão volta
        // ao pool sem contexto, e a próxima transação começa sem ver nada.
        await tx.execute(
          sql`select set_config('app.user_id', ${id.value}, true)`
        );
        const resultado = await fn(tx);
        if (!resultado.ok) throw new Rollback(resultado.error);
        return resultado.value;
      }),
    (causa) => traduzir(causa, { userId: id.value })
  );
}

/**
 * Lê o catálogo público, sem pessoa no contexto. O papel da app só enxerga o
 * que está publicado (policies `*_leitura_publica`) e não grava nada ali.
 */
export async function lerPublico<T>(
  db: Db,
  fn: (tx: Db) => Promise<T>
): Promise<Result<T>> {
  return fromPromise(
    () => fn(db),
    (causa) => traduzir(causa, {})
  );
}
