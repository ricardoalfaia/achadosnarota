import "server-only";

import { createHash } from "node:crypto";

import type { UsuarioDaSessao } from "@/shared/sessao/sessao";

export const ESCOPO_ANONIMO = "anonimo";

/**
 * O escopo de cache da pessoa: os 16 primeiros caracteres do SHA-256 do id.
 * Serve só para separar caches no navegador; não identifica nem autoriza
 * nada (quem decide o acesso é o servidor, a cada pedido).
 */
export function escopoDaPessoa(usuario: UsuarioDaSessao | null): string {
  if (!usuario) return ESCOPO_ANONIMO;
  return createHash("sha256").update(usuario.id).digest("hex").slice(0, 16);
}
