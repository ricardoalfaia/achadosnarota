import { describe, expect, it } from "vitest";

import { abaDestino } from "./navegacao";

const ABAS = ["geral", "signatarios", "historico"] as const;

describe("abaDestino", () => {
  it("as setas andam uma aba e dão a volta nas pontas", () => {
    expect(abaDestino(ABAS, "geral", "ArrowRight")).toBe("signatarios");
    expect(abaDestino(ABAS, "historico", "ArrowRight")).toBe("geral");
    expect(abaDestino(ABAS, "signatarios", "ArrowLeft")).toBe("geral");
    expect(abaDestino(ABAS, "geral", "ArrowLeft")).toBe("historico");
  });

  it("Home e End vão às pontas", () => {
    expect(abaDestino(ABAS, "signatarios", "Home")).toBe("geral");
    expect(abaDestino(ABAS, "signatarios", "End")).toBe("historico");
  });

  it("parte da primeira quando a aba atual não está entre as habilitadas", () => {
    expect(abaDestino(ABAS, "desabilitada" as never, "ArrowRight")).toBe(
      "geral"
    );
  });

  it("outras teclas e lista vazia não navegam", () => {
    expect(abaDestino(ABAS, "geral", "Enter")).toBeNull();
    expect(abaDestino([], "geral", "ArrowRight")).toBeNull();
  });
});
