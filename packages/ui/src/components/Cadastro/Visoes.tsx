"use client";

import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

/** Qual das duas visões está na frente. */
export type Visao = "lista" | "formulario";

const VISAO =
  "absolute inset-0 flex flex-col bg-surface transition-[transform,opacity] ease-smooth [transition-duration:320ms,250ms]";

/**
 * A transição do cadastro do protótipo: a listagem desliza um pouco para a
 * esquerda e some enquanto o formulário entra pela direita; voltar inverte.
 * As duas ficam montadas, então o que foi digitado no formulário e o filtro
 * da lista continuam ao trocar; a que está atrás fica `inert`.
 */
export function Visoes({
  visao,
  lista,
  formulario,
  className,
}: {
  visao: Visao;
  lista: ReactNode;
  formulario: ReactNode;
  className?: string;
}) {
  const naLista = visao === "lista";

  return (
    <div
      className={cn("relative flex min-h-0 flex-1 overflow-hidden", className)}
    >
      <div
        inert={!naLista}
        className={cn(
          VISAO,
          "z-10",
          naLista ? "translate-x-0 opacity-100" : "-translate-x-[15%] opacity-0"
        )}
      >
        {lista}
      </div>
      <div
        inert={naLista}
        className={cn(
          VISAO,
          "z-20",
          naLista ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
        )}
      >
        {formulario}
      </div>
    </div>
  );
}
