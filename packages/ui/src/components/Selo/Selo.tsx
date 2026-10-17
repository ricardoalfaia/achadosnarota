import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

/**
 * `ok`: estado positivo (ATUALIZADO, ONLINE, PRINCIPAL, ESTÁVEL).
 * `novo`: novidade (NEW, NOVO, VERSÃO ATUAL, versão no menu).
 */
export type VarianteDoSelo = "ok" | "novo";

const APARENCIA: Record<VarianteDoSelo, string> = {
  ok: "rounded-[3px] bg-badge-ok px-1 py-px text-[8px] font-bold text-badge-ok-foreground dark:border dark:border-badge-ok-border",
  novo: "rounded bg-linear-135 from-badge-new-start to-badge-new-end px-1.25 py-px text-[9px] font-extrabold tracking-[0.3px] text-badge-new-foreground uppercase shadow-badge-new dark:border dark:border-badge-new-border",
};

/**
 * Etiqueta pequena em maiúsculas: verde sólida (ok) ou degradê da marca (novo)
 * no claro e, no escuro, translúcida com borda.
 * Sem `"use client"`: serve em Server Component.
 */
export function Selo({
  variante = "ok",
  className,
  children,
}: {
  variante?: VarianteDoSelo;
  className?: string;
  children: ReactNode;
}) {
  return <span className={cn(APARENCIA[variante], className)}>{children}</span>;
}
