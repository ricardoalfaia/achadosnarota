"use server";

import { revalidatePath } from "next/cache";
import { AppErrors, Err, Ok, type AppError, type Result } from "@achados/core";
import { ehUlid, partnerOperators, places, users } from "@achados/db";
import { and, eq } from "drizzle-orm";

import { auditar, naEquipe, semPermissao } from "@/shared/db/equipe.servidor";
import { ROTAS } from "@/shared/rotas";

// Vincular e desvincular operadores do balcão. Só a administração (RLS); a
// auditoria guarda a casa e a conta, nunca o e-mail.

export type EstadoDoVinculo = { mensagem?: string; erro?: string };

const mensagemDe = (erro: AppError) =>
  erro.code === "USER_SCOPE_VIOLATION"
    ? "Só a administração vincula operadores."
    : erro.message;

function campo(dados: FormData, nome: string): string {
  const valor = dados.get(nome);
  return typeof valor === "string" ? valor.trim() : "";
}

export async function vincularOperador(
  _anterior: EstadoDoVinculo,
  dados: FormData
): Promise<EstadoDoVinculo> {
  const email = campo(dados, "email").toLowerCase();
  const casaId = campo(dados, "casaId");
  if (!email || !ehUlid(casaId))
    return { erro: "Informe o e-mail e escolha a casa." };

  const resultado: Result<string> = await naEquipe(async (tx, pessoa) => {
    const [conta] = await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!conta)
      return Err(
        AppErrors.domain(
          "OPERADOR_SEM_CONTA",
          "Nenhuma conta com este e-mail. A pessoa precisa criar a conta no app primeiro."
        )
      );
    const [casa] = await tx
      .select({ nome: places.name })
      .from(places)
      .where(eq(places.id, casaId));
    if (!casa)
      return Err(AppErrors.validation("CASA_DESCONHECIDA", "Casa inválida."));
    await tx
      .insert(partnerOperators)
      .values({ userId: conta.id, placeId: casaId })
      .onConflictDoNothing();
    await auditar(tx, pessoa, {
      acao: "operador.vinculado",
      entidade: "partner_operator",
      entidadeId: casaId,
      detalhes: { conta: conta.id },
    });
    return Ok(casa.nome);
  });
  if (!resultado.ok) return { erro: mensagemDe(resultado.error) };
  revalidatePath(ROTAS.parceiros);
  return { mensagem: `Operador vinculado a ${resultado.value}.` };
}

export async function desvincularOperador(
  _anterior: EstadoDoVinculo,
  dados: FormData
): Promise<EstadoDoVinculo> {
  const usuarioId = campo(dados, "usuarioId");
  const casaId = campo(dados, "casaId");
  if (!ehUlid(usuarioId) || !ehUlid(casaId))
    return { erro: "Vínculo inválido." };
  const resultado = await naEquipe(async (tx, pessoa) => {
    const removidos = await tx
      .delete(partnerOperators)
      .where(
        and(
          eq(partnerOperators.userId, usuarioId),
          eq(partnerOperators.placeId, casaId)
        )
      )
      .returning({ casa: partnerOperators.placeId });
    if (removidos.length === 0) return semPermissao("operadores");
    await auditar(tx, pessoa, {
      acao: "operador.desvinculado",
      entidade: "partner_operator",
      entidadeId: casaId,
      detalhes: { conta: usuarioId },
    });
    return Ok(undefined);
  });
  if (!resultado.ok) return { erro: mensagemDe(resultado.error) };
  revalidatePath(ROTAS.parceiros);
  return { mensagem: "Operador desvinculado." };
}
