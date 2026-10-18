// O ajuste da foto dentro do círculo: zoom e deslocamento, sem React nem
// canvas. A imagem sempre cobre o círculo inteiro; nunca sobra borda vazia.

export type Medidas = { largura: number; altura: number };
export type Ponto = { x: number; y: number };

export type Enquadramento = {
  /** 1 = o lado menor da foto preenche o círculo. */
  zoom: number;
  /** Centro da foto em relação ao centro do círculo, em pixels da tela. */
  deslocamento: Ponto;
};

export const ZOOM = { minimo: 1, maximo: 4, passo: 0.01 } as const;

export const ENQUADRAMENTO_INICIAL: Enquadramento = {
  zoom: 1,
  deslocamento: { x: 0, y: 0 },
};

/** Quantos pixels da tela cada pixel da foto ocupa, com o zoom. */
export function escalaNaTela(
  foto: Medidas,
  lado: number,
  zoom: number
): number {
  return (lado / Math.min(foto.largura, foto.altura)) * zoom;
}

function limitar(valor: number, minimo: number, maximo: number): number {
  return Math.min(maximo, Math.max(minimo, valor));
}

/**
 * O enquadramento possível mais próximo do pedido: zoom dentro dos limites e
 * deslocamento que não deixa a foto descobrir o círculo.
 */
export function ajustar(
  foto: Medidas,
  lado: number,
  pedido: Enquadramento
): Enquadramento {
  const zoom = limitar(pedido.zoom, ZOOM.minimo, ZOOM.maximo);
  const escala = escalaNaTela(foto, lado, zoom);
  const folgaX = (foto.largura * escala - lado) / 2;
  const folgaY = (foto.altura * escala - lado) / 2;
  return {
    zoom,
    deslocamento: {
      x: limitar(pedido.deslocamento.x, -folgaX, folgaX) || 0,
      y: limitar(pedido.deslocamento.y, -folgaY, folgaY) || 0,
    },
  };
}

/**
 * Muda o zoom mantendo parado o ponto da foto que está sob `foco` (relativo ao
 * centro do círculo): o centro no controle deslizante, o cursor na roda.
 */
export function comZoom(
  foto: Medidas,
  lado: number,
  atual: Enquadramento,
  zoom: number,
  foco: Ponto = { x: 0, y: 0 }
): Enquadramento {
  const novo = limitar(zoom, ZOOM.minimo, ZOOM.maximo);
  const razao = novo / atual.zoom;
  return ajustar(foto, lado, {
    zoom: novo,
    deslocamento: {
      x: foco.x - (foco.x - atual.deslocamento.x) * razao,
      y: foco.y - (foco.y - atual.deslocamento.y) * razao,
    },
  });
}

/** Arrastar: soma o movimento do dedo ou do mouse e respeita as bordas. */
export function arrastado(
  foto: Medidas,
  lado: number,
  atual: Enquadramento,
  movimento: Ponto
): Enquadramento {
  return ajustar(foto, lado, {
    zoom: atual.zoom,
    deslocamento: {
      x: atual.deslocamento.x + movimento.x,
      y: atual.deslocamento.y + movimento.y,
    },
  });
}

/** O quadrado da foto original que aparece no círculo, em pixels da foto. */
export function recorte(
  foto: Medidas,
  lado: number,
  enquadramento: Enquadramento
): { x: number; y: number; lado: number } {
  const { zoom, deslocamento } = ajustar(foto, lado, enquadramento);
  const escala = escalaNaTela(foto, lado, zoom);
  const ladoNaFoto = lado / escala;
  return {
    x: foto.largura / 2 - deslocamento.x / escala - ladoNaFoto / 2,
    y: foto.altura / 2 - deslocamento.y / escala - ladoNaFoto / 2,
    lado: ladoNaFoto,
  };
}
