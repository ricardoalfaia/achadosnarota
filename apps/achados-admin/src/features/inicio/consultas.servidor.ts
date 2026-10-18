import "server-only";

import { Ok, type Result } from "@achados/core";

import { naEquipe, tabelasDaEquipe } from "@/shared/db/equipe.servidor";
import { rotaDoRegistro, ROTAS } from "@/shared/rotas";
import type { ResumoDoPainel } from "./domain/tipos";

/**
 * O resumo do início, em Result: contagens e filas no escopo da equipe, sem
 * dado de assinante.
 */
export async function resumoDoPainel(): Promise<Result<ResumoDoPainel>> {
  return naEquipe(async (tx) => {
    const banco = await tabelasDaEquipe(tx);
    const nomeDaCasa = new Map(banco.place.map((p) => [p.id, p.name]));
    const fotos = new Set(banco.place_media.map((m) => m.placeId));

    return Ok({
      indicadores: {
        casasPublicadas: banco.place.filter((p) => p.status === "published")
          .length,
        casasEmRascunho: banco.place.filter((p) => p.status === "draft").length,
        avaliacoesEmRevisao: banco.editorial_review.filter(
          (r) => r.status === "in_review"
        ).length,
        promocoesAtivas: banco.offer.filter((o) => o.status === "active")
          .length,
      },
      fila: {
        curadoria: banco.editorial_review
          .filter((r) => r.status === "in_review" || r.status === "approved")
          .map((r) => ({
            id: r.id,
            titulo: nomeDaCasa.get(r.placeId) ?? "",
            detalhe:
              r.status === "in_review"
                ? "Aguardando revisão"
                : "Aprovada, falta publicar",
            href: rotaDoRegistro(ROTAS.curadoria, r),
          })),
        promocoes: banco.offer
          .filter((o) => o.status === "pending_review" || o.status === "draft")
          .map((o) => ({
            id: o.id,
            titulo: o.title,
            detalhe: `${nomeDaCasa.get(o.placeId) ?? ""} · ${
              o.status === "pending_review" ? "Em revisão" : "Rascunho"
            }`,
            href: rotaDoRegistro(ROTAS.promocoes, o),
          })),
        casas: banco.place
          .filter((p) => p.status === "draft" || !fotos.has(p.id))
          .filter((p) => p.status !== "archived")
          .map((p) => ({
            id: p.id,
            titulo: p.name,
            detalhe: !fotos.has(p.id)
              ? "Sem fotos"
              : "Rascunho, falta publicar",
            href: rotaDoRegistro(ROTAS.casas, p),
          })),
      },
    });
  });
}
