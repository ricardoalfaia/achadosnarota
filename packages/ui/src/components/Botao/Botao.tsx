import type { ComponentProps, ReactNode } from "react";

import { cn } from "../../lib/cn";
import { estiloDoBotao, type AparenciaDoBotao } from "./estilo";

function Girando() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="animate-spin"
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

type Nativo = Omit<ComponentProps<"button">, "disabled" | "children">;

export type BotaoProps = Nativo &
  AparenciaDoBotao & {
    /** Ícone antes do texto. */
    icone?: ReactNode;
    /** Ícone depois do texto: seta de menu, link externo. */
    iconeFinal?: ReactNode;
    /** Mostra o indicador de progresso e bloqueia novos cliques. */
    carregando?: boolean;
    desabilitado?: boolean;
    /** Ocupa a largura do contêiner. */
    larguraTotal?: boolean;
    children: ReactNode;
  };

/**
 * Botão do design system. `type` é `button` por padrão; use `type="submit"` no
 * botão que envia o formulário.
 */
export function Botao({
  variante,
  intencao,
  tamanho,
  icone,
  iconeFinal,
  carregando = false,
  desabilitado = false,
  larguraTotal = false,
  type = "button",
  className,
  children,
  ...nativo
}: BotaoProps) {
  return (
    <button
      {...nativo}
      type={type}
      disabled={desabilitado || carregando}
      data-botao=""
      aria-busy={carregando || undefined}
      className={estiloDoBotao({
        variante,
        intencao,
        tamanho,
        className: cn(larguraTotal && "w-full", className),
      })}
    >
      {carregando ? <Girando /> : icone}
      {children}
      {iconeFinal}
    </button>
  );
}

export type BotaoDeIconeProps = Nativo &
  AparenciaDoBotao & {
    /** Nome acessível: o que o botão faz. Vira também a dica ao passar o mouse. */
    rotulo: string;
    icone: ReactNode;
    carregando?: boolean;
    desabilitado?: boolean;
  };

/** Botão quadrado só com ícone. Sem texto visível, o `rotulo` é obrigatório. */
export function BotaoDeIcone({
  rotulo,
  icone,
  variante = "contorno",
  intencao,
  tamanho,
  carregando = false,
  desabilitado = false,
  type = "button",
  className,
  ...nativo
}: BotaoDeIconeProps) {
  return (
    <button
      {...nativo}
      type={type}
      aria-label={rotulo}
      data-botao=""
      title={rotulo}
      disabled={desabilitado || carregando}
      aria-busy={carregando || undefined}
      className={estiloDoBotao({
        variante,
        intencao,
        tamanho,
        somenteIcone: true,
        className,
      })}
    >
      {carregando ? <Girando /> : icone}
    </button>
  );
}
