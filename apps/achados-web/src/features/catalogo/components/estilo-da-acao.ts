// As classes das ações rápidas da ficha (Ligar, Como chegar, Site,
// Compartilhar), num lugar só para o compartilhar ficar igual às outras.

export const ACAO_DA_FICHA =
  "group flex flex-col items-center gap-1.5 rounded-2xl py-1 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** O círculo do ícone: grande o bastante para o polegar. */
export const CIRCULO_DA_ACAO =
  "flex size-12 items-center justify-center rounded-full bg-primary-subtle text-primary transition-transform duration-200 ease-spring group-hover:bg-primary-border group-active:scale-92 [&_svg]:size-5";

export const ROTULO_DA_ACAO = "text-xs font-semibold text-foreground";
