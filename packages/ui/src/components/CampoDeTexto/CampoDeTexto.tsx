"use client";

import {
  useId,
  useState,
  type HTMLInputAutoCompleteAttribute,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";

import { useValorControlavel } from "../../hooks/use-valor-controlavel";
import { cn } from "../../lib/cn";
import {
  CaixaDoCampo,
  idDaMensagem,
  MensagemDoCampo,
  TEXTO_DO_CAMPO,
} from "../CaixaDoCampo";
import type { PropsDeCampo } from "../tipos";

export type CampoDeTextoProps = Omit<PropsDeCampo, "lado"> & {
  /** Modo controlado. Sem ele, o estado é interno e começa em `valorInicial`. */
  valor?: string;
  valorInicial?: string;
  aoMudar?: (valor: string) => void;
  tipo?: "text" | "email" | "password" | "search" | "tel" | "url";
  /** Teclado mostrado em telas de toque: `decimal` para valores, `numeric` para códigos. */
  modoDeEntrada?: "text" | "decimal" | "numeric" | "email" | "tel";
  /** Exemplo de preenchimento, visível com o campo em foco e vazio. */
  placeholder?: string;
  /** Antes do valor: unidade ("R$") ou ícone. */
  prefixo?: ReactNode;
  /** Depois do valor: unidade ("%"), ícone ou um `BotaoDeIcone`. */
  sufixo?: ReactNode;
  tamanhoMaximo?: number;
  somenteLeitura?: boolean;
  /** Recusa texto colado: a pessoa precisa digitar. Para confirmações deliberadas. */
  semColar?: boolean;
  /** Recebe o foco quando um `Dialogo` abre. */
  focoInicial?: boolean;
  autoComplete?: HTMLInputAutoCompleteAttribute;
};

/** Texto de apoio dentro do campo; ícones herdam o tamanho. */
function Afixo({ children }: { children: ReactNode }) {
  return (
    <span className="flex shrink-0 items-center font-mono text-sm text-foreground-muted [&_svg]:size-4">
      {children}
    </span>
  );
}

/**
 * Campo de texto de uma linha, na mesma moldura dos demais campos. `prefixo` e
 * `sufixo` cobrem os grupos de entrada: moeda, percentual, busca, ação no fim.
 */
export function CampoDeTexto({
  label,
  id,
  name,
  erro,
  ajuda,
  desabilitado,
  tamanho = "lg",
  required,
  aoSair,
  className,
  valor,
  valorInicial = "",
  aoMudar,
  tipo = "text",
  modoDeEntrada,
  placeholder,
  prefixo,
  sufixo,
  tamanhoMaximo,
  somenteLeitura,
  semColar,
  focoInicial,
  autoComplete = "off",
}: CampoDeTextoProps) {
  const [texto, mudar] = useValorControlavel(valor, valorInicial, aoMudar);
  const { pending } = useFormStatus();
  const idGerado = useId();
  const idDoCampo = id ?? idGerado;
  const [focado, setFocado] = useState(false);

  const bloqueado = desabilitado || pending;
  const flutuando = focado || texto !== "";

  return (
    <div className={cn("relative", className)}>
      <CaixaDoCampo
        id={idDoCampo}
        label={label}
        tamanho={tamanho}
        flutuando={flutuando}
        ativo={focado}
        invalido={Boolean(erro)}
        desabilitado={bloqueado}
        prefixo={prefixo && <Afixo>{prefixo}</Afixo>}
        icone={sufixo && <Afixo>{sufixo}</Afixo>}
      >
        <input
          id={idDoCampo}
          name={name}
          type={tipo}
          inputMode={modoDeEntrada}
          value={texto}
          onChange={(evento) => mudar(evento.target.value)}
          onFocus={() => setFocado(true)}
          onBlur={() => {
            setFocado(false);
            aoSair?.();
          }}
          placeholder={placeholder}
          maxLength={tamanhoMaximo}
          readOnly={somenteLeitura}
          onPaste={semColar ? (evento) => evento.preventDefault() : undefined}
          onDrop={semColar ? (evento) => evento.preventDefault() : undefined}
          data-foco-inicial={focoInicial ? "" : undefined}
          disabled={bloqueado}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={erro ? true : undefined}
          aria-describedby={idDaMensagem(idDoCampo, erro, ajuda)}
          className={cn(
            "w-full bg-transparent text-foreground outline-none placeholder:text-foreground-subtle disabled:cursor-not-allowed",
            TEXTO_DO_CAMPO[tamanho],
            !flutuando && "sr-only"
          )}
        />
      </CaixaDoCampo>
      <MensagemDoCampo id={`${idDoCampo}-mensagem`} erro={erro} ajuda={ajuda} />
    </div>
  );
}
