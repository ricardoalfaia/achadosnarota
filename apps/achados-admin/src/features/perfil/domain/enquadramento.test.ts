import { describe, expect, it } from "vitest";

import {
  ajustar,
  arrastado,
  comZoom,
  ENQUADRAMENTO_INICIAL,
  recorte,
  ZOOM,
} from "./enquadramento";

// Uma foto deitada de 2000 x 1000 num círculo de 200px: no zoom 1, a altura
// preenche o círculo (escala 0,2) e sobram 100px de cada lado na horizontal.
const FOTO = { largura: 2000, altura: 1000 };
const LADO = 200;

describe("ajustar", () => {
  it("no zoom 1, só desliza no eixo maior", () => {
    expect(
      ajustar(FOTO, LADO, { zoom: 1, deslocamento: { x: 500, y: 40 } })
    ).toEqual({ zoom: 1, deslocamento: { x: 100, y: 0 } });
  });

  it("mantém o zoom dentro dos limites", () => {
    expect(
      ajustar(FOTO, LADO, { ...ENQUADRAMENTO_INICIAL, zoom: 0.2 }).zoom
    ).toBe(ZOOM.minimo);
    expect(
      ajustar(FOTO, LADO, { ...ENQUADRAMENTO_INICIAL, zoom: 9 }).zoom
    ).toBe(ZOOM.maximo);
  });
});

describe("arrastado", () => {
  it("soma o movimento e para na borda da foto", () => {
    const meio = arrastado(FOTO, LADO, ENQUADRAMENTO_INICIAL, { x: -60, y: 0 });
    expect(meio.deslocamento).toEqual({ x: -60, y: 0 });
    const fim = arrastado(FOTO, LADO, meio, { x: -60, y: 0 });
    expect(fim.deslocamento).toEqual({ x: -100, y: 0 });
  });
});

describe("comZoom", () => {
  it("pelo centro, aproxima sem mover o ponto do meio", () => {
    expect(comZoom(FOTO, LADO, ENQUADRAMENTO_INICIAL, 2)).toEqual({
      zoom: 2,
      deslocamento: { x: 0, y: 0 },
    });
  });

  it("pelo cursor, o ponto sob ele continua no lugar", () => {
    const foco = { x: 50, y: 50 };
    const depois = comZoom(FOTO, LADO, ENQUADRAMENTO_INICIAL, 2, foco);
    // No zoom 2 a foto vai a 800px de altura: folga de 300 na vertical.
    expect(depois.deslocamento).toEqual({ x: -50, y: -50 });
  });

  it("ao afastar, devolve a foto para dentro das bordas", () => {
    const perto = { zoom: 3, deslocamento: { x: 500, y: 250 } };
    expect(comZoom(FOTO, LADO, perto, 1).deslocamento).toEqual({
      x: 100,
      y: 0,
    });
  });
});

describe("recorte", () => {
  it("sem ajuste, pega o quadrado do meio do lado menor", () => {
    expect(recorte(FOTO, LADO, ENQUADRAMENTO_INICIAL)).toEqual({
      x: 500,
      y: 0,
      lado: 1000,
    });
  });

  it("arrastar a foto para a direita mostra o lado esquerdo dela", () => {
    expect(
      recorte(FOTO, LADO, { zoom: 1, deslocamento: { x: 100, y: 0 } })
    ).toEqual({ x: 0, y: 0, lado: 1000 });
  });

  it("com zoom 2, o quadrado tem metade do lado", () => {
    expect(
      recorte(FOTO, LADO, { zoom: 2, deslocamento: { x: 0, y: 0 } })
    ).toEqual({ x: 750, y: 250, lado: 500 });
  });
});
