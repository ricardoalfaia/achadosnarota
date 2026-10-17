import type { ReactNode } from "react";

import { cn } from "../../lib/cn";
import { COR_DO_TOM, FUNDO_DO_TOM, type TomDoCartao } from "../tons";

/**
 * Um ladrilho de "Modelos mais usados": ícone, nome e um detalhe ("12 usos"),
 * sobre o fundo suave do tom. Só apresentação: a aplicação o envolve com o link
 * do modelo. O hover usa `group`; o foco, `in-focus-visible`.
 */
export function CartaoDeModelo({
  icone,
  nome,
  detalhe,
  tom = "primario",
  className,
}: {
  icone: ReactNode;
  nome: string;
  detalhe?: string;
  tom?: TomDoCartao;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group flex h-full min-h-28 flex-col gap-3 rounded-card border bg-linear-to-b to-surface p-4 text-foreground transition-[box-shadow,translate] duration-200 ease-smooth hover:-translate-y-px hover:shadow-md in-focus-visible:outline-2 in-focus-visible:outline-offset-2 in-focus-visible:outline-ring",
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
      <span className="mt-auto flex flex-col gap-0.5">
        <span className="line-clamp-2 font-semibold">{nome}</span>
        {detalhe && (
          <span className="text-sm text-foreground-muted">{detalhe}</span>
        )}
      </span>
    </div>
  );
}
