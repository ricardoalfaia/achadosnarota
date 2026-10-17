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
      <h2 className="text-4xl font-extrabold tracking-tight text-foreground">
        {titulo}
      </h2>
      <p className="mt-2 text-lg leading-snug text-foreground-muted">
        {children}
      </p>
    </header>
  );
}
