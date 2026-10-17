import { cn } from "../../lib/cn";

// A aparência do botão como função pura, sem React. Fica separada do componente
// para poder ser usada também em Server Components (`@achados/ui/estilos`): o
// ponto de entrada principal do pacote é cliente, e uma função dele não pode ser
// chamada no servidor.

/**
 * `solido`: a ação principal da tela ou do cartão (Resgatar, Assinar), uma por
 * contexto: laranja da marca com texto branco.
 * `contorno`: ações secundárias (exportar, filtrar, voltar).
 * `suave`: ação neutra sobre a superfície, sem borda (sino, voltar no topo).
 * `flutuante`: sobre foto ou mídia, branco translúcido com sombra (voltar,
 * compartilhar e favoritar sobre a foto do lugar).
 * `fantasma`: ações de apoio que não devem competir (cancelar, limpar).
 */
export type VarianteDoBotao =
  "solido" | "contorno" | "suave" | "flutuante" | "fantasma";

/** `perigo` para ações destrutivas: excluir, inativar, encerrar. */
export type IntencaoDoBotao = "padrao" | "perigo";

/** `xs` 32px, `sm` 40px (padrão), `md` 44px, `lg` 52px: os tokens `control-*`. */
export type TamanhoDoBotao = "xs" | "sm" | "md" | "lg";

export type AparenciaDoBotao = {
  variante?: VarianteDoBotao;
  intencao?: IntencaoDoBotao;
  tamanho?: TamanhoDoBotao;
};

const BASE =
  "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border font-bold whitespace-nowrap transition-[color,background-color,border-color,box-shadow,translate] duration-200 ease-smooth outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50";

/** Ícones dentro do botão acompanham o tamanho do texto. */
const ICONE = "[&_svg]:size-[1.25em] [&_svg]:shrink-0";

const APARENCIA: Record<VarianteDoBotao, Record<IntencaoDoBotao, string>> = {
  solido: {
    padrao:
      "border-primary-solid-border bg-linear-135 from-primary-solid-start to-primary-solid-end text-primary-solid-foreground shadow-glow hover:-translate-y-px hover:from-primary-solid-start-hover hover:to-primary-solid-hover hover:shadow-glow-strong active:translate-y-0",
    perigo:
      "border-danger-solid-border bg-danger-solid text-danger-solid-foreground hover:-translate-y-px hover:bg-danger-solid-hover active:translate-y-0",
  },
  contorno: {
    padrao:
      "border-border-strong bg-surface text-foreground hover:border-foreground-subtle hover:bg-surface-hover",
    perigo:
      "border-danger-border bg-surface text-danger hover:bg-danger-subtle",
  },
  suave: {
    padrao:
      "border-transparent bg-surface-hover text-foreground hover:bg-border-strong",
    perigo: "border-transparent bg-danger-subtle text-danger",
  },
  flutuante: {
    padrao:
      "border-transparent bg-white/90 text-foreground shadow-md backdrop-blur-sm hover:bg-white active:scale-95 dark:bg-surface/90",
    perigo:
      "border-transparent bg-white/90 text-danger shadow-md backdrop-blur-sm hover:bg-white active:scale-95",
  },
  fantasma: {
    padrao:
      "border-transparent text-foreground-muted hover:bg-surface-hover hover:text-foreground",
    perigo: "border-transparent text-danger hover:bg-danger-subtle",
  },
};

const TAMANHO: Record<TamanhoDoBotao, string> = {
  xs: "h-control-xs gap-1.5 px-3.5 text-xs",
  sm: "h-control-sm gap-2 px-4 text-sm",
  md: "h-control-md gap-2 px-5 text-sm",
  lg: "h-control-lg gap-2.5 px-6 text-base",
};

/** Botão só com ícone: redondo, com o lado igual à altura do tamanho. */
const QUADRADO: Record<TamanhoDoBotao, string> = {
  xs: "size-control-xs",
  sm: "size-control-sm",
  md: "size-control-md",
  lg: "size-control-lg",
};

/**
 * As classes do botão, para dar a mesma aparência a um link:
 * `<Link className={estiloDoBotao({ variante: "contorno" })}>`.
 */
export function estiloDoBotao({
  variante = "solido",
  intencao = "padrao",
  tamanho = "sm",
  somenteIcone = false,
  className,
}: AparenciaDoBotao & {
  somenteIcone?: boolean;
  className?: string;
} = {}): string {
  return cn(
    BASE,
    ICONE,
    APARENCIA[variante][intencao],
    somenteIcone ? QUADRADO[tamanho] : TAMANHO[tamanho],
    className
  );
}
