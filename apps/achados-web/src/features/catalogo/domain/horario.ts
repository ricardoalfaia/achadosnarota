// O horário de funcionamento na tela: aberto agora, até quando, quando abre
// de novo e a semana em texto. Puro e no horário de Brasília (UTC−3 o ano
// todo desde 2019). Testado sem banco.

/** Um turno: `dia` 0 é domingo; "HH:MM". `fecha` < `abre` passa da meia-noite. */
export type Turno = { dia: number; abre: string; fecha: string };

export type SituacaoDoHorario =
  | { tipo: "semHorario" }
  | { tipo: "aberto"; fechaAs: string }
  | { tipo: "fechado"; abre?: { dia: number; hora: string; quando: Quando } };

type Quando = "hoje" | "amanha" | "outroDia";

const NOMES = [
  "domingo",
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
] as const;

const BRASILIA_EM_MS = -3 * 60 * 60 * 1000;
const MINUTOS_NA_SEMANA = 7 * 24 * 60;

const minutos = (hora: string) => {
  const [h, m] = hora.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

/** O momento na semana de Brasília, em minutos desde domingo 00:00. */
function minutoDaSemana(agora: Date): number {
  const local = new Date(agora.getTime() + BRASILIA_EM_MS);
  return (
    local.getUTCDay() * 24 * 60 +
    local.getUTCHours() * 60 +
    local.getUTCMinutes()
  );
}

/** Cada turno como intervalo [início, fim) em minutos da semana. */
function intervalos(turnos: readonly Turno[]) {
  return turnos.map((turno) => {
    const inicio = turno.dia * 24 * 60 + minutos(turno.abre);
    let fim = turno.dia * 24 * 60 + minutos(turno.fecha);
    if (fim <= inicio) fim += 24 * 60;
    return { turno, inicio, fim };
  });
}

export function situacaoDoHorario(
  turnos: readonly Turno[],
  agora: Date = new Date()
): SituacaoDoHorario {
  if (turnos.length === 0) return { tipo: "semHorario" };
  const atual = minutoDaSemana(agora);
  const lista = intervalos(turnos);

  // Aberto: dentro de um turno, inclusive o de sábado que entra no domingo.
  for (const { turno, inicio, fim } of lista)
    for (const deslocamento of [0, -MINUTOS_NA_SEMANA])
      if (atual >= inicio + deslocamento && atual < fim + deslocamento)
        return { tipo: "aberto", fechaAs: turno.fecha };

  // Fechado: o próximo início, na volta da semana se preciso.
  const proximo = lista
    .map(({ turno, inicio }) => ({
      turno,
      falta: (inicio - atual + MINUTOS_NA_SEMANA) % MINUTOS_NA_SEMANA,
    }))
    .sort((a, b) => a.falta - b.falta)[0];
  if (!proximo) return { tipo: "fechado" };
  const hoje = Math.floor(atual / (24 * 60));
  const diasAte = (proximo.turno.dia - hoje + 7) % 7;
  const quando: Quando =
    diasAte === 0 && proximo.falta < 24 * 60
      ? "hoje"
      : diasAte === 1
        ? "amanha"
        : "outroDia";
  return {
    tipo: "fechado",
    abre: { dia: proximo.turno.dia, hora: proximo.turno.abre, quando },
  };
}

/** "19:00" → "19h"; "11:30" → "11h30". */
export function horaCurta(hora: string): string {
  const [h, m] = hora.split(":");
  return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

/** A frase do topo da ficha: "Aberto agora · fecha às 23h". */
export function textoDaSituacao(situacao: SituacaoDoHorario): string | null {
  if (situacao.tipo === "semHorario") return null;
  if (situacao.tipo === "aberto")
    return `Aberto agora · fecha às ${horaCurta(situacao.fechaAs)}`;
  if (!situacao.abre) return "Fechado";
  const { dia, hora, quando } = situacao.abre;
  const dia_ =
    quando === "hoje" ? "hoje" : quando === "amanha" ? "amanhã" : NOMES[dia];
  return `Fechado · abre ${dia_} às ${horaCurta(hora)}`;
}

export type DiaDoHorario = {
  dia: number;
  nome: string;
  /** "11h30–15h · 19h–23h", ou "Fechado". */
  turnos: string;
  hoje: boolean;
};

/** A semana de segunda a domingo, para a aba Sobre. */
export function semanaDoHorario(
  turnos: readonly Turno[],
  agora: Date = new Date()
): DiaDoHorario[] {
  const hoje = Math.floor(minutoDaSemana(agora) / (24 * 60));
  return [1, 2, 3, 4, 5, 6, 0].map((dia) => {
    const doDia = turnos
      .filter((t) => t.dia === dia)
      .sort((a, b) => minutos(a.abre) - minutos(b.abre));
    return {
      dia,
      nome: NOMES[dia]!.replace(/^./, (c) => c.toUpperCase()),
      turnos:
        doDia.length === 0
          ? "Fechado"
          : doDia
              .map((t) => `${horaCurta(t.abre)}–${horaCurta(t.fecha)}`)
              .join(" · "),
      hoje: dia === hoje,
    };
  });
}
