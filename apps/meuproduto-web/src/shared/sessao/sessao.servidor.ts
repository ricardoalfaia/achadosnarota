import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Ok,
  unwrapOrThrow,
  type AppError,
  type Result,
} from "@meuproduto/core";
import { organizations, tenants, tenantUsers, withUser } from "@meuproduto/db";
import { and, asc, eq } from "drizzle-orm";

import { auth, type SessaoDoAuth } from "@/shared/auth/auth.servidor";
import { chamarAuth } from "@/shared/auth/chamar.servidor";
import { pendenciasDaConta, type Pendencia } from "@/shared/auth/regras";
import { banco } from "@/shared/db/banco.servidor";
import type { UsuarioDaSessao, Vinculo } from "./sessao";

// A camada de acesso à sessão (ADR-0020). A verificação de verdade é aqui:
// layout, página, Action e Route Handler chamam `exigirSessao` (ou
// `exigirTenant`). O proxy só faz a triagem otimista pelo cookie.

export const ROTA_DE_LOGIN = "/login";

/**
 * A sessão do Better Auth de quem fez o pedido, lida no banco (sem
 * cookieCache), uma vez por pedido. `Err` só quando o banco falha.
 */
export const lerSessao = cache(
  async (): Promise<Result<SessaoDoAuth | null, AppError>> => {
    const pedido = await headers();
    return chamarAuth("getSession", () =>
      auth().api.getSession({ headers: pedido })
    );
  }
);

/** A sessão, ou `null`. Falha de banco vira exceção (vai ao error.tsx). */
export async function sessaoAtual(): Promise<SessaoDoAuth | null> {
  return unwrapOrThrow(await lerSessao());
}

export function usuarioDaSessao(sessao: SessaoDoAuth): UsuarioDaSessao {
  return {
    id: sessao.user.id,
    nome: sessao.user.name,
    email: sessao.user.email,
    foto: sessao.user.image ?? undefined,
  };
}

/**
 * Os tenants ativos a que a pessoa tem vínculo. `withUser` abre só a leitura
 * dos próprios vínculos em `tenant_user` (RLS); `tenant` e `organization` não
 * têm RLS e só dão nome e endereço.
 */
export const meusVinculos = cache(
  async (userId: string): Promise<Result<Vinculo[], AppError>> =>
    withUser(banco(), userId, async (tx) =>
      Ok(
        await tx
          .select({
            tenantId: tenants.id,
            slug: tenants.slug,
            nome: tenants.name,
            papel: tenantUsers.role,
            organizacao: { nome: organizations.name },
          })
          .from(tenantUsers)
          .innerJoin(tenants, eq(tenants.id, tenantUsers.tenantId))
          .innerJoin(
            organizations,
            eq(organizations.id, tenants.organizationId)
          )
          .where(
            and(eq(tenantUsers.userId, userId), eq(tenants.status, "active"))
          )
          .orderBy(asc(tenants.name))
      )
    )
);

/** O que ainda falta para a conta usar o sistema (troca de senha, autenticador). */
export async function pendenciasDe(
  sessao: SessaoDoAuth
): Promise<Result<Pendencia[], AppError>> {
  const vinculos = await meusVinculos(sessao.user.id);
  if (!vinculos.ok) return vinculos;
  return Ok(
    pendenciasDaConta({
      mustChangePassword: sessao.user.mustChangePassword === true,
      twoFactorEnabled: sessao.user.twoFactorEnabled === true,
      papeis: vinculos.value.map((v) => v.papel),
    })
  );
}

export type SessaoLiberada = {
  sessao: SessaoDoAuth;
  usuario: UsuarioDaSessao;
  vinculos: Vinculo[];
};

/**
 * A sessão de quem pode usar o sistema. Sem sessão, vai ao login; com troca
 * de senha ou autenticador pendente (MFA obrigatório para owner/admin), volta
 * ao login, que mostra a etapa que falta. Layout não é barreira: cada página,
 * Action e Route Handler chama esta função (ou `exigirTenant`).
 */
export const exigirSessao = cache(async (): Promise<SessaoLiberada> => {
  const sessao = await sessaoAtual();
  if (!sessao) redirect(ROTA_DE_LOGIN);
  const pendencias = unwrapOrThrow(await pendenciasDe(sessao));
  if (pendencias.length > 0) redirect(ROTA_DE_LOGIN);
  const vinculos = unwrapOrThrow(await meusVinculos(sessao.user.id));
  return { sessao, usuario: usuarioDaSessao(sessao), vinculos };
});
