import { describe, expect, it } from "vitest";

import { formatarTelefone, slugDoNome, tempoDesde } from "./apresentacao";

describe("apresentação da casa", () => {
  it("gera o slug sem acento, caixa nem pontuação", () => {
    expect(slugDoNome("Café Estação 1914")).toBe("cafe-estacao-1914");
    expect(slugDoNome("  Bistrô — Quatro  Estações! ")).toBe(
      "bistro-quatro-estacoes"
    );
  });

  it("diz há quanto tempo foi a alteração", () => {
    const agora = new Date(2026, 9, 18, 15);
    expect(tempoDesde(new Date(2026, 9, 18, 9).toISOString(), agora)).toBe(
      "hoje"
    );
    expect(tempoDesde(new Date(2026, 9, 17, 23).toISOString(), agora)).toBe(
      "ontem"
    );
    expect(tempoDesde(new Date(2026, 9, 8).toISOString(), agora)).toBe(
      "há 10 dias"
    );
    expect(tempoDesde(new Date(2026, 6, 1).toISOString(), agora)).toBe(
      "há 3 meses"
    );
  });

  it("formata telefone fixo e celular", () => {
    expect(formatarTelefone("1236448899")).toBe("(12) 3644-8899");
    expect(formatarTelefone("12991234567")).toBe("(12) 99123-4567");
    expect(formatarTelefone("123")).toBe("123");
  });
});
