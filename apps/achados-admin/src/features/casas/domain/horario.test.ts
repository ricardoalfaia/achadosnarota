import { describe, expect, it } from "vitest";

import {
  adicionarTurno,
  alternarDia,
  copiarParaASemana,
  mudarTurno,
  problemasDoHorario,
  removerTurno,
  turnosDoDia,
  type TurnoDaCasa,
} from "./horario";

describe("edição do horário", () => {
  it("abre o dia com um turno padrão e fecha tirando os turnos", () => {
    const aberto = alternarDia([], 2);
    expect(aberto).toEqual([{ dia: 2, abre: "11:00", fecha: "22:00" }]);
    expect(alternarDia(aberto, 2)).toEqual([]);
  });

  it("o segundo turno sugere o jantar, e não passa de dois", () => {
    const almoco: TurnoDaCasa[] = [{ dia: 3, abre: "11:30", fecha: "15:00" }];
    const comJantar = adicionarTurno(almoco, 3);
    expect(turnosDoDia(comJantar, 3)).toEqual([
      { dia: 3, abre: "11:30", fecha: "15:00" },
      { dia: 3, abre: "19:00", fecha: "23:00" },
    ]);
    expect(adicionarTurno(comJantar, 3)).toHaveLength(2);
  });

  it("muda e remove o turno certo do dia", () => {
    const dia: TurnoDaCasa[] = [
      { dia: 5, abre: "19:00", fecha: "23:00" },
      { dia: 5, abre: "11:30", fecha: "15:00" },
    ];
    const mudado = mudarTurno(dia, 5, 1, "fecha", "23:30");
    expect(turnosDoDia(mudado, 5)[1]?.fecha).toBe("23:30");
    expect(turnosDoDia(removerTurno(dia, 5, 0), 5)).toEqual([
      { dia: 5, abre: "19:00", fecha: "23:00" },
    ]);
  });

  it("copia um dia para a semana inteira", () => {
    const semana = copiarParaASemana(
      [{ dia: 1, abre: "08:00", fecha: "18:00" }],
      1
    );
    expect(semana).toHaveLength(7);
    expect(new Set(semana.map((t) => t.dia)).size).toBe(7);
  });
});

describe("problemas do horário", () => {
  it("aceita turno que passa da meia-noite e dois turnos separados", () => {
    expect(
      problemasDoHorario([
        { dia: 6, abre: "17:00", fecha: "01:00" },
        { dia: 2, abre: "11:30", fecha: "15:00" },
        { dia: 2, abre: "19:00", fecha: "23:00" },
      ])
    ).toEqual([]);
  });

  it("aponta formato, mesma hora e sobreposição, por dia", () => {
    expect(
      problemasDoHorario([
        { dia: 1, abre: "25:00", fecha: "18:00" },
        { dia: 3, abre: "10:00", fecha: "10:00" },
        { dia: 4, abre: "11:00", fecha: "16:00" },
        { dia: 4, abre: "15:00", fecha: "23:00" },
      ])
    ).toEqual([
      { dia: 1, motivo: "Hora no formato 00:00" },
      { dia: 3, motivo: "Abre e fecha na mesma hora" },
      { dia: 4, motivo: "Os turnos se sobrepõem" },
    ]);
  });
});
