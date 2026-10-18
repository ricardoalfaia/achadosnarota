import type { ReactNode } from "react";

// As linhas das listas de ajustes do perfil: altura confortável para o dedo,
// texto de 14px e o ícone num quadrado suave da marca.

export const LINHA_DE_AJUSTE =
  "flex min-h-14 w-full items-center justify-between gap-3 py-2.5 text-left text-sm font-semibold text-foreground";

/** Ícone e rótulo da linha. `tom="perigo"` para "Sair da conta". */
export function RotuloDaLinha({
  icone,
  children,
  tom = "marca",
}: {
  icone: ReactNode;
  children: ReactNode;
  tom?: "marca" | "perigo";
}) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden="true"
        className={
          tom === "perigo"
            ? "flex size-9 shrink-0 items-center justify-center rounded-xl bg-danger-subtle text-danger [&_svg]:size-[18px]"
            : "flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary [&_svg]:size-[18px]"
        }
      >
        {icone}
      </span>
      <span className="truncate">{children}</span>
    </span>
  );
}

/** Um grupo de linhas com título, num cartão. */
export function GrupoDeAjustes({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={titulo}>
      <h2 className="mb-2 px-1 text-xs font-bold tracking-[0.12em] text-foreground-muted uppercase">
        {titulo}
      </h2>
      <div className="divide-y divide-border rounded-3xl bg-surface px-4 ring-1 ring-border/60">
        {children}
      </div>
    </section>
  );
}
