import { toAppError, type ActionResult } from "@achados/core";

/**
 * Adaptador de Server Action para o `useMutation` (ADR-0004): o Query precisa
 * de exceção para saber que a operação falhou. `Ok` devolve o valor; `Err`
 * vira AppError lançado, com código e categoria, sem a causa.
 */
export async function executarAcao<T>(
  acao: Promise<ActionResult<T>>
): Promise<T> {
  const resultado = await acao;
  if (resultado.ok) return resultado.value;
  throw toAppError(resultado.error);
}
