import { describe, expect, it } from "vitest";

import { itemAtivo, ITENS_DA_NAVEGACAO } from "./navegacao";

describe("itemAtivo", () => {
  it("a raiz é Explorar", () => {
    expect(itemAtivo("/")).toBe("explorar");
  });

  it("a ficha do lugar pertence a Explorar", () => {
    expect(itemAtivo("/lugar/rancho-portugues")).toBe("explorar");
  });

  it("cada tela acende o seu item", () => {
    expect(itemAtivo("/favoritos")).toBe("favoritos");
    expect(itemAtivo("/passaporte")).toBe("passaporte");
    expect(itemAtivo("/perfil")).toBe("perfil");
  });

  it("tela fora da barra não acende nada", () => {
    expect(itemAtivo("/login")).toBeNull();
  });

  it("quatro destinos, na ordem do protótipo", () => {
    expect(ITENS_DA_NAVEGACAO.map((i) => i.rotulo)).toEqual([
      "Explorar",
      "Favoritos",
      "Passaporte",
      "Perfil",
    ]);
  });
});
