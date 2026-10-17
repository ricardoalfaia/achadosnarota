import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

import { cn } from "../../lib/cn";
import { COR_DO_TOM, FUNDO_DO_TOM, type TomDoCartao } from "../tons";

export type TendenciaDoIndicador = "alta" | "baixa" | "estavel";

export type VariacaoDoIndicador = {
  /** "12%". */
  texto: string;
  tendencia: TendenciaDoIndicador;
  /** Depois do número: "este mês". */
  descricao?: string;
};

const TENDENCIA: Record<
  TendenciaDoIndicador,
  { icone: ReactNode; cor: string }
> = {
  alta: { icone: <ArrowUp />, cor: "text-success" },
  baixa: { icone: <ArrowDown />, cor: "text-danger" },
  estavel: { icone: <Minus />, cor: "text-foreground-muted" },
};

const ROTULOS_DA_TENDENCIA: Record<TendenciaDoIndicador, string> = {
  alta: "Alta de",
  baixa: "Queda de",
  estavel: "Estável:",
};

/**
 * O cartão de KPI do painel: ícone no topo, valor grande, rótulo e variação,
 * sobre o fundo suave do tom. É só apresentação, sem interação própria: para
 * navegar, a aplicação o envolve com um link. O realce de hover usa `group` e o
 * de foco, `in-focus-visible`, e valem igual dentro ou fora de um link.
 */
export function CartaoDeIndicador({
  icone,
  valor,
  rotulo,
  tom = "primario",
  variacao,
  rotulosDaTendencia = ROTULOS_DA_TENDENCIA,
  className,
}: {
  icone: ReactNode;
  valor: ReactNode;
  rotulo: string;
  tom?: TomDoCartao;
  variacao?: VariacaoDoIndicador;
  /** Lido antes da variação por leitores de tela; para traduzir. */
  rotulosDaTendencia?: Record<TendenciaDoIndicador, string>;
  className?: string;
}) {
  const tendencia = variacao && TENDENCIA[variacao.tendencia];
  return (
    <div
      className={cn(
        "group flex h-full flex-col gap-3 rounded-card border bg-linear-to-b to-surface p-5 text-foreground transition-[box-shadow,translate] duration-200 ease-smooth hover:-translate-y-px hover:shadow-md in-focus-visible:outline-2 in-focus-visible:outline-offset-2 in-focus-visible:outline-ring",
        FUNDO_DO_TOM[tom],
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn("[&_svg]:size-6 [&_svg]:stroke-[1.75]", COR_DO_TOM[tom])}
      >
        {icone}
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="font-sans text-4xl font-bold tabular-nums">
          {valor}
        </span>
        <span className="text-lg font-medium">{rotulo}</span>
      </div>
      {variacao && tendencia && (
        <p className="mt-auto flex items-center gap-1 text-sm text-foreground-muted">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-semibold [&_svg]:size-3.5",
              tendencia.cor
            )}
          >
            <span aria-hidden="true">{tendencia.icone}</span>
            <span className="sr-only">
              {rotulosDaTendencia[variacao.tendencia]}
            </span>
            {variacao.texto}
          </span>
          {variacao.descricao}
        </p>
      )}
    </div>
  );
}
