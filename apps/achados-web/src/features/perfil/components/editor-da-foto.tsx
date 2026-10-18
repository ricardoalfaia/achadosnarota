"use client";

import { Alerta, Botao } from "@achados/ui";
import { ImageUp, Minus, Move, Plus } from "lucide-react";

import { ZOOM } from "../domain/enquadramento";
import { useAjusteDaFoto } from "../hooks/use-ajuste-da-foto";

/**
 * A área de ajuste: a foto atrás de um círculo do tamanho do avatar, para
 * arrastar e aproximar até encaixar. Fora do círculo a foto fica escurecida,
 * mostrando o que sobra. Gera o quadrado final só ao salvar.
 */
export function EditorDaFoto({
  arquivo,
  aoSalvar,
  aoTrocarArquivo,
  salvando,
}: {
  arquivo: File;
  aoSalvar: (foto: Blob) => void;
  aoTrocarArquivo: () => void;
  salvando: boolean;
}) {
  const {
    refDaArea,
    pronta,
    falhou,
    src,
    exibicao,
    zoom,
    zoomPara,
    eventos,
    gerarFoto,
  } = useAjusteDaFoto(arquivo);

  const salvar = async () => {
    const foto = await gerarFoto();
    if (foto) aoSalvar(foto);
  };

  if (falhou)
    return (
      <div className="flex flex-col gap-4">
        <Alerta intencao="erro">
          Este navegador não conseguiu abrir a foto. Tente outra, em JPG, PNG ou
          WebP.
        </Alerta>
        <Botao
          variante="contorno"
          icone={<ImageUp />}
          onClick={aoTrocarArquivo}
        >
          Escolher outra foto
        </Botao>
      </div>
    );

  return (
    <div className="flex flex-col gap-5">
      <div
        ref={refDaArea}
        tabIndex={0}
        role="group"
        aria-label="Ajuste da foto. Arraste ou use as setas para posicionar; + e - mudam o zoom."
        {...eventos}
        className="relative mx-auto aspect-square w-full max-w-[300px] cursor-grab touch-none overflow-hidden rounded-3xl bg-passport outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring active:cursor-grabbing"
      >
        {src && exibicao && (
          // eslint-disable-next-line @next/next/no-img-element -- arquivo local (blob:), fora do otimizador
          <img
            src={src}
            alt=""
            draggable={false}
            className="pointer-events-none absolute top-1/2 left-1/2 max-w-none"
            style={{
              width: exibicao.largura,
              height: exibicao.altura,
              transform: `translate(calc(-50% + ${exibicao.x}px), calc(-50% + ${exibicao.y}px))`,
            }}
          />
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_999px_rgb(6_19_30/0.6)] ring-2 ring-white/90"
        />
        {!pronta && (
          <div className="absolute inset-0 animate-pulse bg-surface-hover" />
        )}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold whitespace-nowrap text-white backdrop-blur"
        >
          <Move className="size-3.5" />
          Arraste para posicionar
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Afastar"
          onClick={() => zoomPara(zoom / 1.2)}
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-foreground-muted hover:bg-surface-hover"
        >
          <Minus className="size-4" />
        </button>
        <input
          type="range"
          aria-label="Zoom"
          min={ZOOM.minimo}
          max={ZOOM.maximo}
          step={ZOOM.passo}
          value={zoom}
          disabled={!pronta}
          onChange={(evento) => zoomPara(Number(evento.target.value))}
          className="h-1.5 w-full cursor-pointer accent-primary"
        />
        <button
          type="button"
          aria-label="Aproximar"
          onClick={() => zoomPara(zoom * 1.2)}
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-foreground-muted hover:bg-surface-hover"
        >
          <Plus className="size-4" />
        </button>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Botao
          variante="fantasma"
          onClick={aoTrocarArquivo}
          desabilitado={salvando}
        >
          Escolher outra
        </Botao>
        <Botao onClick={salvar} carregando={salvando} desabilitado={!pronta}>
          Salvar foto
        </Botao>
      </div>
    </div>
  );
}
