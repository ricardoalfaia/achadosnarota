import type { ReactNode } from "react";

import { cn } from "../../lib/cn";
import type { Lado } from "../tipos";

/**
 * A caixa que abre abaixo (ou acima) do campo. O pai precisa ser `relative`.
 * Fechar ao clicar fora e com Esc é do `useFecharAoSair`, no campo. Abre e fecha
 * com animação; o campo usa `usePresenca` para mantê-la montada durante a saída.
 */
export function CaixaSuspensa({
  lado = "baixo",
  saindo = false,
  className,
  children,
  ...aria
}: {
  lado?: Lado;
  /** Fechando: roda a animação de saída e deixa de receber interação (`usePresenca`). */
  saindo?: boolean;
  className?: string;
  children: ReactNode;
  id?: string;
  role?: "dialog";
  "aria-label"?: string;
}) {
  return (
    <div
      {...aria}
      inert={saindo}
      className={cn(
        "absolute left-0 z-50 max-w-[calc(100vw-2rem)] rounded-overlay bg-surface p-4 shadow-xl ring-1 ring-border",
        lado === "cima"
          ? "bottom-full mb-2 origin-bottom [--popover-offset:6px]"
          : "top-full mt-2 origin-top",
        saindo ? "animate-popover-out" : "animate-popover-in",
        className
      )}
    >
      {children}
    </div>
  );
}
