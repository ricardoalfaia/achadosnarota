"use client";

import { cn } from "@achados/ui/estilos";
import { Search } from "lucide-react";

import { useBuscaRapida } from "../hooks/use-busca-rapida";

/**
 * O campo compacto de busca do cabeçalho desktop. Sem JavaScript, envia por
 * GET para a exploração, e o servidor filtra igual.
 */
export function BuscaRapida({ className }: { className?: string }) {
  const { termo, aoDigitar, aoEnviar } = useBuscaRapida();
  return (
    <form
      role="search"
      action="/"
      onSubmit={aoEnviar}
      className={cn(
        "flex h-10 items-center gap-2 rounded-full border border-border bg-header-control px-3.5 transition-shadow focus-within:border-ring focus-within:shadow-ring-glow",
        className
      )}
    >
      <Search
        aria-hidden="true"
        className="size-4 shrink-0 text-foreground-subtle"
      />
      <input
        type="search"
        name="q"
        value={termo}
        onChange={(evento) => aoDigitar(evento.target.value)}
        placeholder="Buscar lugares..."
        aria-label="Buscar lugares no cabeçalho"
        enterKeyHint="search"
        autoComplete="off"
        className="min-w-0 flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-subtle"
      />
    </form>
  );
}
