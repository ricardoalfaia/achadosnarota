import { describe, expect, it } from "vitest";

import { ROTAS } from "@/shared/rotas";
import { itemDaRota, itemDeNavegacao, NAVEGACAO } from "./navegacao";

describe("navegação do painel", () => {
  it("cobre todas as rotas, uma vez cada", () => {
    const hrefs = NAVEGACAO.flatMap((secao) => secao.itens.map((i) => i.href));
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect([...hrefs].sort()).toEqual(Object.values(ROTAS).sort());
  });

  it("separa editorial e comercial em seções diferentes (ADR-004)", () => {
    const secaoDe = (id: string) =>
      NAVEGACAO.find((secao) => secao.itens.some((item) => item.id === id))?.id;
    expect(secaoDe("curadoria")).toBe("editorial");
    expect(secaoDe("promocoes")).toBe("comercial");
  });

  it("acha o item da rota atual, inclusive com o registro aberto", () => {
    expect(itemDaRota("/")?.id).toBe("inicio");
    expect(itemDaRota("/promocoes")?.id).toBe("promocoes");
    expect(itemDaRota("/inexistente")).toBeUndefined();
  });

  it("recusa id desconhecido", () => {
    expect(itemDeNavegacao("casas").rotulo).toBe("Casas");
    // @ts-expect-error id fora do menu
    expect(() => itemDeNavegacao("outro")).toThrow();
  });
});
