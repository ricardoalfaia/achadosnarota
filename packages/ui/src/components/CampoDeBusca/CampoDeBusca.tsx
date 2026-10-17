import type { ComponentProps } from "react";

import { cn } from "../../lib/cn";
import { IconeBusca } from "../Icones";
import { atalhoParaAria } from "./atalho";

export type CampoDeBuscaProps = Omit<ComponentProps<"input">, "type"> & {
  /** Nome acessível do campo ("Buscar documentos, clientes ou modelos"). */
  rotulo: string;
  /** Dica de atalho à direita ("Ctrl K"). Só mostra: registrar a tecla é da aplicação. */
  atalho?: string;
};

/**
 * A caixa de busca da faixa do topo: `<input type="search">` com a lupa à
 * esquerda e a dica de atalho à direita. Aceita todas as props nativas do
 * `<input>` e `ref` (React 19); `className` vai para a moldura, que define a
 * largura. Controlado ou não, como um input comum.
 */
export function CampoDeBusca({
  rotulo,
  atalho,
  className,
  ...nativo
}: CampoDeBuscaProps) {
  return (
    <label
      className={cn(
        "flex h-control-md w-full items-center gap-2.5 rounded-control border border-border bg-header-control px-3.5 text-foreground-muted transition-all duration-240 ease-smooth focus-within:border-ring focus-within:shadow-ring-glow has-disabled:cursor-not-allowed has-disabled:opacity-60",
        className
      )}
    >
      <IconeBusca className="size-4.5" />
      <input
        aria-label={rotulo}
        aria-keyshortcuts={atalho ? atalhoParaAria(atalho) : undefined}
        {...nativo}
        type="search"
        className="min-w-0 flex-1 border-0 bg-transparent text-lg text-foreground outline-none placeholder:text-foreground-muted disabled:cursor-not-allowed"
      />
      {atalho && (
        <kbd
          aria-hidden="true"
          className="shrink-0 rounded-md border border-border bg-surface-raised px-1.5 py-0.5 font-sans text-xs font-semibold text-foreground-muted shadow-kbd"
        >
          {atalho}
        </kbd>
      )}
    </label>
  );
}
