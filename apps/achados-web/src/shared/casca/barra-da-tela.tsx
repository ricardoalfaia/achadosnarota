import type { ReactNode } from "react";
import Link from "next/link";
import { estiloDoBotao } from "@achados/ui/estilos";
import { ChevronLeft } from "lucide-react";

import { ROTAS } from "@/shared/rotas";

/**
 * O topo das telas de seção (Meu Passaporte, Meus Favoritos): voltar ao
 * início, o título no centro e uma ação opcional à direita.
 */
export function BarraDaTela({
  titulo,
  acao,
  voltarPara = ROTAS.explorar,
}: {
  titulo: string;
  acao?: ReactNode;
  voltarPara?: string;
}) {
  return (
    <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2">
      <Link
        href={voltarPara}
        aria-label="Voltar"
        className={estiloDoBotao({
          variante: "suave",
          tamanho: "xs",
          somenteIcone: true,
          className: "[&_svg]:size-4",
        })}
      >
        <ChevronLeft />
      </Link>
      <h1 className="text-center text-base font-extrabold text-foreground">
        {titulo}
      </h1>
      <div className="flex justify-end">{acao}</div>
    </div>
  );
}
