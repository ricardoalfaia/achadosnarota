/** De que lado do campo a caixa suspensa abre. */
export type Lado = "baixo" | "cima";

/**
 * Altura do campo: `sm` 36px, `md` 44px, `lg` 56px (tokens `control-*`).
 * Em `sm` e `md` o label flutua sobre a borda; em `lg`, dentro da caixa.
 */
export type Tamanho = "sm" | "md" | "lg";

/** Props comuns dos campos do design system. */
export type PropsDeCampo = {
  label: string;
  /** Gerado com `useId` quando ausente. */
  id?: string;
  /** Nome no `FormData` do `<form action>`. */
  name?: string;
  /** Mensagem de validação (do react-hook-form ou do `errosPorCampo`). Marca o campo como inválido. */
  erro?: string;
  ajuda?: string;
  desabilitado?: boolean;
  /** Padrão: `lg`. */
  tamanho?: Tamanho;
  required?: boolean;
  /** `onBlur` do `Controller`, para o react-hook-form saber que o campo foi tocado. */
  aoSair?: () => void;
  lado?: Lado;
  className?: string;
};
