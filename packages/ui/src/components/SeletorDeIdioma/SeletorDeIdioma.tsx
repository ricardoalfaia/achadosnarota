"use client";

import { useId } from "react";

import { cn } from "../../lib/cn";

export type OpcaoDeIdioma<Idioma extends string = string> = {
  valor: Idioma;
  /** O nome no próprio idioma ("Português", "English"): quem procura o seu reconhece de cara. */
  nome: string;
  /** Código curto do selo: "PT-BR", "EN". */
  codigo: string;
};

function Girando() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="size-3 animate-spin"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
        className="opacity-25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Escolha de idioma no mesmo desenho do `SeletorDeTema`: um grupo de botões de
 * rádio com o indicador deslizando até a opção escolhida. Cada opção mostra o
 * código em um selo e o nome no próprio idioma. Enquanto `ocupado`, o selo da
 * opção escolhida vira um indicador de progresso e o grupo não aceita troca:
 * a aplicação está refazendo a tela no idioma novo.
 */
export function SeletorDeIdioma<Idioma extends string>({
  opcoes,
  valor,
  aoMudar,
  rotulo = "Idioma",
  ocupado = false,
  className,
}: {
  opcoes: readonly OpcaoDeIdioma<Idioma>[];
  valor: Idioma;
  aoMudar: (idioma: Idioma) => void;
  /** Nome acessível do grupo. */
  rotulo?: string;
  /** A troca está em andamento. */
  ocupado?: boolean;
  className?: string;
}) {
  const nome = useId();
  const quantidade = Math.max(opcoes.length, 1);
  const posicao = Math.max(
    opcoes.findIndex((opcao) => opcao.valor === valor),
    0
  );

  return (
    <div
      role="radiogroup"
      aria-label={rotulo}
      aria-busy={ocupado || undefined}
      className={cn(
        "relative grid rounded-control border border-border bg-background p-[3px]",
        className
      )}
      style={{ gridTemplateColumns: `repeat(${quantidade}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-[3px] left-[3px] rounded-md bg-surface shadow-sm ring-1 ring-border transition-transform duration-300 ease-smooth"
        style={{
          width: `calc((100% - 6px) / ${quantidade})`,
          transform: `translateX(${posicao * 100}%)`,
        }}
      />
      {opcoes.map((opcao) => {
        const escolhido = opcao.valor === valor;
        return (
          <label
            key={opcao.valor}
            className={cn(
              "relative z-10 flex h-8 min-w-0 cursor-pointer items-center justify-center gap-2 rounded-md px-2 text-xs font-bold text-foreground-muted transition-colors duration-200 ease-smooth",
              "hover:text-foreground has-[:checked]:text-primary has-[:disabled]:cursor-wait has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
            )}
          >
            <input
              type="radio"
              name={nome}
              value={opcao.valor}
              checked={escolhido}
              disabled={ocupado}
              onChange={() => aoMudar(opcao.valor)}
              aria-label={opcao.nome}
              className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-wait"
            />
            <span
              aria-hidden="true"
              className={cn(
                "flex h-4.5 min-w-7 shrink-0 items-center justify-center rounded px-1 font-mono text-[9.5px] font-extrabold tracking-wide transition-colors duration-200 ease-smooth",
                escolhido
                  ? "bg-primary-solid text-primary-solid-foreground ring-1 ring-primary-solid-border"
                  : "bg-chip text-foreground-muted"
              )}
            >
              {escolhido && ocupado ? <Girando /> : opcao.codigo}
            </span>
            <span aria-hidden="true" className="truncate">
              {opcao.nome}
            </span>
          </label>
        );
      })}
    </div>
  );
}
