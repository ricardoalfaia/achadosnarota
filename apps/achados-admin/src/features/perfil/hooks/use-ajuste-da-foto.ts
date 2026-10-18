"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import {
  arrastado,
  comZoom,
  ENQUADRAMENTO_INICIAL,
  escalaNaTela,
  recorte,
  type Enquadramento,
  type Medidas,
  type Ponto,
} from "../domain/enquadramento";
import { FOTO } from "../domain/foto";

/** Passo das setas do teclado, em pixels da tela. */
const PASSO_DO_TECLADO = 12;

type Carregada = { imagem: HTMLImageElement; medidas: Medidas; src: string };

function distancia(a: Ponto, b: Ponto): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * O ajuste da foto antes do envio: arrastar (mouse ou dedo), pinça com dois
 * dedos, roda do mouse, setas e +/- no teclado e o controle de zoom. As
 * contas ficam em `domain/enquadramento`; aqui só os eventos e o canvas que
 * gera o quadrado final.
 */
export function useAjusteDaFoto(arquivo: File) {
  const [area, setArea] = useState<HTMLDivElement | null>(null);
  const [lado, setLado] = useState(0);
  const [foto, setFoto] = useState<Carregada>();
  const [falhou, setFalhou] = useState(false);
  const [enquadramento, setEnquadramento] = useState<Enquadramento>(
    ENQUADRAMENTO_INICIAL
  );
  const ponteiros = useRef(new Map<number, Ponto>());

  // Abre o arquivo escolhido. O navegador aplica a orientação da câmera.
  // Uma carga antiga (outro arquivo, ou a remontagem do modo estrito, que
  // revoga a URL) não mexe no estado.
  useEffect(() => {
    let atual = true;
    const src = URL.createObjectURL(arquivo);
    const imagem = new Image();
    imagem.onload = () => {
      if (!atual) return;
      setFalhou(false);
      setFoto({
        imagem,
        src,
        medidas: { largura: imagem.naturalWidth, altura: imagem.naturalHeight },
      });
      setEnquadramento(ENQUADRAMENTO_INICIAL);
    };
    imagem.onerror = () => {
      if (atual) setFalhou(true);
    };
    imagem.src = src;
    return () => {
      atual = false;
      URL.revokeObjectURL(src);
    };
  }, [arquivo]);

  // O lado do círculo acompanha a largura da área (cabe em telas de 320px).
  useEffect(() => {
    if (!area) return;
    const observador = new ResizeObserver(([entrada]) => {
      if (entrada) setLado(Math.round(entrada.contentRect.width));
    });
    observador.observe(area);
    return () => observador.disconnect();
  }, [area]);

  const relativoAoCentro = useCallback(
    (cliente: Ponto): Ponto => {
      const caixa = area?.getBoundingClientRect();
      if (!caixa) return { x: 0, y: 0 };
      return {
        x: cliente.x - caixa.left - caixa.width / 2,
        y: cliente.y - caixa.top - caixa.height / 2,
      };
    },
    [area]
  );

  const zoomPara = useCallback(
    (zoom: number, foco?: Ponto) => {
      if (!foto || !lado) return;
      setEnquadramento((atual) =>
        comZoom(foto.medidas, lado, atual, zoom, foco)
      );
    },
    [foto, lado]
  );

  // A roda do mouse aproxima pelo cursor. Precisa de ouvinte não passivo
  // para impedir que a página role junto.
  useEffect(() => {
    if (!area || !foto || !lado) return;
    const aoRolar = (evento: WheelEvent) => {
      evento.preventDefault();
      const foco = relativoAoCentro({ x: evento.clientX, y: evento.clientY });
      setEnquadramento((atual) =>
        comZoom(
          foto.medidas,
          lado,
          atual,
          atual.zoom * Math.exp(-evento.deltaY / 400),
          foco
        )
      );
    };
    area.addEventListener("wheel", aoRolar, { passive: false });
    return () => area.removeEventListener("wheel", aoRolar);
  }, [area, foto, lado, relativoAoCentro]);

  const aoPressionar = (evento: PointerEvent<HTMLDivElement>) => {
    evento.currentTarget.setPointerCapture(evento.pointerId);
    ponteiros.current.set(evento.pointerId, {
      x: evento.clientX,
      y: evento.clientY,
    });
  };

  const aoMover = (evento: PointerEvent<HTMLDivElement>) => {
    const anterior = ponteiros.current.get(evento.pointerId);
    if (!anterior || !foto || !lado) return;
    const agora = { x: evento.clientX, y: evento.clientY };
    const outros = [...ponteiros.current].filter(
      ([id]) => id !== evento.pointerId
    );
    ponteiros.current.set(evento.pointerId, agora);

    const outro = outros[0]?.[1];
    if (outro) {
      // Pinça: a razão entre as distâncias dos dedos muda o zoom, em torno
      // do ponto entre eles.
      const razao = distancia(agora, outro) / distancia(anterior, outro);
      const foco = relativoAoCentro({
        x: (agora.x + outro.x) / 2,
        y: (agora.y + outro.y) / 2,
      });
      setEnquadramento((atual) =>
        comZoom(foto.medidas, lado, atual, atual.zoom * razao, foco)
      );
      return;
    }
    setEnquadramento((atual) =>
      arrastado(foto.medidas, lado, atual, {
        x: agora.x - anterior.x,
        y: agora.y - anterior.y,
      })
    );
  };

  const aoSoltar = (evento: PointerEvent<HTMLDivElement>) => {
    ponteiros.current.delete(evento.pointerId);
  };

  const aoTeclar = (evento: KeyboardEvent<HTMLDivElement>) => {
    if (!foto || !lado) return;
    const movimentos: Record<string, Ponto> = {
      ArrowLeft: { x: -PASSO_DO_TECLADO, y: 0 },
      ArrowRight: { x: PASSO_DO_TECLADO, y: 0 },
      ArrowUp: { x: 0, y: -PASSO_DO_TECLADO },
      ArrowDown: { x: 0, y: PASSO_DO_TECLADO },
    };
    const movimento = movimentos[evento.key];
    if (movimento) {
      evento.preventDefault();
      setEnquadramento((atual) =>
        arrastado(foto.medidas, lado, atual, movimento)
      );
    } else if (evento.key === "+" || evento.key === "=") {
      evento.preventDefault();
      zoomPara(enquadramento.zoom * 1.1);
    } else if (evento.key === "-") {
      evento.preventDefault();
      zoomPara(enquadramento.zoom / 1.1);
    }
  };

  /** O quadrado final, do tamanho do avatar gravado. WebP; JPEG onde não houver. */
  const gerarFoto = useCallback(async (): Promise<Blob | null> => {
    if (!foto || !lado) return null;
    const corte = recorte(foto.medidas, lado, enquadramento);
    const canvas = document.createElement("canvas");
    canvas.width = FOTO.lado;
    canvas.height = FOTO.lado;
    const contexto = canvas.getContext("2d");
    if (!contexto) return null;
    contexto.fillStyle = "#ffffff";
    contexto.fillRect(0, 0, FOTO.lado, FOTO.lado);
    contexto.imageSmoothingQuality = "high";
    contexto.drawImage(
      foto.imagem,
      corte.x,
      corte.y,
      corte.lado,
      corte.lado,
      0,
      0,
      FOTO.lado,
      FOTO.lado
    );
    const emFormato = (tipo: string) =>
      new Promise<Blob | null>((resolver) =>
        canvas.toBlob(resolver, tipo, 0.9)
      );
    const webp = await emFormato("image/webp");
    return webp?.type === "image/webp" ? webp : emFormato("image/jpeg");
  }, [foto, lado, enquadramento]);

  const escala =
    foto && lado ? escalaNaTela(foto.medidas, lado, enquadramento.zoom) : 0;

  return {
    /** Ref da área de ajuste (o quadrado com o círculo). */
    refDaArea: setArea,
    pronta: Boolean(foto && lado),
    falhou,
    src: foto?.src,
    /** Posição e tamanho da foto na tela, para o estilo da imagem. */
    exibicao: foto
      ? {
          largura: foto.medidas.largura * escala,
          altura: foto.medidas.altura * escala,
          x: enquadramento.deslocamento.x,
          y: enquadramento.deslocamento.y,
        }
      : undefined,
    zoom: enquadramento.zoom,
    zoomPara,
    eventos: {
      onPointerDown: aoPressionar,
      onPointerMove: aoMover,
      onPointerUp: aoSoltar,
      onPointerCancel: aoSoltar,
      onKeyDown: aoTeclar,
    },
    gerarFoto,
  };
}
