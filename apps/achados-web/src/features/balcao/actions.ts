"use server";

import {
  AppErrors,
  Err,
  Ok,
  toActionResult,
  type ActionResult,
} from "@achados/core";
import { consumirResgate, ehUlid } from "@achados/db";

import { banco } from "@/shared/db/banco.servidor";
import { sessaoDaAcao } from "@/shared/sessao/sessao.servidor";

/**
 * O garçom confirma o código que o cliente mostra (ADR-005 de produto). Quem
 * opera vem da sessão; o vínculo com a casa, o limite de tentativas e o
 * consumo são decididos no banco, sob RLS (`consumirResgate`). O código não
 * vai para log nem volta na resposta.
 */
export async function validarCodigoNoBalcao(
  codigo: unknown,
  casaId: unknown
): Promise<ActionResult<{ beneficio: string; usadoEm: string }>> {
  if (
    typeof codigo !== "string" ||
    codigo.length > 20 ||
    typeof casaId !== "string" ||
    !ehUlid(casaId)
  ) {
    return toActionResult(
      Err(AppErrors.validation("BALCAO_PEDIDO_INVALIDO", "Pedido inválido."))
    );
  }
  const sessao = await sessaoDaAcao();
  if (!sessao.ok) return toActionResult(sessao);
  if (!sessao.value) {
    return toActionResult(
      Err(AppErrors.security("BALCAO_SESSAO_NECESSARIA", "Entre de novo."))
    );
  }
  const uso = await consumirResgate(banco(), {
    codigo,
    placeId: casaId,
    operadorId: sessao.value.id,
  });
  if (!uso.ok) return toActionResult(uso);
  return toActionResult(
    Ok({
      beneficio: uso.value.beneficio,
      usadoEm: uso.value.usadoEm.toISOString(),
    })
  );
}
