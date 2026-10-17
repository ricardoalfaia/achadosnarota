"use client";

import type { ReactNode } from "react";

import { cn } from "../../lib/cn";
import { Botao } from "../Botao";

// As partes do formulário de cadastro do protótipo: a barra de cima com o
// "Voltar para a Listagem" e o título do registro, o corpo que rola (com as
// Abas na variante `formulario`) e o rodapé fixo com a dica e as ações.

/** A barra de cima: voltar, título do registro e o que mais couber à direita. */
export function BarraDoFormulario({
  aoVoltar,
  rotuloDeVoltar = "Voltar para a Listagem",
  titulo,
  className,
  children,
}: {
  aoVoltar: () => void;
  rotuloDeVoltar?: string;
  /** "Editando documento: Procuração (Cód. 04291)". */
  titulo: ReactNode;
  className?: string;
  /** À direita do título: um estado, um interruptor. */
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b border-border bg-surface px-6 py-3.5",
        className
      )}
    >
      <Botao
        variante="contorno"
        tamanho="xs"
        onClick={aoVoltar}
        icone={<IconeVoltar />}
        className="h-8.5 rounded-lg bg-surface-hover px-3.5 text-[12.5px] text-primary hover:border-ring hover:bg-surface-active"
      >
        {rotuloDeVoltar}
      </Botao>
      <div className="flex min-w-0 items-center gap-3">
        <span className="truncate text-[15px] font-extrabold text-foreground">
          {titulo}
        </span>
        {children}
      </div>
    </div>
  );
}

/** O corpo do formulário: rola sozinho, entre a barra e o rodapé. */
export function CorpoDoFormulario({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto", className)}
    >
      {children}
    </div>
  );
}

/** Duas colunas de campos; `col-span-full` em um campo o deixa na largura toda. */
export function GradeDeCampos({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("grid grid-cols-2 gap-x-6 gap-y-5 px-7 py-6", className)}
    >
      {children}
    </div>
  );
}

/** O rodapé fixo: a dica à esquerda e os botões (cancelar, rascunho, salvar) à direita. */
export function RodapeDoFormulario({
  dica,
  className,
  children,
}: {
  /** "Use Ctrl + S para salvar". */
  dica?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-t border-border bg-surface px-7 py-3.5",
        className
      )}
    >
      <div className="flex items-center gap-1.5 text-[11.5px] text-foreground-muted">
        {dica && (
          <>
            <svg
              viewBox="0 0 16 16"
              aria-hidden="true"
              className="size-3.5 shrink-0 text-ring"
            >
              <circle cx="8" cy="8" r="3" fill="currentColor" />
            </svg>
            <span>{dica}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2.5">{children}</div>
    </div>
  );
}

/** Tecla ou combinação dentro de uma dica ("Ctrl + S"). */
export function Tecla({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-border-strong bg-surface-hover px-1.25 py-0.5 font-mono text-[11px]">
      {children}
    </kbd>
  );
}

function IconeVoltar() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}
