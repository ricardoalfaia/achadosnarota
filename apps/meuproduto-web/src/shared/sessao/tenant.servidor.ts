import "server-only";

import { cache } from "react";
import { notFound } from "next/navigation";
import {
  AppErrors,
  Err,
  fromPromise,
  Ok,
  unwrapOrThrow,
  type AppError,
  type Result,
} from "@meuproduto/core";
import {
  organizations,
  tenants,
  tenantUsers,
  withTenant,
} from "@meuproduto/db";
import { and, eq } from "drizzle-orm";

import { banco } from "@/shared/db/banco.servidor";
import { ehSlugValido } from "@/shared/rotas";
import type { ContextoDoTenant, UsuarioDaSessao } from "./sessao";
import {
  exigirSessao,
  lerSessao,
  pendenciasDe,
  usuarioDaSessao,
} from "./sessao.servidor";

// O tenant ativo vem da URL (`/t/[slug]`) e é conferido no banco a cada
// requisição (ADR-0020). Nunca de header, corpo ou estado do cliente.

/**
 * O contexto do tenant `slug` para `usuario`, ou `null` quando o tenant não
 * existe, está suspenso ou a pessoa não tem vínculo com ele: os três casos são
 * iguais por fora, para não revelar que um tenant existe.
 */
async function resolverTenant(
  slug: string,
  usuario: UsuarioDaSessao
): Promise<Result<ContextoDoTenant | null, AppError>> {
  if (!ehSlugValido(slug)) return Ok(null);

  // `tenant` e `organization` não têm RLS: o slug precisa virar id antes de
  // existir contexto de tenant. Quem decide o acesso é `tenant_user`.
  const busca = await fromPromise(
    () =>
      banco()
        .select({
          id: tenants.id,
          slug: tenants.slug,
          nome: tenants.name,
          organizacao: organizations.name,
        })
        .from(tenants)
        .innerJoin(organizations, eq(organizations.id, tenants.organizationId))
        .where(and(eq(tenants.slug, slug), eq(tenants.status, "active"))),
    (causa) =>
      AppErrors.infrastructure(
        "DATABASE_ERROR",
        "Falha ao acessar o banco de dados.",
        causa
      )
  );
  if (!busca.ok) return busca;
  const [tenant] = busca.value;
  if (!tenant) return Ok(null);

  // O vínculo é lido dentro do próprio tenant: a policy de `tenant_user` só
  // mostra as linhas do tenant fixado por withTenant.
  const vinculo = await withTenant(banco(), tenant.id, async (tx) => {
    const [linha] = await tx
      .select({ papel: tenantUsers.role })
      .from(tenantUsers)
      .where(
        and(
          eq(tenantUsers.tenantId, tenant.id),
          eq(tenantUsers.userId, usuario.id)
        )
      );
    return Ok(linha);
  });
  if (!vinculo.ok) return vinculo;
  if (!vinculo.value) return Ok(null);

  return Ok({
    usuario,
    tenant: { id: tenant.id, slug: tenant.slug, nome: tenant.nome },
    papel: vinculo.value.papel,
    organizacao: { nome: tenant.organizacao },
  });
}

/**
 * Para layouts e páginas de `/t/[slug]`: sessão liberada (senão, login) e
 * vínculo com o tenant (senão, 404). Uma consulta por pedido e slug.
 */
export const exigirTenant = cache(
  async (slug: string): Promise<ContextoDoTenant> => {
    const { usuario } = await exigirSessao();
    const contexto = unwrapOrThrow(await resolverTenant(slug, usuario));
    if (!contexto) notFound();
    return contexto;
  }
);

/**
 * Para Server Actions e Route Handlers de negócio: a mesma checagem de
 * `exigirTenant`, mas devolvendo `Result` em vez de redirecionar. O `slug`
 * chega do cliente e por isso é `unknown`: só vale depois do vínculo no banco.
 */
export async function contextoDaAcao(
  slug: unknown
): Promise<Result<ContextoDoTenant, AppError>> {
  const sessao = await lerSessao();
  if (!sessao.ok) return sessao;
  if (!sessao.value)
    return Err(AppErrors.security("SESSAO_AUSENTE", "Sessão ausente."));

  const pendencias = await pendenciasDe(sessao.value);
  if (!pendencias.ok) return pendencias;
  if (pendencias.value.length > 0)
    return Err(
      AppErrors.security(
        "ACESSO_PENDENTE",
        "A conta tem etapas de acesso pendentes."
      )
    );

  if (typeof slug !== "string")
    return Err(AppErrors.validation("TENANT_INVALIDO", "Tenant inválido."));
  const contexto = await resolverTenant(slug, usuarioDaSessao(sessao.value));
  if (!contexto.ok) return contexto;
  if (!contexto.value)
    return Err(
      AppErrors.security("TENANT_INDISPONIVEL", "Tenant indisponível.")
    );
  return Ok(contexto.value);
}
