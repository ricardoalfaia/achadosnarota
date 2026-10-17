import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

/**
 * O lugar de uma região sem dados ("Nenhum documento ainda") ou de uma tela
 * ainda não construída: ícone em círculo suave, título, descrição e uma ação.
 * Não substitui o estado de erro nem o de carregamento, que têm o seu.
 */
export function EstadoVazio({
  icone,
  titulo,
  descricao,
  acao,
  nivelDoTitulo = "h3",
  className,
}: {
  icone?: ReactNode;
  titulo: string;
  descricao?: ReactNode;
  /** Normalmente um `Botao` ou um link com `estiloDoBotao`. */
  acao?: ReactNode;
  /** Padrão: `h3`, para uma região dentro da página. */
  nivelDoTitulo?: "h2" | "h3" | "h4";
  className?: string;
}) {
  const Titulo = nivelDoTitulo;
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border-strong bg-surface px-6 py-12 text-center text-foreground",
        className
      )}
    >
      {icone && (
        <span
          aria-hidden="true"
          className="mb-1 flex size-14 items-center justify-center rounded-full bg-primary-subtle text-primary [&_svg]:size-7 [&_svg]:stroke-[1.75]"
        >
          {icone}
        </span>
      )}
      <Titulo className="text-xl font-bold">{titulo}</Titulo>
      {descricao && (
        <p className="max-w-md text-base text-foreground-muted">{descricao}</p>
      )}
      {acao && <div className="mt-2">{acao}</div>}
    </div>
  );
}
