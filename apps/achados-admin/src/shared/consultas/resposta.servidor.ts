import "server-only";

import { randomUUID } from "node:crypto";
import {
  errorStatusCode,
  toActionResult,
  type AppError,
  type Result,
} from "@achados/core";

// Respostas dos Route Handlers do BFF (docs/produto/07): sucesso em JSON;
// erro como `{ code, message, correlationId }`, com o status HTTP certo e sem
// a causa. Falha de infraestrutura vai ao log com o mesmo correlationId.

export function respostaDe<T>(
  resultado: Result<T, AppError>,
  cacheControl: string
): Response {
  if (resultado.ok)
    return Response.json(resultado.value, {
      headers: { "Cache-Control": cacheControl },
    });
  const correlationId = randomUUID();
  // Registra a falha (sem dado da pessoa) pelo mesmo caminho das Actions.
  toActionResult(resultado);
  return Response.json(
    {
      code: resultado.error.code,
      message: resultado.error.message,
      correlationId,
    },
    {
      status: errorStatusCode(resultado.error),
      headers: { "Cache-Control": "no-store" },
    }
  );
}
