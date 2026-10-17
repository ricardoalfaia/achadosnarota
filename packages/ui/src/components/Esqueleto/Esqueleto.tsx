import { cn } from "../../lib/cn";

/**
 * Bloco que ocupa o lugar de um conteúdo enquanto ele carrega. O tamanho vem do
 * `className` (`h-4 w-40`, `size-10 rounded-full`). É decorativo: quem agrupa os
 * blocos marca a região com `aria-busy` ou usa `EsqueletoDeTexto`.
 */
export function Esqueleto({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block animate-pulse rounded-md bg-surface-active",
        className
      )}
    />
  );
}

/** Parágrafo carregando: `linhas` barras, a última mais curta. */
export function EsqueletoDeTexto({
  linhas = 3,
  className,
}: {
  linhas?: number;
  className?: string;
}) {
  return (
    <div role="status" className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: linhas }, (_, indice) => (
        <Esqueleto
          key={indice}
          className={cn("h-3", indice === linhas - 1 ? "w-2/3" : "w-full")}
        />
      ))}
      <span className="sr-only">Carregando…</span>
    </div>
  );
}
