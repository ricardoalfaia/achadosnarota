"use client";

import { useNetworkStatus } from "@achados/ui/hooks";
import { WifiOff } from "lucide-react";

/**
 * Faixa no topo quando o aparelho perde a conexão (comum na estrada). O que
 * já está na tela continua; ações que dependem do servidor esperam a volta.
 */
export function AvisoSemConexao() {
  if (useNetworkStatus() === "online") return null;
  return (
    <p
      role="status"
      className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-foreground px-4 py-2 text-xs font-semibold text-foreground-inverse"
    >
      <WifiOff aria-hidden="true" className="size-3.5" />
      Sem conexão. Mostrando o que já foi carregado.
    </p>
  );
}
