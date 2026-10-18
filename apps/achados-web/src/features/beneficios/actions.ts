"use server";

import {
  AppErrors,
  Err,
  Ok,
  toActionResult,
  type ActionResult,
} from "@achados/core";
import { ehUlid, emitirResgate } from "@achados/db";

import { banco } from "@/shared/db/banco.servidor";
import { sessaoDaAcao } from "@/shared/sessao/sessao.servidor";
import { SESSAO_NECESSARIA_PARA_USAR } from "./domain/codigo";

/**
 * Gera o código para a pessoa logada usar um benefício (ADR-005 de produto).
 * Quem é a pessoa vem da sessão; passaporte, oferta e limite são conferidos
 * no banco (`emitirResgate`, com RLS). O código volta só nesta resposta: não
 * vai para log, URL nem cache.
 */
export async function gerarCodigoDoBeneficio(
  beneficioId: unknown
): Promise<ActionResult<{ codigo: string; expiraEm: string }>> {
  if (typeof beneficioId !== "string" || !ehUlid(beneficioId)) {
    return toActionResult(
      Err(AppErrors.validation("BENEFICIO_INVALIDO", "Benefício inválido."))
    );
  }
  const sessao = await sessaoDaAcao();
  if (!sessao.ok) return toActionResult(sessao);
  if (!sessao.value) {
    return toActionResult(
      Err(
        AppErrors.security(
          SESSAO_NECESSARIA_PARA_USAR,
          "Entre para usar o benefício."
        )
      )
    );
  }
  const emitido = await emitirResgate(banco(), sessao.value.id, beneficioId);
  if (!emitido.ok) return toActionResult(emitido);
  return toActionResult(
    Ok({
      codigo: emitido.value.codigo,
      expiraEm: emitido.value.expiraEm.toISOString(),
    })
  );
}
