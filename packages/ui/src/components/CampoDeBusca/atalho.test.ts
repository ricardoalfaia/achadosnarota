import { describe, expect, it } from "vitest";

import { atalhoParaAria } from "./atalho";

describe("atalhoParaAria", () => {
  it("troca os nomes curtos das teclas pelos de aria-keyshortcuts", () => {
    expect(atalhoParaAria("Ctrl K")).toBe("Control+K");
    expect(atalhoParaAria("⌘ k")).toBe("Meta+K");
  });

  it("aceita teclas separadas por + e espaços sobrando", () => {
    expect(atalhoParaAria(" Ctrl + Shift+f ")).toBe("Control+Shift+F");
  });

  it("uma tecla só continua sozinha", () => {
    expect(atalhoParaAria("/")).toBe("/");
  });
});
