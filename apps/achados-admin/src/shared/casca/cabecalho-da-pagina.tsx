import type { ReactNode } from "react";
import { cn } from "@achados/ui/estilos";

/**
 * O topo de cada tela do painel: a seção (sobretítulo), o título, uma linha
 * de descrição e as ações à direita. Serve em Server Component.
 */
export function CabecalhoDaPagina({
  secao,
  titulo,
  descricao,
  acoes,
  className,
}: {
  /** "Editorial", "Comercial": a seção do menu. */
  secao?: string;
  titulo: ReactNode;
  descricao?: ReactNode;
  acoes?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex animate-pagina flex-wrap items-end justify-between gap-4",
        className
      )}
    >
      <div className="min-w-0">
        {secao && (
          <p className="mb-1 text-xs font-bold tracking-[0.14em] text-primary uppercase">
            {secao}
          </p>
        )}
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground max-sm:text-2xl">
          {titulo}
        </h1>
        {descricao && (
          <p className="mt-1 max-w-2xl text-base text-foreground-muted">
            {descricao}
          </p>
        )}
      </div>
      {acoes && <div className="flex flex-wrap gap-2.5">{acoes}</div>}
    </div>
  );
}
