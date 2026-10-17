import "server-only";

import { Ok, type AppError, type Result } from "@meuproduto/core";
import { clients, withTenant } from "@meuproduto/db";
import { count } from "drizzle-orm";

import { banco } from "@/shared/db/banco.servidor";
import type { ContextoDoTenant } from "@/shared/sessao/sessao";
import { comTotalDeClientes, type Painel } from "./domain/painel";
import { lerPainelProvisorio } from "./domain/painel-provisorio";

/**
 * O painel do tenant ativo. O número de clientes já vem do banco, dentro de
 * `withTenant`: é a fatia que prova o isolamento ponta a ponta (sem o tenant
 * fixado, o RLS não deixa contar nada; com ele, só as linhas do tenant). O
 * resto continua sintético (`painel-provisorio.ts`) até os módulos existirem.
 */
export async function lerPainel(
  contexto: ContextoDoTenant
): Promise<Result<Painel, AppError>> {
  const provisorio = await lerPainelProvisorio();
  if (!provisorio.ok) return provisorio;

  const total = await withTenant(banco(), contexto.tenant.id, async (tx) => {
    const [linha] = await tx.select({ total: count() }).from(clients);
    return Ok(linha?.total ?? 0);
  });
  if (!total.ok) {
    // Só o código: nada do tenant nem dos dados vai para o log.
    console.error(
      `[painel] total de clientes indisponível: ${total.error.code}`
    );
    return total;
  }
  return Ok(comTotalDeClientes(provisorio.value, total.value));
}
