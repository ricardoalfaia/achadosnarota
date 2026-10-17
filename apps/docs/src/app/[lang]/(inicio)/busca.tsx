"use client";

import { useSearchContext } from "fumadocs-ui/contexts/search";
import { Search } from "lucide-react";

/** Campo de busca da página inicial: abre a mesma busca do topo. */
export function BuscaDoInicio({ rotulo }: { rotulo: string }) {
  const { setOpenSearch, hotKey } = useSearchContext();

  return (
    <button
      type="button"
      onClick={() => setOpenSearch(true)}
      className="flex h-12 w-full max-w-md items-center gap-3 rounded-control border border-border bg-surface px-5 text-left text-foreground-muted shadow-sm transition-colors hover:border-border-strong"
    >
      <Search className="size-4 shrink-0" aria-hidden />
      <span className="flex-1 truncate">{rotulo}</span>
      <span className="flex gap-1" aria-hidden>
        {hotKey.map((tecla, indice) => (
          <kbd
            key={indice}
            className="rounded-md border border-border bg-surface-raised px-1.5 font-mono text-xs"
          >
            {tecla.display}
          </kbd>
        ))}
      </span>
    </button>
  );
}
