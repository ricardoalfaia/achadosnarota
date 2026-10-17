"use client";

import { SeletorDeTema } from "@achados/ui";
import { Palette } from "lucide-react";

import { usePreferencias } from "@/shared/preferencias/preferencias-provider";

/**
 * A linha "Aparência" do perfil: claro, escuro ou o tema do aparelho. A
 * escolha vale na hora e fica num cookie, lido pelo servidor na próxima visita.
 */
export function EscolhaDeTema() {
  const { preferencias, mudar } = usePreferencias();
  return (
    <div className="flex items-center justify-between gap-3 py-3 text-xs font-semibold">
      <span className="flex items-center gap-2 text-foreground">
        <Palette aria-hidden="true" className="size-4 text-foreground-subtle" />
        Aparência
      </span>
      <SeletorDeTema
        valor={preferencias.tema}
        aoMudar={(tema) => mudar("tema", tema)}
      />
    </div>
  );
}
