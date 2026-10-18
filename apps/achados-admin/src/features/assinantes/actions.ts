"use server";

import { revalidatePath } from "next/cache";
import {
  AppErrors,
  Err,
  Ok,
  toActionResult,
  type ActionResult,
} from "@achados/core";
import {
  courtesies,
  DIAS_DA_CORTESIA,
  ehUlid,
  novoId,
  subscriptions,
  users,
} from "@achados/db";
import { and, eq, gt, isNull, lte } from "drizzle-orm";

import { auditar, naEquipe, semPermissao } from "@/shared/db/equipe.servidor";
import { ROTAS } from "@/shared/rotas";
import { SO_ADMINISTRACAO } from "./consultas.servidor";

// Cortesia de 7 dias: só a administração libera e revoga (RLS em courtesy;
// conferido aqui antes, para a mensagem certa). Uma por pessoa na vida, e não
// para quem já tem o passaporte pago. A auditoria guarda a conta, nunca o
// nome ou o e-mail.

const soAdministracao = () =>
  Err(
    AppErrors.security(
      SO_ADMINISTRACAO,
      "Só a administração libera e revoga cortesias."
    )
  );

export async function liberarCortesia(
  usuarioId: unknown
): Promise<ActionResult<{ validaAte: string }>> {
  if (typeof usuarioId !== "string" || !ehUlid(usuarioId))
    return toActionResult(
      Err(AppErrors.validation("ASSINANTE_INVALIDO", "Pessoa inválida."))
    );

  const resultado = await naEquipe(async (tx, pessoa) => {
    if (pessoa.papel !== "administrador") return soAdministracao();
    if (pessoa.id === usuarioId)
      return Err(
        AppErrors.domain(
          "CORTESIA_PARA_SI",
          "Não é possível liberar cortesia para a própria conta."
        )
      );

    const agora = new Date();
    const [conta] = await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, usuarioId));
    if (!conta) return Err(AppErrors.notFound("Assinante", "inexistente"));

    const [jaTeve] = await tx
      .select({ id: courtesies.id })
      .from(courtesies)
      .where(eq(courtesies.userId, usuarioId));
    if (jaTeve)
      return Err(
        AppErrors.conflict(
          "CORTESIA_JA_USADA",
          "Esta pessoa já recebeu a cortesia (uma por pessoa)."
        )
      );

    const [pago] = await tx
      .select({ id: subscriptions.id })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, usuarioId),
          eq(subscriptions.status, "active"),
          lte(subscriptions.startsAt, agora),
          gt(subscriptions.endsAt, agora)
        )
      );
    if (pago)
      return Err(
        AppErrors.conflict(
          "CORTESIA_COM_PASSAPORTE_PAGO",
          "Esta pessoa já tem o passaporte pago ativo."
        )
      );

    const id = novoId();
    const fim = new Date(agora.getTime() + DIAS_DA_CORTESIA * 86_400_000);
    await tx.insert(courtesies).values({
      id,
      userId: usuarioId,
      grantedBy: pessoa.id,
      startsAt: agora,
      endsAt: fim,
    });
    await auditar(tx, pessoa, {
      acao: "cortesia.liberada",
      entidade: "courtesy",
      entidadeId: id,
      detalhes: { conta: usuarioId, dias: DIAS_DA_CORTESIA },
    });
    return Ok({ validaAte: fim.toISOString() });
  });

  if (resultado.ok) revalidatePath(ROTAS.assinantes);
  return toActionResult(resultado);
}

export async function revogarCortesia(
  usuarioId: unknown
): Promise<ActionResult<null>> {
  if (typeof usuarioId !== "string" || !ehUlid(usuarioId))
    return toActionResult(
      Err(AppErrors.validation("ASSINANTE_INVALIDO", "Pessoa inválida."))
    );

  const resultado = await naEquipe(async (tx, pessoa) => {
    if (pessoa.papel !== "administrador") return soAdministracao();
    const revogadas = await tx
      .update(courtesies)
      .set({ revokedAt: new Date(), revokedBy: pessoa.id })
      .where(
        and(eq(courtesies.userId, usuarioId), isNull(courtesies.revokedAt))
      )
      .returning({ id: courtesies.id });
    const revogada = revogadas[0];
    if (!revogada) return semPermissao("esta cortesia");
    await auditar(tx, pessoa, {
      acao: "cortesia.revogada",
      entidade: "courtesy",
      entidadeId: revogada.id,
      detalhes: { conta: usuarioId },
    });
    return Ok(null);
  });

  if (resultado.ok) revalidatePath(ROTAS.assinantes);
  return toActionResult(resultado);
}
