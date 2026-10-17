"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { FileUp } from "lucide-react";

import { cn } from "../../lib/cn";
import { estiloDoBotao } from "../Botao";
import { validarArquivos, type RecusaDeArquivo } from "./validacao";

/**
 * Área para soltar ou escolher arquivos (o PDF assinado, no produto). O teclado
 * usa o botão, que abre o seletor do sistema por um `<input type="file">`
 * escondido; arrastar e soltar é atalho para o mouse. A triagem de tipo,
 * tamanho e quantidade é `validarArquivos`: os aceitos vão para `aoEscolher`, os
 * recusados para `aoRecusar`, e a mensagem de erro vem de quem usa, em `erro`.
 * É conforto de interface: o servidor revalida o arquivo (MIME real, tamanho,
 * varredura) antes de aceitá-lo.
 */
export function ZonaDeArquivo({
  rotulo,
  descricao,
  aceitar,
  tamanhoMaximoEmBytes,
  multiplo = false,
  desabilitado = false,
  erro,
  textoDoBotao = multiplo ? "Escolher arquivos" : "Escolher arquivo",
  aoEscolher,
  aoRecusar,
  className,
}: {
  /** Título da área ("Envie o contrato assinado"). Nomeia também o botão. */
  rotulo: string;
  /** "PDF de até 10 MB". */
  descricao?: string;
  /** MIME ("application/pdf"), família ("image/*") ou extensão (".pdf"). */
  aceitar?: readonly string[];
  tamanhoMaximoEmBytes?: number;
  multiplo?: boolean;
  desabilitado?: boolean;
  /** Mensagem de validação; marca a área como inválida. */
  erro?: string;
  /** Texto do botão; para traduzir. */
  textoDoBotao?: string;
  aoEscolher: (arquivos: File[]) => void;
  aoRecusar?: (recusas: RecusaDeArquivo[]) => void;
  className?: string;
}) {
  const id = useId();
  const entrada = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);

  function receber(lista: FileList | null) {
    const arquivos = Array.from(lista ?? []);
    if (arquivos.length === 0) return;
    const { aceitos, recusas } = validarArquivos(arquivos, {
      aceitar,
      tamanhoMaximoEmBytes,
      multiplo,
    });
    const escolhidos = aceitos.flatMap((i) => arquivos[i] ?? []);
    if (escolhidos.length > 0) aoEscolher(escolhidos);
    if (recusas.length > 0) aoRecusar?.(recusas);
  }

  function aoArrastarPorCima(evento: DragEvent<HTMLDivElement>) {
    // Sem preventDefault o navegador abre o arquivo em vez de soltá-lo aqui.
    evento.preventDefault();
    evento.dataTransfer.dropEffect = desabilitado ? "none" : "copy";
    if (!desabilitado) setArrastando(true);
  }

  function aoSair(evento: DragEvent<HTMLDivElement>) {
    // Passar por cima de um filho também dispara dragleave no contêiner.
    if (!evento.currentTarget.contains(evento.relatedTarget as Node | null))
      setArrastando(false);
  }

  function aoSoltar(evento: DragEvent<HTMLDivElement>) {
    evento.preventDefault();
    setArrastando(false);
    if (!desabilitado) receber(evento.dataTransfer.files);
  }

  const idDoRotulo = `${id}-rotulo`;
  const idDaDescricao = descricao ? `${id}-descricao` : undefined;
  const idDoErro = erro ? `${id}-erro` : undefined;

  return (
    <div className={className}>
      <div
        role="group"
        aria-labelledby={idDoRotulo}
        aria-disabled={desabilitado || undefined}
        data-arrastando={arrastando || undefined}
        onDragEnter={aoArrastarPorCima}
        onDragOver={aoArrastarPorCima}
        onDragLeave={aoSair}
        onDrop={aoSoltar}
        className={cn(
          "flex flex-col items-center gap-2 rounded-card border-2 border-dashed border-border-strong bg-surface px-6 py-8 text-center text-foreground transition-[border-color,background-color] duration-200 ease-smooth",
          arrastando && "border-primary bg-primary-subtle",
          erro && "border-danger-border bg-danger-subtle/40",
          desabilitado && "cursor-not-allowed opacity-60"
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "mb-1 flex size-12 items-center justify-center rounded-full bg-primary-subtle text-primary [&_svg]:size-6",
            erro && "bg-danger-subtle text-danger"
          )}
        >
          <FileUp strokeWidth={1.75} />
        </span>
        <p id={idDoRotulo} className="text-lg font-semibold">
          {rotulo}
        </p>
        {descricao && (
          <p id={idDaDescricao} className="text-sm text-foreground-muted">
            {descricao}
          </p>
        )}
        <button
          type="button"
          disabled={desabilitado}
          onClick={() => entrada.current?.click()}
          // O nome começa pelo texto visível e diz para qual área é o botão.
          aria-label={`${textoDoBotao}: ${rotulo}`}
          aria-describedby={
            [idDaDescricao, idDoErro].filter(Boolean).join(" ") || undefined
          }
          className={estiloDoBotao({ variante: "contorno", className: "mt-2" })}
        >
          {textoDoBotao}
        </button>
        <input
          ref={entrada}
          type="file"
          hidden
          tabIndex={-1}
          accept={aceitar?.join(",")}
          multiple={multiplo}
          disabled={desabilitado}
          onChange={(evento) => {
            receber(evento.target.files);
            // Limpa para a mesma escolha disparar de novo depois de uma recusa.
            evento.target.value = "";
          }}
        />
      </div>
      {erro && (
        <p
          id={idDoErro}
          role="alert"
          className="mt-1 text-xs font-medium text-danger"
        >
          {erro}
        </p>
      )}
    </div>
  );
}
