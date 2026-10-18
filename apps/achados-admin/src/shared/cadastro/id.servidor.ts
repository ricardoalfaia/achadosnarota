import "server-only";

import { AppErrors, Err, Ok, type Result } from "@achados/core";
import { ehUlid } from "@achados/db";

/**
 * O id que veio da URL ou do navegador é um ULID (ADR-0024)? Um id fora do
 * formato responde como não encontrado, igual a um id de outro escopo: a
 * resposta não diz se o registro existe.
 */
export function idDoRegistro(entidade: string, id: unknown): Result<string> {
  // O valor recusado não volta na mensagem: pode ser qualquer coisa.
  return ehUlid(id) ? Ok(id) : Err(AppErrors.notFound(entidade, "?"));
}
