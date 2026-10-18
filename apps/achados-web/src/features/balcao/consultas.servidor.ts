import "server-only";

import { Ok, unwrapOrThrow } from "@achados/core";
import { partnerOperators, places, withUser } from "@achados/db";
import { asc, eq } from "drizzle-orm";

import { banco } from "@/shared/db/banco.servidor";

export type CasaDoBalcao = { id: string; nome: string };

/**
 * As casas que a pessoa opera no balcão, dentro do escopo dela (RLS: o
 * vínculo só é visível para o próprio operador). Vazio para quem não opera.
 */
export async function casasDoOperador(userId: string): Promise<CasaDoBalcao[]> {
  return unwrapOrThrow(
    await withUser(banco(), userId, async (tx) =>
      Ok(
        await tx
          .select({ id: places.id, nome: places.name })
          .from(partnerOperators)
          .innerJoin(places, eq(places.id, partnerOperators.placeId))
          .where(eq(partnerOperators.userId, userId))
          .orderBy(asc(places.name))
      )
    )
  );
}
