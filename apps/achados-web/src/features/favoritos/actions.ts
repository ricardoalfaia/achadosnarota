"use server";

import { revalidatePath } from "next/cache";
import {
  AppErrors,
  Err,
  Ok,
  toActionResult,
  type ActionResult,
} from "@achados/core";
import { favorites, lerPublico, places, withUser } from "@achados/db";
import { and, eq } from "drizzle-orm";

import { banco } from "@/shared/db/banco.servidor";
import { ROTAS } from "@/shared/rotas";
import { sessaoDaAcao } from "@/shared/sessao/sessao.servidor";
import { lerPedidoDeFavorito, SESSAO_NECESSARIA } from "./domain/pedido";

/**
 * Salva ou tira um lugar dos favoritos de quem está logado (ADR-0006: comando
 * por Action). Quem é a pessoa vem da sessão, nunca do navegador; o banco
 * confere de novo pela RLS. Idempotente: favoritar duas vezes não duplica, e
 * tirar o que não estava salvo não falha.
 */
export async function alternarFavorito(
  slug: unknown,
  favoritar: unknown
): Promise<ActionResult<{ favorito: boolean }>> {
  const pedido = lerPedidoDeFavorito(slug, favoritar);
  if (!pedido.ok) return toActionResult(pedido);

  const sessao = await sessaoDaAcao();
  if (!sessao.ok) return toActionResult(sessao);
  if (!sessao.value)
    return toActionResult(
      Err(AppErrors.security(SESSAO_NECESSARIA, "Entre para salvar lugares."))
    );
  const usuario = sessao.value;

  const lugar = await lerPublico(banco(), (db) =>
    db
      .select({ id: places.id })
      .from(places)
      .where(eq(places.slug, pedido.value.slug))
      .limit(1)
  );
  if (!lugar.ok) return toActionResult(lugar);
  const placeId = lugar.value[0]?.id;
  if (!placeId)
    return toActionResult(Err(AppErrors.notFound("Lugar", pedido.value.slug)));

  const resultado = await withUser(banco(), usuario.id, async (tx) => {
    if (pedido.value.favoritar) {
      await tx
        .insert(favorites)
        .values({ userId: usuario.id, placeId })
        .onConflictDoNothing();
    } else {
      await tx
        .delete(favorites)
        .where(
          and(eq(favorites.userId, usuario.id), eq(favorites.placeId, placeId))
        );
    }
    return Ok({ favorito: pedido.value.favoritar });
  });

  if (resultado.ok) revalidatePath(ROTAS.favoritos);
  return toActionResult(resultado);
}
