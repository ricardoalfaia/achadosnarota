"use client";

import { SeletorDeTema } from "@achados/ui";
import { Palette } from "lucide-react";

import { usePreferencias } from "@/shared/preferencias/preferencias-provider";
import { LINHA_DE_AJUSTE, RotuloDaLinha } from "./linha-de-ajuste";

/**
 * A linha "Aparência" do perfil: claro, escuro ou o tema do aparelho. A
 * escolha vale na hora e fica num cookie, lido pelo servidor na próxima visita.
 */
export function EscolhaDeTema() {
  const { preferencias, mudar } = usePreferencias();
  return (
    <div className={LINHA_DE_AJUSTE}>
      <RotuloDaLinha icone={<Palette />}>Aparência</RotuloDaLinha>
      <SeletorDeTema
        valor={preferencias.tema}
        aoMudar={(tema) => mudar("tema", tema)}
      />
    </div>
  );
}
