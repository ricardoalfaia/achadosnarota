import { useId, type ReactNode } from "react";
import Link from "next/link";

/** Uma região do painel: título, o link "Ver todos" (quando há) e o conteúdo. */
export function SecaoDoPainel({
  titulo,
  verTodos,
  children,
}: {
  titulo: string;
  verTodos?: { href: string; rotulo: string; descricao: string };
  children: ReactNode;
}) {
  const id = useId();

  return (
    <section aria-labelledby={id} className="flex min-w-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <h2 id={id} className="text-lg font-bold text-foreground">
          {titulo}
        </h2>
        {verTodos && (
          <Link
            href={verTodos.href}
            aria-label={verTodos.descricao}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {verTodos.rotulo}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
