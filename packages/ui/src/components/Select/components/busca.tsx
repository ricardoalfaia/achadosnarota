import { useEffect, useRef } from "react";

import type { SelectEstado } from "../../../hooks/use-select";
import { IconeBusca } from "../../Icones";

/** Busca interna no topo da lista; recebe o foco ao abrir. */
export function CampoDeBusca<T extends string>({
  select,
  idDaLista,
  placeholder,
}: {
  select: SelectEstado<T>;
  idDaLista: string;
  placeholder: string;
}) {
  const entrada = useRef<HTMLInputElement>(null);

  useEffect(() => {
    entrada.current?.focus();
  }, []);

  return (
    <div className="border-b border-border p-2">
      <div className="flex items-center gap-2 rounded-control bg-surface-hover px-3 focus-within:ring-1 focus-within:ring-ring">
        <IconeBusca />
        <input
          ref={entrada}
          type="search"
          role="combobox"
          aria-label={placeholder}
          aria-expanded
          aria-controls={idDaLista}
          aria-autocomplete="list"
          aria-activedescendant={
            select.ativo >= 0 ? `${idDaLista}-${select.ativo}` : undefined
          }
          value={select.busca}
          onChange={(evento) => select.buscar(evento.target.value)}
          onKeyDown={select.aoTeclar}
          placeholder={placeholder}
          autoComplete="off"
          className="h-10 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-subtle"
        />
      </div>
    </div>
  );
}
