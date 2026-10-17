import {
  ArrowDown10,
  ArrowDownWideNarrow,
  ArrowDownZA,
  ArrowUp01,
  ArrowUpAZ,
  ArrowUpNarrowWide,
  type LucideIcon,
} from "lucide-react";

import type { TipoDeColuna } from "../tipos";

export type DirecaoDeOrdem = "asc" | "desc";

/** O desenho de cada direção acompanha o tipo da coluna, como o rótulo do menu. */
const ICONES_DE_ORDEM: Record<
  TipoDeColuna,
  Record<DirecaoDeOrdem, LucideIcon>
> = {
  texto: { asc: ArrowUpAZ, desc: ArrowDownZA },
  numero: { asc: ArrowUp01, desc: ArrowDown10 },
  data: { asc: ArrowUpNarrowWide, desc: ArrowDownWideNarrow },
};

export function IconeDeOrdem({
  tipo,
  direcao,
  className,
}: {
  tipo: TipoDeColuna;
  direcao: DirecaoDeOrdem;
  className?: string;
}) {
  const Icone = ICONES_DE_ORDEM[tipo][direcao];
  return <Icone aria-hidden="true" className={className} />;
}
