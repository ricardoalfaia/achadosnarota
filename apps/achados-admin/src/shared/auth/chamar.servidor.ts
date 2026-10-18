import "server-only";

import { AppError, AppErrors, Err, Ok, type Result } from "@achados/core";
import { isAPIError } from "better-auth/api";

/** O que o Better Auth respondeu ao recusar: status HTTP e código. */
export type RecusaDoAuth = { status: number; codigo?: string | undefined };

// A fronteira com o Better Auth: `auth().api.*` lança APIError na recusa e
// exceção comum na falha de banco. Aqui as duas viram `Err(AppError)`
// (ADR-0004), sem nada do pedido (senha, código, e-mail) no erro.

export const CODIGO_AUTH_RECUSOU = "AUTH_RECUSOU";

export async function chamarAuth<T>(
  operacao: string,
  chamada: () => Promise<T>
): Promise<Result<T, AppError>> {
  try {
    return Ok(await chamada());
  } catch (causa) {
    if (isAPIError(causa) && causa.statusCode < 500) {
      const corpo = causa.body as { code?: unknown } | undefined;
      const codigo = typeof corpo?.code === "string" ? corpo.code : undefined;
      return Err(
        new AppError({
          category: "security",
          code: CODIGO_AUTH_RECUSOU,
          message: `O Better Auth recusou ${operacao} (${causa.statusCode}).`,
          details: { status: causa.statusCode, codigo },
        })
      );
    }
    return Err(
      AppErrors.withContext(
        AppErrors.infrastructure(
          "AUTH_INDISPONIVEL",
          `Falha no Better Auth ao executar ${operacao}.`,
          causa
        ),
        { module: "auth", operation: operacao }
      )
    );
  }
}

/** A recusa (status e código do Better Auth) de um erro de `chamarAuth`, se for uma. */
export function recusaDe(erro: AppError): RecusaDoAuth | undefined {
  if (erro.code !== CODIGO_AUTH_RECUSOU) return undefined;
  const status = erro.details?.status;
  const codigo = erro.details?.codigo;
  return {
    status: typeof status === "number" ? status : 400,
    codigo: typeof codigo === "string" ? codigo : undefined,
  };
}
