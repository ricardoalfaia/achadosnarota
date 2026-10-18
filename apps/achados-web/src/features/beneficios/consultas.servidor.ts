import "server-only";

import { cache } from "react";
import { unwrapOrThrow, type Result } from "@achados/core";
import {
  cities,
  historicoDeResgates,
  lerPublico,
  offers,
  places,
  usosDosBeneficios,
} from "@achados/db";
import { asc, eq, sql } from "drizzle-orm";

import type { Beneficio } from "@/features/catalogo";
import { banco } from "@/shared/db/banco.servidor";
import type { BeneficioDisponivel, ItemDoHistorico } from "./domain/tipos";

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

export type UsoNaFicha = { disponivel: boolean; renovaEm?: string };

/**
 * Quanto a pessoa já usou dos benefícios da ficha na janela de cada um. Só os
 * benefícios com uso aparecem; a regra e a janela vêm do banco.
 */
export async function usosNaFicha(
  userId: string,
  beneficios: readonly Pick<Beneficio, "id" | "limite" | "periodo">[]
): Promise<Record<string, UsoNaFicha>> {
  const usos = unwrapOrThrow(
    await usosDosBeneficios(
      banco(),
      userId,
      beneficios.map(({ id, limite, periodo }) => ({ id, limite, periodo }))
    )
  );
  return Object.fromEntries(
    [...usos].map(([id, uso]) => [
      id,
      {
        disponivel: uso.disponivel,
        ...(uso.renovaEm ? { renovaEm: uso.renovaEm.toISOString() } : {}),
      },
    ])
  );
}

/** O histórico de usos e códigos expirados, para as abas do passaporte. */
export async function historicoDoPassaporte(
  userId: string
): Promise<ItemDoHistorico[]> {
  const historico = unwrapOrThrow(await historicoDeResgates(banco(), userId));
  return historico.map((item) => ({
    id: item.id,
    titulo: item.beneficio ?? "Benefício encerrado",
    ...(item.lugarNome ? { lugarNome: item.lugarNome } : {}),
    ...(item.lugarSlug ? { lugarSlug: item.lugarSlug } : {}),
    ...(item.cidade ? { cidade: item.cidade } : {}),
    situacao: item.situacao === "redeemed" ? "usado" : "expirado",
    quando: item.quando.toISOString(),
  }));
}
