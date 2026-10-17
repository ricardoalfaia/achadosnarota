"use client";

import { Botao } from "@achados/ui";

/** Recarrega a página; se a rede voltou, o app abre normalmente. */
export function BotaoDeTentarDeNovo() {
  return <Botao onClick={() => window.location.reload()}>Tentar de novo</Botao>;
}
