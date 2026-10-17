import { AppErrors, Err, Ok } from "@achados/core";

import { SESSAO_NECESSARIA } from "@/features/favoritos";
import { slugsFavoritos } from "@/features/favoritos/servidor";
import { respostaDe } from "@/shared/consultas/resposta.servidor";
import { sessaoDaAcao } from "@/shared/sessao/sessao.servidor";

/**
 * GET /api/me/favoritos: os slugs salvos por quem está logado. Quem é a
 * pessoa vem da sessão, a cada pedido; o banco confere de novo pela RLS.
 * Privado: nunca em cache compartilhado.
 */
export async function GET() {
  const sessao = await sessaoDaAcao();
  if (!sessao.ok) return respostaDe(sessao, "no-store");
  if (!sessao.value)
    return respostaDe(
      Err(
        AppErrors.security(SESSAO_NECESSARIA, "Entre para ver seus favoritos.")
      ),
      "no-store"
    );
  const slugs = await slugsFavoritos(sessao.value.id);
  return respostaDe(
    slugs.ok ? Ok([...slugs.value]) : slugs,
    "private, no-store"
  );
}
