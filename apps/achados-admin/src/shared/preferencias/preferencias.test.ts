import { describe, expect, it } from "vitest";

import {
  atributoDoTema,
  cookieDaPreferencia,
  COOKIES,
  lerPreferencias,
  PREFERENCIAS_PADRAO,
} from "./preferencias";

describe("preferências do painel", () => {
  it("cai no padrão sem cookie ou com valor desconhecido", () => {
    expect(lerPreferencias(() => undefined)).toEqual(PREFERENCIAS_PADRAO);
    expect(lerPreferencias(() => "roxo")).toEqual(PREFERENCIAS_PADRAO);
  });

  it("lê o tema e o menu recolhido dos cookies", () => {
    const cookies: Record<string, string> = {
      [COOKIES.tema]: "dark",
      [COOKIES.menuRecolhido]: "1",
    };
    expect(lerPreferencias((nome) => cookies[nome])).toEqual({
      tema: "dark",
      menuRecolhido: true,
    });
  });

  it("grava o menu recolhido como 1 ou 0", () => {
    expect(cookieDaPreferencia("menuRecolhido", true)).toContain(
      `${COOKIES.menuRecolhido}=1;`
    );
    expect(cookieDaPreferencia("menuRecolhido", false)).toContain(
      `${COOKIES.menuRecolhido}=0;`
    );
  });

  it("deixa o sistema decidir o tema em auto", () => {
    expect(atributoDoTema("auto")).toBeUndefined();
    expect(atributoDoTema("dark")).toBe("dark");
  });
});
