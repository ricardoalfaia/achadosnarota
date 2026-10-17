"use client";

import { createContext, use, useId, useState, type ReactNode } from "react";

import { cn } from "../../lib/cn";
import { IconeSeta } from "../Icones";

type Contexto = {
  abertos: readonly string[];
  alternar: (valor: string) => void;
};

const AcordeaoContext = createContext<Contexto | null>(null);

/**
 * Seções que abrem e fecham. Em `unico`, abrir uma fecha as outras; em
 * `multiplo`, cada uma é independente.
 */
export function Acordeao({
  tipo = "unico",
  abertosInicialmente = [],
  className,
  children,
}: {
  tipo?: "unico" | "multiplo";
  /** Valores dos itens que começam abertos. */
  abertosInicialmente?: readonly string[];
  className?: string;
  children: ReactNode;
}) {
  const [abertos, setAbertos] = useState(abertosInicialmente);

  function alternar(valor: string) {
    setAbertos((atuais) => {
      if (atuais.includes(valor))
        return atuais.filter((item) => item !== valor);
      return tipo === "unico" ? [valor] : [...atuais, valor];
    });
  }

  return (
    <AcordeaoContext value={{ abertos, alternar }}>
      <div
        className={cn(
          "divide-y divide-border rounded-card border border-border bg-surface",
          className
        )}
      >
        {children}
      </div>
    </AcordeaoContext>
  );
}

export function ItemDoAcordeao({
  valor,
  titulo,
  desabilitado,
  children,
}: {
  valor: string;
  titulo: ReactNode;
  desabilitado?: boolean;
  children: ReactNode;
}) {
  const acordeao = use(AcordeaoContext);
  if (!acordeao) {
    throw new Error("ItemDoAcordeao precisa estar dentro de <Acordeao>.");
  }
  const id = useId();
  const aberto = acordeao.abertos.includes(valor);

  return (
    <div className="first:rounded-t-card last:rounded-b-card">
      <h3>
        <button
          type="button"
          id={`${id}-titulo`}
          aria-expanded={aberto}
          aria-controls={`${id}-conteudo`}
          disabled={desabilitado}
          onClick={() => acordeao.alternar(valor)}
          className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-[inherit] px-5 py-3.5 text-left text-lg font-bold text-foreground transition-colors duration-200 ease-smooth outline-none hover:text-primary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {titulo}
          <IconeSeta
            aberto={aberto}
            className="text-foreground-muted duration-300 ease-smooth"
          />
        </button>
      </h3>
      {/* A altura anima pela linha da grade, de 0fr a 1fr; fechado, o conteúdo fica inerte. */}
      <div
        id={`${id}-conteudo`}
        role="region"
        aria-labelledby={`${id}-titulo`}
        inert={!aberto}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-smooth",
          aberto ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-4 text-foreground-muted">{children}</div>
        </div>
      </div>
    </div>
  );
}
