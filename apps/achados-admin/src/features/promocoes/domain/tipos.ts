import type { OfferKind, OfferStatus, OfferUsagePeriod } from "@achados/db";
import type { Periodo } from "@achados/ui";

// A promoção (oferta comercial) no painel. É voluntária do parceiro e não
// toca o editorial: nada de nota, selo ou posição aqui (ADR-004 de produto).

export type StatusDaPromocao = OfferStatus;
export type TipoDaPromocao = OfferKind;
export type PeriodoDeUso = OfferUsagePeriod;

export type PromocaoDaLista = {
  id: string;
  titulo: string;
  casaId: string;
  casa: string;
  tipo: TipoDaPromocao;
  status: StatusDaPromocao;
  limitePorAssinante: number;
  periodoDeUso: PeriodoDeUso;
  /** `AAAA-MM-DD` ou nulo (sem prazo). */
  validaDe: string | null;
  validaAte: string | null;
  atualizadaEm: string;
};

export type DadosDaPromocao = {
  casaId: string;
  titulo: string;
  termos: string;
  tipo: TipoDaPromocao;
  /** Chave de apresentação do ícone no app (percent, gift, dessert...). */
  icone: string;
  limitePorAssinante: number;
  periodoDeUso: PeriodoDeUso;
  /** Nula: vale enquanto estiver ativa. */
  vigencia: Periodo | null;
  status: StatusDaPromocao;
};

export type Promocao = DadosDaPromocao & { id: string; atualizadaEm: string };

/** A casa como opção do campo: só as não arquivadas. */
export type CasaDaPromocao = { id: string; nome: string; publicada: boolean };
