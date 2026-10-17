"use client";

import { useId, type ReactNode } from "react";

import { cn } from "../../lib/cn";

/** `auto` acompanha o sistema operacional; `light` e `dark` são o valor de `data-theme`. */
export type Tema = "light" | "dark" | "auto";

const BASE = {
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  className: "size-3.5 shrink-0",
} as const;

const OPCOES: readonly { valor: Tema; rotulo: string; icone: ReactNode }[] = [
  {
    valor: "light",
    rotulo: "Claro",
    icone: (
      <svg {...BASE}>
        <circle cx="8" cy="8" r="2.75" />
        <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1.05 1.05M11.55 11.55l1.05 1.05M3.4 12.6l1.05-1.05M11.55 4.45l1.05-1.05" />
      </svg>
    ),
  },
  {
    valor: "dark",
    rotulo: "Escuro",
    icone: (
      <svg {...BASE}>
        <path d="M13.5 9.6A5.75 5.75 0 0 1 6.4 2.5a5.75 5.75 0 1 0 7.1 7.1Z" />
      </svg>
    ),
  },
  {
    valor: "auto",
    rotulo: "Auto",
    icone: (
      <svg {...BASE}>
        <rect x="1.75" y="2.5" width="12.5" height="8.5" rx="1.25" />
        <path d="M5.5 13.5h5M8 11v2.5" />
      </svg>
    ),
  },
];

/**
 * Claro, Escuro ou Auto, como no menu do usuário do protótipo. Só apresenta e
 * avisa a escolha: guardar a preferência e aplicar `data-theme` é da aplicação.
 * São botões de rádio nativos, então as setas trocam de opção.
 */
export function SeletorDeTema({
  valor,
  aoMudar,
  rotulo = "Tema do sistema",
  rotulos,
  className,
}: {
  valor: Tema;
  aoMudar: (tema: Tema) => void;
  /** Nome acessível do grupo. */
  rotulo?: string;
  /** Texto de cada opção, para aplicações em outro idioma. O padrão é português. */
  rotulos?: Partial<Record<Tema, string>>;
  className?: string;
}) {
  const nome = useId();
  const posicao = OPCOES.findIndex((opcao) => opcao.valor === valor);

  return (
    <div
      role="radiogroup"
      aria-label={rotulo}
      className={cn(
        "relative grid grid-cols-3 rounded-control border border-border bg-background p-[3px]",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-[3px] left-[3px] w-[calc((100%-6px)/3)] rounded-md bg-surface shadow-sm ring-1 ring-border transition-transform duration-300 ease-smooth"
        style={{ transform: `translateX(${Math.max(posicao, 0) * 100}%)` }}
      />
      {OPCOES.map((opcao) => (
        <label
          key={opcao.valor}
          className={cn(
            "relative z-10 flex h-7 cursor-pointer items-center justify-center gap-1.5 rounded-md text-xs font-bold text-foreground-muted transition-colors duration-200 ease-smooth",
            "hover:text-foreground has-[:checked]:text-primary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
          )}
        >
          <input
            type="radio"
            name={nome}
            value={opcao.valor}
            checked={opcao.valor === valor}
            onChange={() => aoMudar(opcao.valor)}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          {opcao.icone}
          {rotulos?.[opcao.valor] ?? opcao.rotulo}
        </label>
      ))}
    </div>
  );
}
