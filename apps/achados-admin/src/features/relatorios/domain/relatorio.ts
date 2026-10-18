// O relatório de resgates: período, indicadores, série diária, mapa de
// calor, rankings e CSV. Puro e no horário de Brasília (UTC−3 o ano todo).
// Nada aqui identifica o assinante: as linhas trazem só um id opaco, usado
// para contar pessoas distintas, e ele não sai no CSV nem na tela.

export const PERIODOS = ["7d", "30d", "90d", "ano"] as const;
export type Periodo = (typeof PERIODOS)[number];

export const ROTULO_DO_PERIODO: Record<Periodo, string> = {
  "7d": "7 dias",
  "30d": "30 dias",
  "90d": "90 dias",
  ano: "Este ano",
};

export type SituacaoDoResgate = "redeemed" | "expired" | "issued" | "voided";

export type LinhaDeResgate = {
  id: string;
  situacao: SituacaoDoResgate;
  /** ISO: quando o código foi gerado. */
  geradoEm: string;
  /** ISO: quando o garçom confirmou; nulo se não foi usado. */
  usadoEm: string | null;
  casaId: string;
  casa: string;
  beneficio: string;
  /** Id opaco do assinante: só para contar pessoas distintas. */
  assinante: string;
  operador: string | null;
};

const BRASILIA_EM_MS = -3 * 60 * 60 * 1000;
const DIA_EM_MS = 24 * 60 * 60 * 1000;

export function lerPeriodo(valor: unknown): Periodo {
  return PERIODOS.find((p) => p === valor) ?? "30d";
}

/** O dia de Brasília de um instante, "AAAA-MM-DD". */
export function diaDeBrasilia(instante: Date): string {
  return new Date(instante.getTime() + BRASILIA_EM_MS)
    .toISOString()
    .slice(0, 10);
}

/** Meia-noite de Brasília do dia, como instante. */
function inicioDoDia(dia: string): Date {
  return new Date(`${dia}T00:00:00-03:00`);
}

/**
 * O intervalo do período até `agora` e o anterior, de mesmo tamanho, para a
 * comparação. "Este ano" compara com o mesmo trecho do ano passado.
 */
export function intervaloDoPeriodo(
  periodo: Periodo,
  agora: Date
): { inicio: Date; fim: Date; anteriorInicio: Date; anteriorFim: Date } {
  const hoje = diaDeBrasilia(agora);
  const fim = agora;
  if (periodo === "ano") {
    const ano = Number(hoje.slice(0, 4));
    const inicio = inicioDoDia(`${ano}-01-01`);
    const anteriorInicio = inicioDoDia(`${ano - 1}-01-01`);
    const anteriorFim = new Date(
      fim.getTime() - (inicio.getTime() - anteriorInicio.getTime())
    );
    return { inicio, fim, anteriorInicio, anteriorFim };
  }
  const dias = periodo === "7d" ? 7 : periodo === "30d" ? 30 : 90;
  const inicio = new Date(inicioDoDia(hoje).getTime() - (dias - 1) * DIA_EM_MS);
  const anteriorInicio = new Date(inicio.getTime() - dias * DIA_EM_MS);
  return { inicio, fim, anteriorInicio, anteriorFim: inicio };
}

export type Indicadores = {
  usados: number;
  gerados: number;
  /** Usados ÷ gerados, de 0 a 1; nulo sem códigos. */
  taxaDeUso: number | null;
  assinantes: number;
  casas: number;
  /** Usos confirmados no período anterior, de mesmo tamanho. */
  usadosAntes: number;
  /**
   * Variação dos usados contra o período anterior. Nula com base pequena
   * (menos de 5 usos), em que a porcentagem engana mais do que informa.
   */
  variacao: number | null;
};

export const BASE_MINIMA_DA_VARIACAO = 5;

export function indicadores(
  atuais: readonly LinhaDeResgate[],
  anteriores: readonly LinhaDeResgate[]
): Indicadores {
  const usados = atuais.filter((l) => l.situacao === "redeemed");
  const usadosAntes = anteriores.filter(
    (l) => l.situacao === "redeemed"
  ).length;
  return {
    usados: usados.length,
    gerados: atuais.length,
    taxaDeUso: atuais.length > 0 ? usados.length / atuais.length : null,
    assinantes: new Set(usados.map((l) => l.assinante)).size,
    casas: new Set(usados.map((l) => l.casaId)).size,
    usadosAntes,
    variacao:
      usadosAntes >= BASE_MINIMA_DA_VARIACAO
        ? (usados.length - usadosAntes) / usadosAntes
        : null,
  };
}

/** Usos confirmados por dia, com os dias sem uso em zero. */
export function seriePorDia(
  linhas: readonly LinhaDeResgate[],
  inicio: Date,
  fim: Date
): { dia: string; usados: number }[] {
  const contagem = new Map<string, number>();
  for (const l of linhas)
    if (l.situacao === "redeemed" && l.usadoEm) {
      const dia = diaDeBrasilia(new Date(l.usadoEm));
      contagem.set(dia, (contagem.get(dia) ?? 0) + 1);
    }
  const serie: { dia: string; usados: number }[] = [];
  const ultimo = diaDeBrasilia(fim);
  for (
    let dia = diaDeBrasilia(inicio);
    dia <= ultimo;
    dia = diaDeBrasilia(new Date(inicioDoDia(dia).getTime() + DIA_EM_MS + 1))
  )
    serie.push({ dia, usados: contagem.get(dia) ?? 0 });
  return serie;
}

/** Usos por dia da semana (0 = domingo) e hora, em Brasília: [dia][hora]. */
export function mapaDeCalor(linhas: readonly LinhaDeResgate[]): number[][] {
  const mapa = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
  for (const l of linhas)
    if (l.situacao === "redeemed" && l.usadoEm) {
      const local = new Date(new Date(l.usadoEm).getTime() + BRASILIA_EM_MS);
      mapa[local.getUTCDay()]![local.getUTCHours()]! += 1;
    }
  return mapa;
}

/** Os mais usados por casa ou por benefício, do maior para o menor. */
export function ranking(
  linhas: readonly LinhaDeResgate[],
  chave: "casa" | "beneficio",
  limite = 6
): { nome: string; usados: number }[] {
  const contagem = new Map<string, number>();
  for (const l of linhas)
    if (l.situacao === "redeemed")
      contagem.set(l[chave], (contagem.get(l[chave]) ?? 0) + 1);
  return [...contagem]
    .map(([nome, usados]) => ({ nome, usados }))
    .sort(
      (a, b) => b.usados - a.usados || a.nome.localeCompare(b.nome, "pt-BR")
    )
    .slice(0, limite);
}

const SITUACAO_NO_CSV: Record<SituacaoDoResgate, string> = {
  redeemed: "usado",
  expired: "expirado",
  issued: "emitido",
  voided: "cancelado",
};

function celula(valor: string): string {
  // Fórmulas de planilha (=, +, -, @) entram como texto, e aspas se dobram.
  const seguro = /^[=+\-@]/.test(valor) ? `'${valor}` : valor;
  return `"${seguro.replace(/"/g, '""')}"`;
}

/** O CSV do período, sem o assinante. Separador ";", como no Excel brasileiro. */
export function csvDosResgates(linhas: readonly LinhaDeResgate[]): string {
  const formato = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });
  const cabecalho = [
    "Gerado em",
    "Usado em",
    "Situação",
    "Casa",
    "Benefício",
    "Operador",
  ];
  const corpo = linhas.map((l) =>
    [
      formato.format(new Date(l.geradoEm)),
      l.usadoEm ? formato.format(new Date(l.usadoEm)) : "",
      SITUACAO_NO_CSV[l.situacao],
      l.casa,
      l.beneficio,
      l.operador ?? "",
    ]
      .map(celula)
      .join(";")
  );
  return [cabecalho.map(celula).join(";"), ...corpo].join("\r\n");
}
