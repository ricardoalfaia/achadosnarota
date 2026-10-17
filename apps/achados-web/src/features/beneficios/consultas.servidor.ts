import "server-only";

import { cache } from "react";
import { type Result } from "@achados/core";
import { cities, lerPublico, offers, places } from "@achados/db";
import { asc, eq, sql } from "drizzle-orm";

import { banco } from "@/shared/db/banco.servidor";
import type { BeneficioDisponivel } from "./domain/tipos";

/**
 * Os benefícios que o passaporte dá hoje, com o lugar de cada um, para a aba
 * "Disponíveis" do passaporte. O banco só devolve oferta ativa, dentro da
 * validade, de lugar publicado (RLS).
 */
export const listarBeneficiosDisponiveis = cache(
  async (): Promise<Result<BeneficioDisponivel[]>> =>
    lerPublico(banco(), async (db) => {
      const linhas = await db
        .select({
          id: offers.id,
          titulo: offers.title,
          icone: offers.icon,
          lugarSlug: places.slug,
          lugarNome: places.name,
          cidade: cities.name,
          uf: cities.state,
          fotoUrl: sql<
            string | null
          >`(select m.url from place_media m where m.place_id = ${places.id} order by m.position limit 1)`,
          fotoAlt: sql<
            string | null
          >`(select m.alt from place_media m where m.place_id = ${places.id} order by m.position limit 1)`,
        })
        .from(offers)
        .innerJoin(places, eq(places.id, offers.placeId))
        .innerJoin(cities, eq(cities.id, places.cityId))
        .orderBy(asc(places.name), asc(offers.position))
        .limit(50);
      return linhas.map(
        ({ fotoUrl, fotoAlt, cidade, uf, ...resto }): BeneficioDisponivel => ({
          ...resto,
          local: `${cidade} - ${uf}`,
          ...(fotoUrl ? { foto: { url: fotoUrl, alt: fotoAlt ?? "" } } : {}),
        })
      );
    })
);
