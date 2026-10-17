"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

import { useValorControlavel } from "../../hooks/use-valor-controlavel";
import { cn } from "../../lib/cn";
import { idDaMensagem, MensagemDoCampo } from "../CaixaDoCampo";

export type CheckboxProps = {
  label: ReactNode;
  /** Mostra só a caixa; o `label` continua sendo o nome lido pelo leitor de tela. */
  rotuloOculto?: boolean;
  /** Linha secundária, menor, abaixo do label. */
  descricao?: string;
  /** Modo controlado. Sem ele, o estado é interno e começa em `marcadoInicial`. */
  marcado?: boolean;
  marcadoInicial?: boolean;
  aoMudar?: (marcado: boolean) => void;
  /** Traço no lugar da marca: parte dos itens de um grupo está marcada. */
  indeterminado?: boolean;
  /** Gerado com `useId` quando ausente. */
  id?: string;
  /** Nome no `FormData`; só é enviado quando marcado, como o checkbox nativo. */
  name?: string;
  /** Valor enviado no `FormData`. Padrão do navegador: `"on"`. */
  value?: string;
  /** Mensagem de validação. Marca o campo como inválido. */
  erro?: string;
  desabilitado?: boolean;
  required?: boolean;
  className?: string;
};

/**
 * Checkbox nativo com a aparência do design system: teclado, foco, formulário e
 * leitor de tela vêm do `<input type="checkbox">`. A marca é desenhada ao marcar.
 */
export function Checkbox({
  label,
  rotuloOculto = false,
  descricao,
  marcado,
  marcadoInicial = false,
  aoMudar,
  indeterminado = false,
  id,
  name,
  value,
  erro,
  desabilitado,
  required,
  className,
}: CheckboxProps) {
  const [estaMarcado, mudar] = useValorControlavel(
    marcado,
    marcadoInicial,
    aoMudar
  );
  const idGerado = useId();
  const idDoCampo = id ?? idGerado;
  const entrada = useRef<HTMLInputElement>(null);

  // `indeterminate` só existe como propriedade do DOM, não como atributo.
  useEffect(() => {
    if (entrada.current) entrada.current.indeterminate = indeterminado;
  }, [indeterminado]);

  const descricoes = [
    descricao ? `${idDoCampo}-descricao` : undefined,
    idDaMensagem(idDoCampo, erro),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("flex flex-col", className)}>
      <label
        htmlFor={idDoCampo}
        className="inline-flex cursor-pointer items-start gap-2.5 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
      >
        <span className="relative mt-px flex size-[1.125rem] shrink-0">
          <input
            ref={entrada}
            id={idDoCampo}
            type="checkbox"
            name={name}
            value={value}
            checked={estaMarcado}
            onChange={(evento) => mudar(evento.target.checked)}
            disabled={desabilitado}
            required={required}
            aria-invalid={erro ? true : undefined}
            aria-describedby={descricoes || undefined}
            className={cn(
              "peer size-full cursor-pointer appearance-none rounded-[5px] border border-border-strong bg-surface transition-colors duration-150 ease-smooth outline-none",
              "hover:border-primary focus-visible:ring-2 focus-visible:ring-ring",
              "checked:border-primary-solid-border checked:bg-primary-solid indeterminate:border-primary-solid-border indeterminate:bg-primary-solid",
              "disabled:cursor-not-allowed aria-invalid:border-danger"
            )}
          />
          <svg
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 m-auto size-3 text-primary-solid-foreground peer-checked:[--marca:0] peer-indeterminate:[--marca:1] peer-indeterminate:[--traco:1]"
          >
            <path
              d="M2.5 6.2 5 8.6 9.5 3.6"
              pathLength={1}
              className="transition-[stroke-dashoffset] duration-200 ease-smooth"
              style={{
                strokeDasharray: 1,
                strokeDashoffset: "var(--marca, 1)",
              }}
            />
            <path
              d="M3 6h6"
              className="transition-opacity duration-150"
              style={{ opacity: "var(--traco, 0)" }}
            />
          </svg>
        </span>
        <span
          className={cn("flex min-w-0 flex-col", rotuloOculto && "sr-only")}
        >
          <span className="font-semibold text-foreground">{label}</span>
          {descricao && (
            <span
              id={`${idDoCampo}-descricao`}
              className="text-sm text-foreground-muted"
            >
              {descricao}
            </span>
          )}
        </span>
      </label>
      <MensagemDoCampo id={`${idDoCampo}-mensagem`} erro={erro} />
    </div>
  );
}
