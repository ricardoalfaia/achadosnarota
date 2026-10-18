"use client";

import { useId } from "react";
import { useFormStatus } from "react-dom";

import { useValorControlavel } from "../../hooks/use-valor-controlavel";
import { cn } from "../../lib/cn";
import { idDaMensagem, MensagemDoCampo } from "../CaixaDoCampo";
import type { PropsDeCampo } from "../tipos";

export type AreaDeTextoProps = Omit<
  PropsDeCampo,
  "lado" | "tamanho" | "aoSair"
> & {
  /** Modo controlado. Sem ele, o estado é interno e começa em `valorInicial`. */
  valor?: string;
  valorInicial?: string;
  aoMudar?: (valor: string) => void;
  placeholder?: string;
  /** Linhas visíveis antes de rolar. Padrão: 4. A pessoa pode aumentar. */
  linhas?: number;
  /** Mostra o contador "120/200" e impede passar do limite. */
  tamanhoMaximo?: number;
  somenteLeitura?: boolean;
};

/**
 * Texto de várias linhas (resumo, termos, parecer), na mesma moldura dos
 * campos: o label fica sempre no topo da caixa, porque o texto longo não tem
 * onde flutuar. Com `tamanhoMaximo`, o contador ajuda a caber no cartão.
 */
export function AreaDeTexto({
  label,
  id,
  name,
  erro,
  ajuda,
  desabilitado,
  required,
  className,
  valor,
  valorInicial = "",
  aoMudar,
  placeholder,
  linhas = 4,
  tamanhoMaximo,
  somenteLeitura,
}: AreaDeTextoProps) {
  const [texto, mudar] = useValorControlavel(valor, valorInicial, aoMudar);
  const { pending } = useFormStatus();
  const idGerado = useId();
  const idDoCampo = id ?? idGerado;
  const bloqueado = desabilitado || pending;

  return (
    <div className={cn("relative", className)}>
      <label
        htmlFor={idDoCampo}
        className={cn(
          "flex w-full cursor-text flex-col gap-1 rounded-control border border-border-strong bg-surface px-3 pt-2 pb-2.5 text-foreground-muted transition-colors hover:border-foreground-subtle",
          "focus-within:border-primary focus-within:ring-1 focus-within:ring-ring focus-within:hover:border-primary",
          erro && "border-danger ring-danger hover:border-danger",
          bloqueado && "cursor-not-allowed bg-surface-hover opacity-60"
        )}
      >
        <span className="flex items-center justify-between gap-2 text-xs font-medium">
          <span className={cn("truncate", erro && "text-danger")}>{label}</span>
          {tamanhoMaximo !== undefined && (
            <span
              aria-hidden="true"
              className={cn(
                "shrink-0 font-mono tabular-nums",
                texto.length >= tamanhoMaximo && "text-warning"
              )}
            >
              {texto.length}/{tamanhoMaximo}
            </span>
          )}
        </span>
        <textarea
          id={idDoCampo}
          name={name}
          rows={linhas}
          value={texto}
          onChange={(evento) => mudar(evento.target.value)}
          placeholder={placeholder}
          maxLength={tamanhoMaximo}
          readOnly={somenteLeitura}
          disabled={bloqueado}
          required={required}
          aria-invalid={erro ? true : undefined}
          aria-describedby={idDaMensagem(idDoCampo, erro, ajuda)}
          className="w-full resize-y bg-transparent text-base leading-relaxed text-foreground outline-none placeholder:text-foreground-subtle disabled:cursor-not-allowed"
        />
      </label>
      <MensagemDoCampo id={`${idDoCampo}-mensagem`} erro={erro} ajuda={ajuda} />
    </div>
  );
}
