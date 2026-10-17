import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "../../lib/cn";
import { ICONE_DO_TOM, type TomDoCartao } from "../tons";

/**
 * Um item de "Ações rápidas": ícone em quadrado suave, título, descrição e a
 * seta à direita. Só apresentação: a aplicação o envolve com o link ou o botão
 * da ação. O hover usa `group`; o foco, `in-focus-visible`.
 */
export function CartaoDeAcao({
  icone,
  titulo,
  descricao,
  tom = "primario",
  className,
}: {
  icone: ReactNode;
  titulo: string;
  descricao?: string;
  tom?: TomDoCartao;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group flex items-center gap-3.5 rounded-card border border-border bg-surface p-3.5 text-foreground transition-[border-color,box-shadow] duration-200 ease-smooth hover:border-border-strong hover:shadow-sm in-focus-visible:outline-2 in-focus-visible:outline-offset-2 in-focus-visible:outline-ring",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-control [&_svg]:size-5.5 [&_svg]:stroke-[1.75]",
          ICONE_DO_TOM[tom]
        )}
      >
        {icone}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-semibold">{titulo}</span>
        {descricao && (
          <span className="truncate text-sm text-foreground-muted">
            {descricao}
          </span>
        )}
      </span>
      <ChevronRight
        aria-hidden="true"
        className="size-4 shrink-0 text-foreground-muted transition-[color,translate] duration-200 ease-smooth group-hover:translate-x-0.5 group-hover:text-primary"
      />
    </div>
  );
}
