import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

/**
 * `marca`: laranja sólido com ícone branco (cupom). `suave`: laranja claro com
 * ícone laranja. `sucesso`: verde claro (cupom usado). `neutro`: cinza
 * (expirado, ação rápida).
 */
export type TomDaCaixaDeIcone = "marca" | "suave" | "sucesso" | "neutro";

/** `sm` 40px (lista), `md` 48px (cartão de benefício), `lg` 56px (topo de diálogo). */
export type TamanhoDaCaixaDeIcone = "sm" | "md" | "lg";

const TOM: Record<TomDaCaixaDeIcone, string> = {
  marca: "bg-primary-solid text-primary-solid-foreground shadow-glow",
  suave: "bg-primary-subtle text-brand",
  sucesso: "bg-success-subtle text-success",
  neutro: "bg-surface-hover text-foreground-muted",
};

const TAMANHO: Record<TamanhoDaCaixaDeIcone, string> = {
  sm: "size-10 rounded-xl [&_svg]:size-5",
  md: "size-12 rounded-2xl [&_svg]:size-6",
  lg: "size-14 rounded-2xl [&_svg]:size-7",
};

/** O ícone dentro de um quadrado arredondado colorido. Decorativo: o texto ao lado informa. */
export function CaixaDeIcone({
  tom = "marca",
  tamanho = "sm",
  className,
  children,
}: {
  tom?: TomDaCaixaDeIcone;
  tamanho?: TamanhoDaCaixaDeIcone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center [&_svg]:shrink-0",
        TOM[tom],
        TAMANHO[tamanho],
        className
      )}
    >
      {children}
    </span>
  );
}
