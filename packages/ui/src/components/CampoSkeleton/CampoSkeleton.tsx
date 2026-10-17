import { cn } from "../../lib/cn";
import type { Tamanho } from "../tipos";

const ALTURA: Record<Tamanho, string> = {
  sm: "h-control-sm px-2.5",
  md: "h-control-md px-3",
  lg: "h-control-lg px-3",
};

/**
 * Lugar do campo enquanto os dados dele carregam — `fallback` do `<Suspense>`.
 * Mesma altura e borda do campo real, para a tela não pular: use o mesmo
 * `tamanho` do campo. Server Component.
 */
export function CampoSkeleton({
  tamanho = "lg",
  className,
}: {
  tamanho?: Tamanho;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex w-full flex-col justify-center gap-2 rounded-control border border-border bg-surface",
        ALTURA[tamanho],
        className
      )}
    >
      {tamanho === "lg" && (
        <span className="h-2.5 w-20 animate-pulse rounded bg-surface-active" />
      )}
      <span className="h-3.5 w-32 animate-pulse rounded bg-surface-hover" />
      <span className="sr-only">Carregando…</span>
    </div>
  );
}
