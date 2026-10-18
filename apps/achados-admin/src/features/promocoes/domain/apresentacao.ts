import type { IntencaoDoSeloDeStatus } from "@achados/ui";

import type { PeriodoDeUso, StatusDaPromocao, TipoDaPromocao } from "./tipos";

// Como a promoção aparece no painel. Regras puras, testadas sem a tela.

export const STATUS_DA_PROMOCAO: Record<
  StatusDaPromocao,
  { rotulo: string; plural: string; intencao: IntencaoDoSeloDeStatus }
> = {
  active: { rotulo: "Ativa", plural: "Ativas", intencao: "sucesso" },
  pending_review: {
    rotulo: "Em revisão",
    plural: "Em revisão",
    intencao: "destaque",
  },
  draft: { rotulo: "Rascunho", plural: "Rascunhos", intencao: "neutro" },
  paused: { rotulo: "Pausada", plural: "Pausadas", intencao: "atencao" },
  expired: { rotulo: "Encerrada", plural: "Encerradas", intencao: "perigo" },
  archived: { rotulo: "Arquivada", plural: "Arquivadas", intencao: "neutro" },
};

export const TIPO_DA_PROMOCAO: Record<TipoDaPromocao, string> = {
  discount: "Desconto",
  courtesy: "Cortesia",
  two_for_one: "Compre 1, leve 2",
};

const POR_PERIODO: Record<PeriodoDeUso, string> = {
  day: "por dia",
  week: "por semana",
  month: "por mês",
  year: "por ano",
  unlimited: "",
};

export const PERIODO_DE_USO: Record<PeriodoDeUso, string> = {
  day: "Por dia",
  week: "Por semana",
  month: "Por mês",
  year: "Por ano",
  unlimited: "Sem limite",
};

/** "1 vez por ano", "2 vezes por semana", "Uso livre". */
export function regraDeUso(limite: number, periodo: PeriodoDeUso): string {
  if (periodo === "unlimited") return "Uso livre";
  return `${limite} ${limite === 1 ? "vez" : "vezes"} ${POR_PERIODO[periodo]}`;
}

/** "2026-12-31" → "31/12/2026". */
export function dataCurta(iso: string): string {
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

/**
 * A vigência em palavras, a partir de hoje (`AAAA-MM-DD`): "Sem prazo",
 * "Começa em 01/11/2026", "Até 31/12/2026" ou "Terminou em 10/10/2026".
 */
export function vigenciaEmPalavras(
  de: string | null,
  ate: string | null,
  hoje: string
): string {
  if (de && de > hoje) return `Começa em ${dataCurta(de)}`;
  if (!ate) return "Sem prazo";
  if (ate < hoje) return `Terminou em ${dataCurta(ate)}`;
  return `Até ${dataCurta(ate)}`;
}
