"use server";

import {
  AppErrors,
  Err,
  Ok,
  toActionResult,
  type ActionResult,
  type Result,
} from "@achados/core";
import { novoId, offers, places } from "@achados/db";
import { eq, ne } from "drizzle-orm";

import { idDoRegistro } from "@/shared/cadastro/id.servidor";
import { auditar, naEquipe, semPermissao } from "@/shared/db/equipe.servidor";
import { lerDadosDaPromocao } from "./domain/validacao";

/**
 * Inclui (`id` nulo) ou altera uma promoção. Quem confere se a casa está
 * publicada é o servidor, pelo banco, nunca o que o navegador disse. Grava no
 * escopo da equipe: só administração e comercial escrevem promoções (RLS), e
 * cada mudança fica em `audit_event`.
 */
export async function salvarPromocao(
  id: unknown,
  dados: unknown
): Promise<ActionResult<{ id: string }>> {
  return toActionResult(await gravar(id, dados));
}

async function gravar(
  entradaId: unknown,
  entrada: unknown
): Promise<Result<{ id: string }>> {
  let id: string | null = null;
  if (entradaId !== null) {
    const lido = idDoRegistro("Promocao", entradaId);
    if (!lido.ok) return lido;
    id = lido.value;
  }

  return naEquipe(async (tx, pessoa) => {
    const [atual] = id
      ? await tx.select().from(offers).where(eq(offers.id, id)).limit(1)
      : [];
    if (id && !atual) return Err(AppErrors.notFound("Promocao", id));

    const casas = await tx
      .select({ id: places.id, status: places.status })
      .from(places)
      .where(ne(places.status, "archived"));
    const situacao = new Map(casas.map((c) => [c.id, c.status]));
    const dados = lerDadosDaPromocao(entrada, {
      casaPublicada: (casaId) => situacao.get(casaId) === "published",
    });
    if (!dados.ok) return dados;
    const d = dados.value;
    if (!situacao.has(d.casaId))
      return Err(AppErrors.validation("CASA_DESCONHECIDA", "Casa inválida."));

    const linha = {
      placeId: d.casaId,
      title: d.titulo,
      terms: d.termos,
      kind: d.tipo,
      icon: d.icone,
      limitPerUser: d.periodoDeUso === "unlimited" ? 1 : d.limitePorAssinante,
      usagePeriod: d.periodoDeUso,
      validFrom: d.vigencia
        ? new Date(`${d.vigencia.inicio}T00:00:00-03:00`)
        : null,
      validUntil: d.vigencia
        ? new Date(`${d.vigencia.fim}T23:59:59-03:00`)
        : null,
      status: d.status,
      updatedAt: new Date(),
    };

    const promocaoId = atual?.id ?? novoId();
    if (atual) {
      const alteradas = await tx
        .update(offers)
        .set(linha)
        .where(eq(offers.id, atual.id))
        .returning({ id: offers.id });
      if (alteradas.length === 0) return semPermissao("promoções");
    } else await tx.insert(offers).values({ ...linha, id: promocaoId });
    await auditar(tx, pessoa, {
      acao: atual ? `promocao.${d.status}` : "promocao.criada",
      entidade: "offer",
      entidadeId: promocaoId,
      detalhes: { situacao: d.status, casa: d.casaId },
    });
    return Ok({ id: promocaoId });
  });
}
