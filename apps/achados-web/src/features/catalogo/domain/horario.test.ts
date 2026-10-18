import { describe, expect, it } from "vitest";

import {
  horaCurta,
  semanaDoHorario,
  situacaoDoHorario,
  textoDaSituacao,
  type Turno,
} from "./horario";

// Brasília é UTC−3: 2026-10-20 é uma terça-feira.
const em = (iso: string) => new Date(`${iso}-03:00`);

const RANCHO: Turno[] = [
  ...[0, 2, 3, 4, 5, 6].map((dia) => ({ dia, abre: "11:30", fecha: "15:00" })),
  ...[2, 3, 4, 5, 6].map((dia) => ({ dia, abre: "19:00", fecha: "23:00" })),
];
const CHOPERIA: Turno[] = [{ dia: 6, abre: "17:00", fecha: "01:00" }];

describe("situação do horário", () => {
  it("aberto no turno, com a hora de fechar", () => {
    expect(
      textoDaSituacao(situacaoDoHorario(RANCHO, em("2026-10-20T12:00:00")))
    ).toBe("Aberto agora · fecha às 15h");
  });

  it("entre turnos: abre hoje à noite", () => {
    expect(
      textoDaSituacao(situacaoDoHorario(RANCHO, em("2026-10-20T16:00:00")))
    ).toBe("Fechado · abre hoje às 19h");
  });

  it("segunda fechada: abre amanhã", () => {
    expect(
      textoDaSituacao(situacaoDoHorario(RANCHO, em("2026-10-19T12:00:00")))
    ).toBe("Fechado · abre amanhã às 11h30");
  });

  it("turno de sábado que passa da meia-noite segue aberto no domingo", () => {
    expect(
      textoDaSituacao(situacaoDoHorario(CHOPERIA, em("2026-10-25T00:30:00")))
    ).toBe("Aberto agora · fecha às 1h");
    expect(
      textoDaSituacao(situacaoDoHorario(CHOPERIA, em("2026-10-25T01:30:00")))
    ).toBe("Fechado · abre sábado às 17h");
  });

  it("sem horário cadastrado, não diz nada", () => {
    expect(situacaoDoHorario([], new Date())).toEqual({ tipo: "semHorario" });
    expect(textoDaSituacao({ tipo: "semHorario" })).toBeNull();
  });
});

describe("semana do horário", () => {
  it("vai de segunda a domingo, junta os turnos e marca hoje", () => {
    const semana = semanaDoHorario(RANCHO, em("2026-10-20T12:00:00"));
    expect(semana.map((d) => d.nome)).toEqual([
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
      "Domingo",
    ]);
    expect(semana[0]).toMatchObject({ turnos: "Fechado", hoje: false });
    expect(semana[1]).toMatchObject({
      turnos: "11h30–15h · 19h–23h",
      hoje: true,
    });
    expect(semana[6]?.turnos).toBe("11h30–15h");
  });

  it("hora curta tira os minutos zerados", () => {
    expect(horaCurta("19:00")).toBe("19h");
    expect(horaCurta("08:30")).toBe("8h30");
  });
});
