// O horário da casa no formulário: edição dos turnos por dia e as regras de
// validação. Puro: testado sem tela. O banco guarda um turno por linha
// (`place_hours`); aqui a lista é a mesma, ordenada por dia e hora.

/** `dia` 0 é domingo; horas "HH:MM". `fecha` < `abre` passa da meia-noite. */
export type TurnoDaCasa = { dia: number; abre: string; fecha: string };

export const DIAS_DA_SEMANA = [
  { dia: 1, nome: "Segunda" },
  { dia: 2, nome: "Terça" },
  { dia: 3, nome: "Quarta" },
  { dia: 4, nome: "Quinta" },
  { dia: 5, nome: "Sexta" },
  { dia: 6, nome: "Sábado" },
  { dia: 0, nome: "Domingo" },
] as const;

/** Almoço e jantar: mais que isso, a casa usa a observação. */
export const TURNOS_POR_DIA = 2;

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const TURNO_PADRAO = { abre: "11:00", fecha: "22:00" };

const minutos = (hora: string) => {
  const [h, m] = hora.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

function ordenar(turnos: readonly TurnoDaCasa[]): TurnoDaCasa[] {
  const ordemDoDia = (dia: number) => (dia === 0 ? 7 : dia);
  return [...turnos].sort(
    (a, b) =>
      ordemDoDia(a.dia) - ordemDoDia(b.dia) || minutos(a.abre) - minutos(b.abre)
  );
}

export function turnosDoDia(
  turnos: readonly TurnoDaCasa[],
  dia: number
): TurnoDaCasa[] {
  return ordenar(turnos.filter((t) => t.dia === dia));
}

/** Abre o dia com um turno padrão, ou fecha (tira todos os turnos dele). */
export function alternarDia(
  turnos: readonly TurnoDaCasa[],
  dia: number
): TurnoDaCasa[] {
  return turnosDoDia(turnos, dia).length > 0
    ? turnos.filter((t) => t.dia !== dia)
    : ordenar([...turnos, { dia, ...TURNO_PADRAO }]);
}

export function adicionarTurno(
  turnos: readonly TurnoDaCasa[],
  dia: number
): TurnoDaCasa[] {
  const doDia = turnosDoDia(turnos, dia);
  if (doDia.length >= TURNOS_POR_DIA) return [...turnos];
  const ultimo = doDia.at(-1);
  // O segundo turno sugere o jantar, depois do primeiro.
  const novo = ultimo
    ? { dia, abre: "19:00", fecha: "23:00" }
    : { dia, ...TURNO_PADRAO };
  return ordenar([...turnos, novo]);
}

export function removerTurno(
  turnos: readonly TurnoDaCasa[],
  dia: number,
  indice: number
): TurnoDaCasa[] {
  const alvo = turnosDoDia(turnos, dia)[indice];
  return turnos.filter((t) => t !== alvo);
}

export function mudarTurno(
  turnos: readonly TurnoDaCasa[],
  dia: number,
  indice: number,
  campo: "abre" | "fecha",
  valor: string
): TurnoDaCasa[] {
  const alvo = turnosDoDia(turnos, dia)[indice];
  return turnos.map((t) => (t === alvo ? { ...t, [campo]: valor } : t));
}

/** Copia os turnos de um dia para todos os outros. */
export function copiarParaASemana(
  turnos: readonly TurnoDaCasa[],
  dia: number
): TurnoDaCasa[] {
  const modelo = turnosDoDia(turnos, dia);
  return ordenar(
    DIAS_DA_SEMANA.flatMap(({ dia: outro }) =>
      modelo.map(({ abre, fecha }) => ({ dia: outro, abre, fecha }))
    )
  );
}

/**
 * O que está errado no horário, por dia: hora fora do formato, turno que
 * abre e fecha na mesma hora, turnos demais ou que se sobrepõem.
 */
export function problemasDoHorario(
  turnos: readonly TurnoDaCasa[]
): { dia: number; motivo: string }[] {
  const problemas: { dia: number; motivo: string }[] = [];
  for (const { dia } of DIAS_DA_SEMANA) {
    const doDia = turnosDoDia(turnos, dia);
    if (doDia.length > TURNOS_POR_DIA) {
      problemas.push({ dia, motivo: "Use até dois turnos por dia" });
      continue;
    }
    if (doDia.some((t) => !HORA.test(t.abre) || !HORA.test(t.fecha))) {
      problemas.push({ dia, motivo: "Hora no formato 00:00" });
      continue;
    }
    if (doDia.some((t) => t.abre === t.fecha)) {
      problemas.push({ dia, motivo: "Abre e fecha na mesma hora" });
      continue;
    }
    const [primeiro, segundo] = doDia;
    if (primeiro && segundo) {
      const fimDoPrimeiro =
        minutos(primeiro.fecha) <= minutos(primeiro.abre)
          ? 24 * 60 + minutos(primeiro.fecha)
          : minutos(primeiro.fecha);
      if (minutos(segundo.abre) < fimDoPrimeiro)
        problemas.push({ dia, motivo: "Os turnos se sobrepõem" });
    }
  }
  return problemas;
}
