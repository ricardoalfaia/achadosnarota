import "server-only";

import { Ok, type Result } from "@achados/core";
import { partnerOperators, places, users } from "@achados/db";
import { asc, eq, ne } from "drizzle-orm";

import { naEquipe } from "@/shared/db/equipe.servidor";

// Quem opera o balcão de cada casa (vínculo usado pelo modo balcão do app).
// Só a administração lê e escreve os vínculos (RLS em partner_operator).

export type OperadorDaCasa = { usuarioId: string; nome: string; email: string };

export type CasaComOperadores = {
  id: string;
  nome: string;
  operadores: OperadorDaCasa[];
};

export async function casasComOperadores(): Promise<
  Result<CasaComOperadores[]>
> {
  return naEquipe(async (tx) => {
    const [casas, vinculos] = await Promise.all([
      tx
        .select({ id: places.id, nome: places.name })
        .from(places)
        .where(ne(places.status, "archived"))
        .orderBy(asc(places.name)),
      tx
        .select({
          casaId: partnerOperators.placeId,
          usuarioId: users.id,
          nome: users.name,
          email: users.email,
        })
        .from(partnerOperators)
        .innerJoin(users, eq(users.id, partnerOperators.userId))
        .orderBy(asc(users.name)),
    ]);
    return Ok(
      casas.map((casa) => ({
        ...casa,
        operadores: vinculos
          .filter((v) => v.casaId === casa.id)
          .map(({ usuarioId, nome, email }) => ({ usuarioId, nome, email })),
      }))
    );
  });
}
