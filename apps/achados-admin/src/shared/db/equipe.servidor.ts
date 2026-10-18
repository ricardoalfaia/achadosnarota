import "server-only";

import { AppErrors, Err, type AppError, type Result } from "@achados/core";
import {
  auditEvents,
  categories,
  cities,
  editorialReviews,
  offers,
  placeHours,
  placeMedia,
  places,
  withUser,
  type Category,
  type City,
  type EditorialReview,
  type Offer,
  type Place,
  type PlaceHours,
  type PlaceMedia,
  type Tx,
} from "@achados/db";

import type { PessoaDaEquipe } from "@/shared/sessao/sessao";
import { equipeDoPedido } from "@/shared/sessao/sessao.servidor";
import { banco } from "./banco.servidor";

// O acesso do painel ao banco: a pessoa da equipe vem da sessão (servidor, a
// cada pedido) e tudo roda no escopo dela (`withUser`), onde o papel em
// `staff_member` decide sob RLS o que pode ler e escrever (ADR-003 e ADR-004
// de produto). Escrita que o papel não pode volta como Err(security).

/** Roda `fn` no escopo da pessoa da equipe logada. */
export async function naEquipe<T>(
  fn: (tx: Tx, pessoa: PessoaDaEquipe) => Promise<Result<T>>
): Promise<Result<T>> {
  const pessoa = await equipeDoPedido();
  if (!pessoa.ok) return pessoa;
  return withUser(banco(), pessoa.value.id, (tx) => fn(tx, pessoa.value));
}

export const PAPEL_SEM_PERMISSAO = "EQUIPE_PAPEL_SEM_PERMISSAO";

/**
 * Um UPDATE que a RLS barra não dá erro: altera zero linhas. Quem altera
 * confere o que voltou e responde com esta recusa, sem auditar nada.
 */
export function semPermissao(area: string): Result<never, AppError> {
  return Err(
    AppErrors.security(
      PAPEL_SEM_PERMISSAO,
      `O seu papel não permite alterar ${area}.`
    )
  );
}

/**
 * Registra o que a equipe fez, na mesma transação da mudança. `detalhes` leva
 * só nomes de campos e situações: nunca dado pessoal (docs/produto/04).
 */
export async function auditar(
  tx: Tx,
  pessoa: PessoaDaEquipe,
  evento: {
    acao: string;
    entidade: string;
    entidadeId: string;
    detalhes?: Record<string, unknown>;
  }
): Promise<void> {
  await tx.insert(auditEvents).values({
    actorId: pessoa.id,
    action: evento.acao,
    entity: evento.entidade,
    entityId: evento.entidadeId,
    details: evento.detalhes ?? {},
  });
}

export type Tabelas = {
  city: City[];
  category: Category[];
  place: Place[];
  place_media: PlaceMedia[];
  place_hours: PlaceHours[];
  offer: Offer[];
  editorial_review: EditorialReview[];
};

/**
 * As tabelas do catálogo, como a equipe as vê (inclusive rascunhos), no mesmo
 * formato da antiga fonte provisória: as telas montam listas e contagens sem
 * mudar. Serve ao tamanho atual do catálogo; com centenas de casas, as
 * listagens passam a consultas filtradas e paginadas.
 */
export async function tabelasDaEquipe(tx: Tx): Promise<Tabelas> {
  const [city, category, place, place_media, place_hours, offer, review] =
    await Promise.all([
      tx.select().from(cities),
      tx.select().from(categories),
      tx.select().from(places),
      tx.select().from(placeMedia),
      tx.select().from(placeHours),
      tx.select().from(offers),
      tx.select().from(editorialReviews),
    ]);
  return {
    city,
    category,
    place,
    place_media,
    place_hours,
    offer,
    editorial_review: review,
  };
}
