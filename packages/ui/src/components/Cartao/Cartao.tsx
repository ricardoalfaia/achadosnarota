import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

/**
 * Superfície que agrupa um assunto. No escuro as camadas se separam pela borda;
 * `elevado` acrescenta sombra para cartões que flutuam sobre o conteúdo.
 */
export function Cartao({
  elevado = false,
  className,
  children,
}: {
  elevado?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-card border border-border bg-surface text-foreground",
        elevado && "shadow-md",
        className
      )}
    >
      {children}
    </section>
  );
}

export function CabecalhoDoCartao({
  titulo,
  descricao,
  acoes,
  className,
}: {
  titulo: ReactNode;
  descricao?: ReactNode;
  /** Botões à direita do título. */
  acoes?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex items-start justify-between gap-4 border-b border-border px-5 py-4",
        className
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <h3 className="truncate text-xl font-bold">{titulo}</h3>
        {descricao && (
          <p className="text-sm text-foreground-muted">{descricao}</p>
        )}
      </div>
      {acoes && <div className="flex shrink-0 items-center gap-2">{acoes}</div>}
    </header>
  );
}

export function CorpoDoCartao({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("flex-1 px-5 py-4", className)}>{children}</div>;
}

export function RodapeDoCartao({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <footer
      className={cn(
        "flex items-center justify-end gap-2 rounded-b-card border-t border-border bg-surface-raised px-5 py-3",
        className
      )}
    >
      {children}
    </footer>
  );
}
