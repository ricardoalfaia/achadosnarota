import { cn } from "../../lib/cn";

// A aparência da pílula como função pura, para dar o mesmo visual a um link de
// filtro num Server Component (`@achados/ui/estilos`):
// `<Link className={estiloDaPilula({ ativa })} aria-current=...>`.

export type AparenciaDaPilula = {
  /** A opção escolhida: laranja sólido com texto branco. */
  ativa?: boolean;
};

const BASE =
  "inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-2xl border px-4 text-xs whitespace-nowrap transition-[color,background-color,border-color,box-shadow] duration-200 ease-smooth outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&_svg]:size-3.5 [&_svg]:shrink-0";

const ATIVA =
  "border-transparent bg-primary-solid font-bold text-primary-solid-foreground shadow-sm";

const INATIVA =
  "border-border bg-surface font-semibold text-chip-foreground hover:border-primary-border hover:text-primary";

export function estiloDaPilula({
  ativa = false,
  className,
}: AparenciaDaPilula & { className?: string } = {}): string {
  return cn(BASE, ativa ? ATIVA : INATIVA, className);
}
