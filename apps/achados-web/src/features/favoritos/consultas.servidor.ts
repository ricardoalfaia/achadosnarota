import "server-only";

import { cache } from "react";
import { Ok, type Result } from "@achados/core";
import { favorites, places, withUser } from "@achados/db";
import { desc, eq } from "drizzle-orm";

import type { Lugar } from "@/features/catalogo";
import { cartoesPorSlug } from "@/features/catalogo/servidor";
import { banco } from "@/shared/db/banco.servidor";

// Favoritos são dado pessoal: tudo passa por withUser, e o banco só devolve
// as linhas da própria pessoa (RLS favorite_da_propria_pessoa).

/** Os slugs que a pessoa salvou, para marcar os corações da lista. */
export const slugsFavoritos = cache(
  async (userId: string): Promise<Result<Set<string>>> =>
    withUser(banco(), userId, async (tx) => {
      const linhas = await tx
        .select({ slug: places.slug })
        .from(favorites)
        .innerJoin(places, eq(places.id, favorites.placeId));
      return Ok(new Set(linhas.map((l) => l.slug)));
    })
);

/** Os lugares salvos, do mais recente ao mais antigo. */
export async function listarFavoritos(
  userId: string
): Promise<Result<Lugar[]>> {
  return withUser(banco(), userId, async (tx) => {
    const linhas = await tx
      .select({ slug: places.slug })
      .from(favorites)
      .innerJoin(places, eq(places.id, favorites.placeId))
      .orderBy(desc(favorites.createdAt));
    return Ok(
      await cartoesPorSlug(
        tx,
        linhas.map((l) => l.slug)
      )
    );
  });
}
