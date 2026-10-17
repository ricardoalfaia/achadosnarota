import { describe, expect, it } from "vitest";

import {
  atributoDoTema,
  cookieDaPreferencia,
  lerPreferencias,
  PREFERENCIAS_PADRAO,
} from "./preferencias";

const cookies = (valores: Record<string, string>) => (nome: string) =>
  valores[nome];

describe("lerPreferencias", () => {
  it("sem cookies, devolve o padrão", () => {
    expect(lerPreferencias(cookies({}))).toEqual(PREFERENCIAS_PADRAO);
  });

  it("lê tema, idioma e menu gravados", () => {
    expect(
      lerPreferencias(
        cookies({
          "meuproduto-tema": "dark",
          "meuproduto-idioma": "en",
          "meuproduto-menu": "recolhido",
        })
      )
    ).toEqual({ tema: "dark", idioma: "en", menuRecolhido: true });
  });

  it("valor desconhecido cai no padrão em vez de chegar à tela", () => {
    expect(
      lerPreferencias(
        cookies({
          "meuproduto-tema": "sepia",
          "meuproduto-idioma": "fr",
          "meuproduto-menu": "talvez",
        })
      )
    ).toEqual(PREFERENCIAS_PADRAO);
  });
});

describe("atributoDoTema", () => {
  it("auto não gera atributo, para o sistema operacional decidir", () => {
    expect(atributoDoTema("auto")).toBeUndefined();
    expect(atributoDoTema("dark")).toBe("dark");
  });
});

describe("cookieDaPreferencia", () => {
  it("vale para o site inteiro por um ano", () => {
    expect(cookieDaPreferencia("tema", "dark")).toBe(
      "meuproduto-tema=dark; Path=/; Max-Age=31536000; SameSite=Lax"
    );
  });

  it("o que é gravado é lido de volta igual", () => {
    for (const recolhido of [true, false]) {
      const gravado = cookieDaPreferencia("menuRecolhido", recolhido);
      const valor = gravado.split(";")[0]?.split("=")[1] ?? "";
      expect(
        lerPreferencias(cookies({ "meuproduto-menu": valor })).menuRecolhido
      ).toBe(recolhido);
    }
    expect(cookieDaPreferencia("idioma", "en")).toContain(
      "meuproduto-idioma=en;"
    );
  });
});
