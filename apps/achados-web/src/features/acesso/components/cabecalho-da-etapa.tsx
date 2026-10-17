import type { ReactNode } from "react";

/** Título e explicação de cada etapa das telas de acesso. */
export function CabecalhoDaEtapa({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <header className="mb-2.5">
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
        {titulo}
      </h1>
      <p className="mt-1.5 text-sm leading-snug text-foreground-muted">
        {children}
      </p>
    </header>
  );
}
