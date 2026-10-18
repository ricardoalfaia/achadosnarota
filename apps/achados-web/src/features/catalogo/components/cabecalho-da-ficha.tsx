import { Nota } from "@achados/ui";
import { cn } from "@achados/ui/estilos";
import { MapPin } from "lucide-react";

import type { FichaDoLugar } from "../domain/tipos";
import { SeloDaCuradoria } from "./conteudo-da-ficha";

/**
 * O nome do lugar com o selo da curadoria, a nota e a cidade. `foto`: grande e
 * em branco, sobre a foto do topo no celular; `pagina`: na coluna de texto do
 * desktop. A ficha usa as duas e mostra uma por largura de tela.
 */
export function CabecalhoDaFicha({
  lugar,
  variante,
  className,
}: {
  lugar: Pick<FichaDoLugar, "nome" | "nota" | "local" | "avaliacao">;
  variante: "foto" | "pagina";
  className?: string;
}) {
  const sobreAFoto = variante === "foto";
  return (
    <header className={className}>
      {lugar.avaliacao && <SeloDaCuradoria />}
      <h1
        className={cn(
          "mt-2 font-extrabold text-foreground",
          sobreAFoto
            ? "text-[2rem] leading-[1.02] tracking-[-0.03em]"
            : "text-4xl leading-tight tracking-tight"
        )}
      >
        {lugar.nome}
      </h1>
      <div
        className={cn(
          "mt-2 flex flex-wrap items-center gap-2",
          sobreAFoto ? "text-sm" : "text-xs"
        )}
      >
        {lugar.nota !== undefined && (
          <>
            <Nota valor={lugar.nota} complemento="(curadoria)" />
            <span aria-hidden="true" className="text-foreground-subtle">
              •
            </span>
          </>
        )}
        <span className="flex items-center gap-1 text-foreground-muted">
          <MapPin aria-hidden="true" className="size-3.5" />
          {lugar.local}
        </span>
      </div>
    </header>
  );
}
