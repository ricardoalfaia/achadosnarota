import "server-only";

import { cache } from "react";
import { Ok, type Result } from "@achados/core";
import {
  categories,
  cities,
  editorialReviews,
  lerPublico,
  offers,
  placeHours,
  placeMedia,
  places,
  type DbExecutor,
} from "@achados/db";
import { and, asc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";

import { banco } from "@/shared/db/banco.servidor";
import { criteriosAvaliados, ganhaOSelo } from "./domain/curadoria";
import { padraoDeBusca } from "./domain/filtro";
import {
  beneficioDaInterface,
  montarCartao,
  montarCartoes,
  type LinhaDaFoto,
  type LinhaDoBeneficio,
  type LinhaDoLugar,
} from "./domain/montagem";
import type {
  CartaoDeLugar,
  Categoria,
  Cidade,
  FichaDoLugar,
  FiltroDoCatalogo,
  VitrineDoCatalogo,
} from "./domain/tipos";

// Leituras do catálogo público (ADR-0006: leitura no servidor, sem Server
// Action). O banco só devolve o que está publicado (RLS `*_leitura_publica`):
// rascunho, oferta pausada e avaliação em revisão não chegam aqui nem com um
// filtro esquecido.

/** As colunas do cartão: lugar, cidade, categoria e avaliação publicada. */
function colunasDoLugar() {
  return {
    id: places.id,
    slug: places.slug,
    nome: places.name,
    especialidade: places.specialty,
    resumo: places.summary,
    cidade: cities.name,
    uf: cities.state,
    categoriaSlug: categories.slug,
    categoriaNome: categories.name,
    nota: editorialReviews.score,
    selo: editorialReviews.seal,
  };
}

function lugaresComJuncoes(db: DbExecutor) {
  return db
    .select(colunasDoLugar())
    .from(places)
    .innerJoin(cities, eq(cities.id, places.cityId))
    .innerJoin(categories, eq(categories.id, places.categoryId))
    .leftJoin(
      editorialReviews,
      and(
        eq(editorialReviews.placeId, places.id),
        eq(editorialReviews.status, "published")
      )
    );
}

async function fotosDe(
  db: DbExecutor,
  lugarIds: string[],
  { somenteCapa }: { somenteCapa: boolean }
): Promise<LinhaDaFoto[]> {
  if (lugarIds.length === 0) return [];
  return db
    .select({
      lugarId: placeMedia.placeId,
      posicao: placeMedia.position,
      url: placeMedia.url,
      alt: placeMedia.alt,
    })
    .from(placeMedia)
    .where(
      and(
        inArray(placeMedia.placeId, lugarIds),
        somenteCapa
          ? sql`${placeMedia.position} = (select min(m.position) from place_media m where m.place_id = ${placeMedia.placeId})`
          : undefined
      )
    )
    .orderBy(asc(placeMedia.position));
}

async function beneficiosDe(
  db: DbExecutor,
  lugarIds: string[]
): Promise<LinhaDoBeneficio[]> {
  if (lugarIds.length === 0) return [];
  return db
    .select({
      lugarId: offers.placeId,
      posicao: offers.position,
      id: offers.id,
      titulo: offers.title,
      regras: offers.terms,
      icone: offers.icon,
      tipo: offers.kind,
      limite: offers.limitPerUser,
      periodo: offers.usagePeriod,
    })
    .from(offers)
    .where(inArray(offers.placeId, lugarIds))
    .orderBy(asc(offers.position));
}

/** Os cartões a partir das linhas de lugar: busca capa e benefícios de todos de uma vez. */
async function cartoesDe(
  db: DbExecutor,
  lugares: LinhaDoLugar[]
): Promise<CartaoDeLugar[]> {
  const ids = lugares.map((l) => l.id);
  const [fotos, beneficios] = await Promise.all([
    fotosDe(db, ids, { somenteCapa: true }),
    beneficiosDe(db, ids),
  ]);
  return montarCartoes(lugares, fotos, beneficios);
}

function condicoesDoFiltro(filtro: FiltroDoCatalogo): SQL | undefined {
  const condicoes: (SQL | undefined)[] = [];
  if (filtro.categoria) condicoes.push(eq(categories.slug, filtro.categoria));
  if (filtro.cidade) condicoes.push(eq(cities.slug, filtro.cidade));
  if (filtro.busca) {
    const padrao = padraoDeBusca(filtro.busca);
    condicoes.push(
      or(
        ilike(places.name, padrao),
        ilike(places.specialty, padrao),
        ilike(cities.name, padrao),
        ilike(categories.name, padrao),
        sql`array_to_string(${places.tags}, ' ') ilike ${padrao}`
      )
    );
  }
  return and(...condicoes);
}

/**
 * Os lugares da exploração: destaques primeiro (com selo e melhor nota), depois
 * o resto por nome. O selo nunca é comprado (ADR-004 de produto): a ordem segue
 * só a curadoria.
 */
export async function listarLugares(
  filtro: FiltroDoCatalogo
): Promise<Result<CartaoDeLugar[]>> {
  return lerPublico(banco(), async (db) => {
    const lugares = await lugaresComJuncoes(db)
      .where(condicoesDoFiltro(filtro))
      .orderBy(
        sql`${editorialReviews.seal} is null`,
        sql`${editorialReviews.score} desc nulls last`,
        asc(places.name)
      )
      .limit(60);
    return cartoesDe(db, lugares);
  });
}

/** Cartões de lugares específicos, na ordem pedida (favoritos). */
export async function cartoesPorSlug(
  db: DbExecutor,
  slugs: string[]
): Promise<CartaoDeLugar[]> {
  if (slugs.length === 0) return [];
  const lugares = await lugaresComJuncoes(db).where(
    inArray(places.slug, slugs)
  );
  const cartoes = await cartoesDe(db, lugares);
  const posicao = new Map(slugs.map((slug, i) => [slug, i]));
  return cartoes.sort(
    (a, b) => (posicao.get(a.slug) ?? 0) - (posicao.get(b.slug) ?? 0)
  );
}

/** A ficha completa de um lugar publicado, ou `null`. */
export const lerFichaDoLugar = cache(
  async (slug: string): Promise<Result<FichaDoLugar | null>> =>
    lerPublico(banco(), async (db) => {
      const [lugar] = await db
        .select({
          ...colunasDoLugar(),
          descricao: places.description,
          tags: places.tags,
          endereco: places.address,
          telefone: places.phone,
          site: places.website,
          observacaoDoHorario: places.hoursNote,
          parecer: editorialReviews.summary,
          ressalvas: editorialReviews.caveats,
          visitadoEm: editorialReviews.visitedOn,
          destaque: editorialReviews.highlight,
          dicas: editorialReviews.tips,
          hygiene: editorialReviews.hygiene,
          presentation: editorialReviews.presentation,
          flavor: editorialReviews.flavor,
          sophistication: editorialReviews.sophistication,
          service: editorialReviews.service,
          ambience: editorialReviews.ambience,
          value: editorialReviews.value,
        })
        .from(places)
        .innerJoin(cities, eq(cities.id, places.cityId))
        .innerJoin(categories, eq(categories.id, places.categoryId))
        .leftJoin(
          editorialReviews,
          and(
            eq(editorialReviews.placeId, places.id),
            eq(editorialReviews.status, "published")
          )
        )
        .where(eq(places.slug, slug))
        .limit(1);
      if (!lugar) return null;

      const [fotos, beneficios, horarios] = await Promise.all([
        fotosDe(db, [lugar.id], { somenteCapa: false }),
        beneficiosDe(db, [lugar.id]),
        db
          .select({
            dia: placeHours.weekday,
            abre: placeHours.opens,
            fecha: placeHours.closes,
          })
          .from(placeHours)
          .where(eq(placeHours.placeId, lugar.id)),
      ]);
      const cartao = montarCartao(lugar, fotos, beneficios);
      const criterios = criteriosAvaliados(lugar);
      const ficha: FichaDoLugar = {
        ...cartao,
        tags: lugar.tags,
        fotos: fotos.map(({ url, alt }) => ({ url, alt })),
        beneficios: beneficios.map(beneficioDaInterface),
        // O banco devolve "HH:MM:SS"; a tela usa "HH:MM".
        horarios: horarios.map(({ dia, abre, fecha }) => ({
          dia,
          abre: abre.slice(0, 5),
          fecha: fecha.slice(0, 5),
        })),
        ...(lugar.observacaoDoHorario
          ? { observacaoDoHorario: lugar.observacaoDoHorario }
          : {}),
        ...(lugar.descricao ? { descricao: lugar.descricao } : {}),
        ...(lugar.endereco ? { endereco: lugar.endereco } : {}),
        ...(lugar.telefone ? { telefone: lugar.telefone } : {}),
        ...(lugar.site ? { site: lugar.site } : {}),
        ...(cartao.nota !== undefined && lugar.parecer && lugar.visitadoEm
          ? {
              avaliacao: {
                nota: cartao.nota,
                parecer: lugar.parecer,
                visitadoEm: lugar.visitadoEm,
                criterios,
                seloDaCuradoria: ganhaOSelo(criterios),
                dicas: lugar.dicas ?? [],
                ...(lugar.destaque ? { destaque: lugar.destaque } : {}),
                ...(lugar.ressalvas ? { ressalvas: lugar.ressalvas } : {}),
                ...(cartao.selo ? { selo: cartao.selo } : {}),
              },
            }
          : {}),
      };
      return ficha;
    })
);

/** Categorias na ordem da curadoria, para o carrossel de filtros. */
export const listarCategorias = cache(async (): Promise<Result<Categoria[]>> =>
  lerPublico(banco(), (db) =>
    db
      .select({
        slug: categories.slug,
        nome: categories.name,
        icone: categories.icon,
      })
      .from(categories)
      .orderBy(asc(categories.position), asc(categories.name))
  )
);

/** Cidades com pelo menos um lugar publicado, para o filtro por cidade. */
export const listarCidades = cache(async (): Promise<Result<Cidade[]>> =>
  lerPublico(banco(), (db) =>
    db
      .selectDistinct({
        slug: cities.slug,
        nome: cities.name,
        uf: cities.state,
      })
      .from(cities)
      .innerJoin(places, eq(places.cityId, cities.id))
      .orderBy(asc(cities.name))
  )
);

/** Os slugs de todos os lugares publicados (sitemap). */
export async function slugsPublicados(): Promise<Result<string[]>> {
  const r = await lerPublico(banco(), (db) =>
    db.select({ slug: places.slug }).from(places).orderBy(asc(places.slug))
  );
  return r.ok ? Ok(r.value.map((l) => l.slug)) : r;
}

/**
 * O que o topo da exploração mostra para convencer: os primeiros destaques da
 * curadoria e quantos lugares e cidades já foram avaliados. Tudo contado no
 * banco; nenhum número fixo no código.
 */
const QUANTOS_NA_VITRINE = 5;

export const lerVitrine = cache(async (): Promise<Result<VitrineDoCatalogo>> =>
  lerPublico(banco(), async (db) => {
    const [primeiros, [totais]] = await Promise.all([
      lugaresComJuncoes(db)
        .orderBy(
          sql`${editorialReviews.seal} is null`,
          sql`${editorialReviews.score} desc nulls last`,
          asc(places.name)
        )
        .limit(QUANTOS_NA_VITRINE),
      db
        .select({
          lugares: sql<number>`count(*)::int`,
          cidades: sql<number>`count(distinct ${places.cityId})::int`,
        })
        .from(places),
    ]);
    return {
      destaques: await cartoesDe(db, primeiros),
      lugares: totais?.lugares ?? 0,
      cidades: totais?.cidades ?? 0,
    };
  })
);
