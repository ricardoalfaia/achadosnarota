import type { ReactNode } from "react";

import { cn } from "../../lib/cn";
import type { Tamanho } from "../tipos";

const ALTURA: Record<Tamanho, string> = {
  sm: "h-control-sm px-2.5",
  md: "h-control-md px-3",
  lg: "h-control-lg px-3",
};

/** Tamanho do texto do valor; o controle em `children` usa o mesmo. */
export const TEXTO_DO_CAMPO: Record<Tamanho, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

/**
 * A moldura comum dos campos: borda, label flutuante e ícone à direita. É um
 * `<label htmlFor>`: clicar em qualquer ponto dela aciona o controle de `id`.
 * O controle (input ou botão) vem em `children`.
 *
 * Em `lg` o label flutua dentro da caixa, acima do valor. Em `sm` e `md` não há
 * altura para as duas linhas: o label flutua sobre a borda superior.
 */
export function CaixaDoCampo({
  id,
  label,
  tamanho = "lg",
  flutuando,
  ativo,
  invalido,
  desabilitado,
  prefixo,
  icone,
  children,
}: {
  id: string;
  label: string;
  tamanho?: Tamanho;
  /** Label pequeno no topo (há valor ou foco); sem isso, ocupa o lugar do valor. */
  flutuando: boolean;
  ativo: boolean;
  invalido: boolean;
  desabilitado?: boolean;
  /** Antes do valor: unidade ("R$") ou ícone. */
  prefixo?: ReactNode;
  /** Depois do valor: seta, ícone, unidade ("%") ou botão. */
  icone?: ReactNode;
  children: ReactNode;
}) {
  const naBorda = flutuando && tamanho !== "lg";

  return (
    <label
      htmlFor={id}
      className={cn(
        "relative flex w-full cursor-pointer items-center gap-2 rounded-control border border-border-strong bg-surface text-foreground-muted transition-colors hover:border-foreground-subtle",
        ALTURA[tamanho],
        "has-[:focus-visible]:border-primary has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-ring",
        ativo && "border-primary ring-1 ring-ring hover:border-primary",
        invalido && "border-danger ring-danger hover:border-danger",
        desabilitado && "cursor-not-allowed bg-surface-hover opacity-60"
      )}
    >
      {prefixo}
      <span className="flex min-w-0 flex-1 flex-col justify-center bg-inherit">
        <span
          id={`${id}-rotulo`}
          className={cn(
            "truncate transition-all",
            flutuando ? "text-xs font-medium" : TEXTO_DO_CAMPO[tamanho],
            naBorda &&
              "absolute -top-2 left-2 max-w-[calc(100%-1rem)] rounded-sm bg-inherit px-1 leading-4",
            ativo && "text-primary",
            invalido && "text-danger"
          )}
        >
          {label}
        </span>
        {children}
      </span>
      {icone}
    </label>
  );
}

/** Ajuda ou erro abaixo do campo; o `id` vai no `aria-describedby` do controle. */
export function MensagemDoCampo({
  id,
  erro,
  ajuda,
}: {
  id: string;
  erro?: string;
  ajuda?: string;
}) {
  if (erro) {
    return (
      <p id={id} role="alert" className="mt-1 text-xs font-medium text-danger">
        {erro}
      </p>
    );
  }
  return ajuda ? (
    <p id={id} className="mt-1 text-xs text-foreground-muted">
      {ajuda}
    </p>
  ) : null;
}

/** `aria-describedby` só quando há mensagem para descrever. */
export function idDaMensagem(
  id: string,
  erro?: string,
  ajuda?: string
): string | undefined {
  return erro || ajuda ? `${id}-mensagem` : undefined;
}
