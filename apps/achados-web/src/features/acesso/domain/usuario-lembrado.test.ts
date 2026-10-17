import { describe, expect, it } from "vitest";

import {
  CHAVE_DO_USUARIO_LEMBRADO,
  guardarUsuarioLembrado,
  lerUsuarioLembrado,
  type Armazenamento,
} from "./usuario-lembrado";

function armazenamentoEmMemoria(): Armazenamento & {
  itens: Map<string, string>;
} {
  const itens = new Map<string, string>();
  return {
    itens,
    getItem: (chave) => itens.get(chave) ?? null,
    setItem: (chave, valor) => void itens.set(chave, valor),
    removeItem: (chave) => void itens.delete(chave),
  };
}

describe("usuário lembrado", () => {
  it("começa vazio", () => {
    expect(lerUsuarioLembrado(armazenamentoEmMemoria())).toBe("");
  });

  it("guarda o usuário aparado quando a pessoa pede para lembrar", () => {
    const armazenamento = armazenamentoEmMemoria();

    guardarUsuarioLembrado(armazenamento, "  ana@exemplo.com.br ", true);

    expect(lerUsuarioLembrado(armazenamento)).toBe("ana@exemplo.com.br");
    expect([...armazenamento.itens.keys()]).toEqual([
      CHAVE_DO_USUARIO_LEMBRADO,
    ]);
  });

  it("esquece o usuário quando a pessoa desmarca ou deixa o campo vazio", () => {
    const armazenamento = armazenamentoEmMemoria();
    guardarUsuarioLembrado(armazenamento, "ana@exemplo.com.br", true);

    guardarUsuarioLembrado(armazenamento, "ana@exemplo.com.br", false);
    expect(lerUsuarioLembrado(armazenamento)).toBe("");

    guardarUsuarioLembrado(armazenamento, "ana@exemplo.com.br", true);
    guardarUsuarioLembrado(armazenamento, "   ", true);
    expect(lerUsuarioLembrado(armazenamento)).toBe("");
  });
});
