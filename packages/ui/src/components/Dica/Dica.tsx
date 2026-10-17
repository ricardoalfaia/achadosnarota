"use client";

import {
  cloneElement,
  useEffect,
  useId,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

import { usePresenca } from "../../hooks/use-presenca";
import { cn } from "../../lib/cn";

export type LadoDaDica = "cima" | "baixo" | "esquerda" | "direita";

const POSICAO: Record<LadoDaDica, string> = {
  cima: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  baixo: "top-full left-1/2 mt-2 -translate-x-1/2",
  esquerda: "top-1/2 right-full mr-2 -translate-y-1/2",
  direita: "top-1/2 left-full ml-2 -translate-y-1/2",
};

/** Espera antes de mostrar, para a dica não piscar quando o mouse só passa por cima. */
const ESPERA = 400;

/**
 * Texto curto que explica um controle, ao passar o mouse ou ao focar pelo
 * teclado; Esc esconde. Complementa o nome do controle, não o substitui: um
 * botão só com ícone continua precisando do `rotulo`.
 */
export function Dica({
  texto,
  lado = "cima",
  children,
}: {
  texto: ReactNode;
  lado?: LadoDaDica;
  /** O controle explicado. Precisa aceitar `aria-describedby`. */
  children: ReactElement<{ "aria-describedby"?: string }>;
}) {
  const [visivel, setVisivel] = useState(false);
  const [comMouse, setComMouse] = useState(false);
  const presenca = usePresenca(visivel);
  const id = useId();

  // O mouse espera; o teclado mostra na hora.
  useEffect(() => {
    if (!comMouse) return;
    const espera = setTimeout(() => setVisivel(true), ESPERA);
    return () => clearTimeout(espera);
  }, [comMouse]);

  function esconder() {
    setComMouse(false);
    setVisivel(false);
  }

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setComMouse(true)}
      onMouseLeave={esconder}
      onFocus={() => setVisivel(true)}
      onBlur={esconder}
      onKeyDown={(evento) => evento.key === "Escape" && esconder()}
    >
      {cloneElement(children, {
        "aria-describedby": presenca.montado ? id : undefined,
      })}
      {presenca.montado && (
        <span
          role="tooltip"
          id={id}
          className={cn(
            "pointer-events-none absolute z-50 w-max max-w-64 rounded-md bg-foreground px-2.5 py-1.5 text-sm font-semibold text-surface shadow-md",
            POSICAO[lado],
            presenca.saindo ? "animate-fade-out" : "animate-fade-in"
          )}
        >
          {texto}
        </span>
      )}
    </span>
  );
}
