import { useId, type ReactNode } from "react";

import { cn } from "../../lib/cn";

/**
 * O banner de boas-vindas do painel: saudação pequena, título grande, descrição
 * e ações à esquerda; ilustração à direita, escondida em telas estreitas. O
 * fundo é a superfície com um degradê leve das cores da marca. Para o trecho do
 * título em degradê, use `<span className="text-brand-gradient">`.
 */
export function Destaque({
  saudacao,
  titulo,
  descricao,
  acoes,
  ilustracao,
  nivelDoTitulo = "h2",
  className,
}: {
  /** "Olá, Marina 👋". */
  saudacao?: ReactNode;
  titulo: ReactNode;
  descricao?: ReactNode;
  /** Botões ou links: a ação principal primeiro. */
  acoes?: ReactNode;
  /** Decorativa: fica fora da árvore de acessibilidade. */
  ilustracao?: ReactNode;
  /** Padrão: `h2`. `h1` quando o banner é o título da página. */
  nivelDoTitulo?: "h1" | "h2";
  className?: string;
}) {
  const idDoTitulo = useId();
  const Titulo = nivelDoTitulo;
  return (
    <section
      aria-labelledby={idDoTitulo}
      className={cn(
        "relative isolate flex items-center gap-8 overflow-hidden rounded-overlay border border-border bg-surface p-8 text-foreground max-md:p-6",
        className
      )}
    >
      {/* Degradê leve: azul no canto de cima, roxo e verde água no de baixo. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_15%,var(--ar-primary-subtle),transparent_55%),radial-gradient(circle_at_100%_100%,var(--ar-highlight-subtle),transparent_50%),radial-gradient(circle_at_0%_100%,var(--ar-accent-subtle),transparent_45%)]"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {saudacao && (
          <p className="text-lg font-medium text-foreground-muted">
            {saudacao}
          </p>
        )}
        <Titulo
          id={idDoTitulo}
          className="text-4xl leading-tight font-bold tracking-tight text-balance"
        >
          {titulo}
        </Titulo>
        {descricao && (
          <p className="max-w-xl text-lg text-foreground-muted">{descricao}</p>
        )}
        {acoes && <div className="mt-3 flex flex-wrap gap-3">{acoes}</div>}
      </div>
      {ilustracao && (
        <div
          aria-hidden="true"
          className="flex shrink-0 items-center justify-center max-md:hidden"
        >
          {ilustracao}
        </div>
      )}
    </section>
  );
}
