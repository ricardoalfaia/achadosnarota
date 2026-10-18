import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  AppErrors,
  Err,
  Ok,
  unwrapOrThrow,
  type AppError,
  type Result,
} from "@achados/core";
import { staffMembers, withUser } from "@achados/db";
import { eq } from "drizzle-orm";

import { auth } from "@/shared/auth/auth.servidor";
import { chamarAuth } from "@/shared/auth/chamar.servidor";
import { banco } from "@/shared/db/banco.servidor";
import { ROTA_DE_ENTRADA } from "@/shared/rotas";
import { papelDoBanco, type PessoaDaEquipe } from "./sessao";

// A sessão da equipe, decidida no servidor a cada pedido (ADR-003 de produto):
// a sessão do Better Auth, o autenticador ligado e o papel em `staff_member`,
// lido no escopo da própria pessoa (RLS).

export type SituacaoDaEquipe =
  | { tipo: "semSessao" }
  | { tipo: "semAutenticador" }
  | { tipo: "foraDaEquipe" }
  | { tipo: "equipe"; pessoa: PessoaDaEquipe };

export const SESSAO_DA_EQUIPE_NECESSARIA = "EQUIPE_SESSAO_NECESSARIA";

/** Uma leitura por pedido, compartilhada pelo layout, páginas e Actions. */
export const situacaoDaEquipe = cache(
  async (): Promise<Result<SituacaoDaEquipe, AppError>> => {
    const pedido = await headers();
    const sessao = await chamarAuth("getSession", () =>
      auth().api.getSession({ headers: pedido })
    );
    if (!sessao.ok) return sessao;
    if (!sessao.value) return Ok({ tipo: "semSessao" });
    const { user } = sessao.value;
    if (!user.twoFactorEnabled) return Ok({ tipo: "semAutenticador" });

    const membro = await withUser(banco(), user.id, async (tx) =>
      Ok(
        await tx
          .select({ papel: staffMembers.role })
          .from(staffMembers)
          .where(eq(staffMembers.userId, user.id))
          .limit(1)
      )
    );
    if (!membro.ok) return membro;
    const [linha] = membro.value;
    if (!linha) return Ok({ tipo: "foraDaEquipe" });
    return Ok({
      tipo: "equipe",
      pessoa: {
        id: user.id,
        nome: user.name,
        papel: papelDoBanco(linha.papel),
        ...(user.image ? { fotoUrl: user.image } : {}),
      },
    });
  }
);

/** Para páginas e o layout: sem equipe liberada, vai para a entrada. */
export async function exigirEquipe(): Promise<PessoaDaEquipe> {
  const situacao = unwrapOrThrow(await situacaoDaEquipe());
  if (situacao.tipo !== "equipe") redirect(ROTA_DE_ENTRADA);
  return situacao.pessoa;
}

/** Para leituras e Actions que devolvem Result. */
export async function equipeDoPedido(): Promise<
  Result<PessoaDaEquipe, AppError>
> {
  const situacao = await situacaoDaEquipe();
  if (!situacao.ok) return situacao;
  if (situacao.value.tipo !== "equipe")
    return Err(
      AppErrors.security(
        SESSAO_DA_EQUIPE_NECESSARIA,
        "Entre no painel com a sua conta da equipe."
      )
    );
  return Ok(situacao.value.pessoa);
}
