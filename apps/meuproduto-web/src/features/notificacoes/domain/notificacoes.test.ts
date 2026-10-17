import { describe, expect, it } from "vitest";

import {
  agruparNotificacoes,
  filtrarNotificacoes,
  marcarComoLida,
  marcarTodasComoLidas,
  naoLidas,
  NOTIFICACOES_PROVISORIAS,
} from "./notificacoes";

describe("filtrarNotificacoes", () => {
  it("todas, não lidas e as de assinaturas", () => {
    expect(filtrarNotificacoes(NOTIFICACOES_PROVISORIAS, "todas").length).toBe(
      6
    );
    expect(
      filtrarNotificacoes(NOTIFICACOES_PROVISORIAS, "naoLidas").length
    ).toBe(3);
    expect(
      filtrarNotificacoes(NOTIFICACOES_PROVISORIAS, "assinaturas").map(
        (n) => n.id
      )
    ).toEqual([
      "assinaturaConcluida",
      "assinaturaPendente",
      "assinaturaRecusada",
    ]);
  });
});

describe("agruparNotificacoes", () => {
  it("Hoje antes de Anteriores, e grupo vazio some", () => {
    expect(
      agruparNotificacoes(NOTIFICACOES_PROVISORIAS).map((g) => g.grupo)
    ).toEqual(["hoje", "anteriores"]);
    expect(
      agruparNotificacoes(
        filtrarNotificacoes(NOTIFICACOES_PROVISORIAS, "naoLidas")
      ).map((g) => g.grupo)
    ).toEqual(["hoje"]);
  });
});

describe("marcar como lida", () => {
  it("uma ou todas, sem mudar as demais", () => {
    expect(naoLidas(NOTIFICACOES_PROVISORIAS)).toBe(3);
    expect(
      naoLidas(marcarComoLida(NOTIFICACOES_PROVISORIAS, "documentoGerado"))
    ).toBe(2);
    expect(naoLidas(marcarTodasComoLidas(NOTIFICACOES_PROVISORIAS))).toBe(0);
  });

  it("não repete identificadores", () => {
    const ids = NOTIFICACOES_PROVISORIAS.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
