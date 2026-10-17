import { AppErrors, Err, Ok, type Result } from "@achados/core";

// O pedido de favoritar chega do navegador: validado aqui antes de qualquer
// acesso ao banco (a validação do botão é só conveniência).

const SLUG = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;

export type PedidoDeFavorito = { slug: string; favoritar: boolean };

export function lerPedidoDeFavorito(
  slug: unknown,
  favoritar: unknown
): Result<PedidoDeFavorito> {
  if (typeof slug !== "string" || !SLUG.test(slug))
    return Err(
      AppErrors.validation("LUGAR_INVALIDO", "Lugar inválido.", {
        field: "slug",
      })
    );
  if (typeof favoritar !== "boolean")
    return Err(
      AppErrors.validation("PEDIDO_INVALIDO", "Pedido inválido.", {
        field: "favoritar",
      })
    );
  return Ok({ slug, favoritar });
}

/** Código do erro quando quem pede não entrou: a tela leva ao login. */
export const SESSAO_NECESSARIA = "SESSAO_NECESSARIA";
