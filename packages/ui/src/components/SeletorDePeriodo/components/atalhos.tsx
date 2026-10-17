import type {
  Atalho,
  SeletorDePeriodoEstado,
} from "../../../hooks/use-seletor-de-periodo";
import { cn } from "../../../lib/cn";

export function Atalhos({
  seletor,
  atalhos,
}: {
  seletor: SeletorDePeriodoEstado;
  atalhos: readonly Atalho[];
}) {
  const { maxDias, rascunho } = seletor;
  const cabem = atalhos.filter(
    (atalho) => maxDias === undefined || atalho.dias <= maxDias
  );

  return (
    <div
      className="mb-4 flex flex-wrap gap-2"
      role="group"
      aria-label="Períodos prontos"
    >
      {cabem.map((atalho) => {
        const periodo = seletor.periodoDoAtalho(atalho.dias);
        const ativo =
          rascunho.inicio === periodo.inicio && rascunho.fim === periodo.fim;
        return (
          <button
            key={atalho.dias}
            type="button"
            aria-pressed={ativo}
            onClick={() => seletor.aplicarAtalho(atalho.dias)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              ativo
                ? "border-primary-solid-border bg-primary-solid text-primary-solid-foreground"
                : "border-border-strong text-foreground hover:border-primary hover:text-primary"
            )}
          >
            {atalho.label}
          </button>
        );
      })}
    </div>
  );
}
