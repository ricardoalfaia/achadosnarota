import {
  AppError,
  AppErrors,
  Err,
  fromPromise,
  Ok,
  type Result,
} from "@meuproduto/core";
import { sql } from "drizzle-orm";

import type { Db, Tx } from "./client";

// Por que Result e não exceção: withTenant/withUser são a fronteira de infra
// chamada pelos casos de uso, e no core "infra captura exceções na borda e
// converte em Err(AppError)" (packages/core/src/result.ts). Então:
//   - tenantId inválido → Err(validation), sem abrir transação;
//   - `fn` devolve Result: Err faz ROLLBACK e volta como está;
//   - exceção do banco → Err via fromPromise. Violação de RLS (SQLSTATE 42501,
//     "new row violates row-level security policy") vira Err(security), não
//     retryable; o resto vira Err(infrastructure), retryable.
// A mensagem é genérica de propósito: nada da query nem dos dados vai para o
// erro (docs/produto/04); o erro original fica só em `cause`, para log.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Valida e normaliza (minúsculas) um id de tenant. */
export function validarTenantId(tenantId: unknown): Result<string> {
  if (typeof tenantId !== "string" || !UUID.test(tenantId)) {
    return Err(
      AppErrors.validation("TENANT_ID_INVALID", "Tenant inválido.", {
        field: "tenantId",
      })
    );
  }
  return Ok(tenantId.toLowerCase());
}

/** Valida um id de usuário do Better Auth (texto opaco, sem espaços). */
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
          code: "TENANT_SCOPE_VIOLATION",
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

async function emContexto<T>(
  db: Db,
  variavel: "app.tenant_id" | "app.user_id",
  valor: string,
  contexto: Record<string, string>,
  fn: (tx: Tx) => Promise<Result<T>>
): Promise<Result<T>> {
  return fromPromise(
    () =>
      db.transaction(async (tx) => {
        // is_local = true: vale só até o fim desta transação. A conexão volta
        // ao pool sem contexto, e a próxima transação começa sem ver nada.
        await tx.execute(sql`select set_config(${variavel}, ${valor}, true)`);
        const resultado = await fn(tx);
        if (!resultado.ok) throw new Rollback(resultado.error);
        return resultado.value;
      }),
    (causa) => traduzir(causa, contexto)
  );
}

/**
 * Executa `fn` numa transação com o tenant fixado em `app.tenant_id`.
 *
 * As policies de RLS (schema/_rls.ts) só deixam passar linhas cujo tenant_id
 * bate com esse valor. Sem ele, o papel meuproduto_app não enxerga nada das
 * tabelas de tenant: o isolamento está no banco, não na disciplina de cada
 * query. Use SEMPRE o `tx` recebido, nunca o `db` de fora.
 */
export async function withTenant<T>(
  db: Db,
  tenantId: string,
  fn: (tx: Tx) => Promise<Result<T>>
): Promise<Result<T>> {
  const id = validarTenantId(tenantId);
  if (!id.ok) return id;
  return emContexto(db, "app.tenant_id", id.value, { tenantId: id.value }, fn);
}

/**
 * Executa `fn` numa transação com o usuário fixado em `app.user_id`.
 *
 * Só abre a leitura das memberships do próprio usuário em tenant_user (policy
 * tenant_user_own_memberships): é o que "meus tenants" e o requireTenant
 * precisam antes de existir um tenant efetivo. Não dá acesso a dados de
 * negócio de nenhum tenant nem permite gravar em tenant_user.
 */
export async function withUser<T>(
  db: Db,
  userId: string,
  fn: (tx: Tx) => Promise<Result<T>>
): Promise<Result<T>> {
  const id = validarUserId(userId);
  if (!id.ok) return id;
  return emContexto(db, "app.user_id", id.value, { userId: id.value }, fn);
}
