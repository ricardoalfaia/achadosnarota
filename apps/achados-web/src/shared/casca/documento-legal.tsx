import type { ReactNode } from "react";
import { Alerta } from "@achados/ui";

import { BarraDaTela } from "./barra-da-tela";

/**
 * A moldura de um documento legal (termos, privacidade). O conteúdo final
 * depende da revisão jurídica (docs/produto/04): até lá a página diz que é
 * rascunho, em vez de publicar texto que ninguém aprovou.
 */
export function DocumentoLegal({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <BarraDaTela titulo={titulo} />
      <Alerta intencao="atencao" titulo="Rascunho em revisão">
        Este documento ainda está sendo revisado juridicamente. A versão
        aprovada será publicada aqui antes do lançamento.
      </Alerta>
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-foreground [&_h2]:mt-2 [&_h2]:text-base [&_h2]:font-extrabold">
        {children}
      </div>
    </div>
  );
}
