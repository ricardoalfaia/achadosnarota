import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

/**
 * Tom da etiqueta. Os sólidos (`marca`, `info`, `sucesso`, `escuro`) têm texto
 * branco com contraste AA e servem sobre foto. `claro` é a etiqueta branca
 * sobre foto; `neutro`, a etiqueta cinza sobre a superfície; `acento`, o âmbar
 * com borda; `sucessoSuave`, o verde claro.
 */
export type TomDaEtiqueta =
  | "marca"
  | "info"
  | "sucesso"
  | "escuro"
  | "claro"
  | "neutro"
  | "acento"
  | "sucessoSuave";

/** `sm` para cantos de cartão, `md` para o topo de uma ficha. */
export type TamanhoDaEtiqueta = "sm" | "md";

const TOM: Record<TomDaEtiqueta, string> = {
  marca: "bg-seal-featured text-seal-foreground shadow-sm",
  info: "bg-seal-beloved text-seal-foreground shadow-sm",
  sucesso: "bg-seal-verified text-seal-foreground shadow-sm",
  escuro: "bg-seal-new text-seal-foreground shadow-sm",
  claro: "bg-surface/95 text-foreground shadow-sm backdrop-blur-sm",
  neutro: "bg-chip font-medium text-chip-foreground",
  acento: "border border-accent-border bg-accent-subtle text-accent",
  sucessoSuave: "bg-success-subtle text-success",
};

const TAMANHO: Record<TamanhoDaEtiqueta, string> = {
  sm: "gap-1 px-2.5 py-0.5 text-2xs [&_svg]:size-3",
  md: "gap-1.5 px-3 py-1 text-xs [&_svg]:size-3.5",
};

/**
 * Pílula curta de texto: selo sobre a foto ("Destaque"), especialidade
 * ("Culinária Brasileira"), tag do lugar e selo da curadoria. Sem estado e
 * sem `"use client"`: serve em Server Component. O texto é a informação; a
 * cor nunca é a única pista.
 */
export function Etiqueta({
  tom = "neutro",
  tamanho = "md",
  icone,
  className,
  children,
}: {
  tom?: TomDaEtiqueta;
  tamanho?: TamanhoDaEtiqueta;
  /** Ícone decorativo antes do texto (estrela, coroa, escudo). */
  icone?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full font-bold whitespace-nowrap [&_svg]:shrink-0",
        TOM[tom],
        TAMANHO[tamanho],
        className
      )}
    >
      {icone && <span aria-hidden="true">{icone}</span>}
      {children}
    </span>
  );
}
