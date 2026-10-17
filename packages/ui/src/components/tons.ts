// Os tons dos cartões do painel, compartilhados por CartaoDeIndicador,
// CartaoDeAcao e CartaoDeModelo. Cada tom mapeia para classes completas, para o
// Tailwind detectá-las no build.

/** `primario` azul, `sucesso` verde água, `destaque` roxo, `aviso` âmbar. */
export type TomDoCartao = "primario" | "sucesso" | "destaque" | "aviso";

/** Ícone em quadrado suave: fundo e cor do traço. */
export const ICONE_DO_TOM: Record<TomDoCartao, string> = {
  primario: "bg-primary-subtle text-primary",
  sucesso: "bg-accent-subtle text-accent",
  destaque: "bg-highlight-subtle text-highlight",
  aviso: "bg-warning-subtle text-warning",
};

/** Só a cor do ícone, para cartões que já têm o fundo do tom. */
export const COR_DO_TOM: Record<TomDoCartao, string> = {
  primario: "text-primary",
  sucesso: "text-accent",
  destaque: "text-highlight",
  aviso: "text-warning",
};

/** Fundo suave do cartão inteiro: o tom em cima, a superfície embaixo. */
export const FUNDO_DO_TOM: Record<TomDoCartao, string> = {
  primario: "border-info-border/40 from-primary-subtle",
  sucesso: "border-accent-border/40 from-accent-subtle",
  destaque: "border-highlight-border/40 from-highlight-subtle",
  aviso: "border-warning-border/40 from-warning-subtle",
};
