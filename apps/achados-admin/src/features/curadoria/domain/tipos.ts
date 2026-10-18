import type { ReviewStatus, Seal } from "@achados/db";

import type { NotasDosCriterios } from "./criterios";

// A avaliação editorial no painel. Escrita só pela curadoria: nenhum campo
// comercial aqui, e o parceiro não tem caminho de escrita (ADR-004 de
// produto).

export type StatusDaAvaliacao = ReviewStatus;
export type SeloEditorial = Seal;

export type AvaliacaoDaLista = {
  id: string;
  casaId: string;
  casa: string;
  nota: number;
  criterios: number;
  status: StatusDaAvaliacao;
  selo: SeloEditorial | null;
  /** `AAAA-MM-DD`. */
  visitadaEm: string;
  atualizadaEm: string;
};

export type DadosDaAvaliacao = {
  casaId: string;
  visitadaEm: string;
  notas: NotasDosCriterios;
  parecer: string;
  ressalvas: string;
  achado: string;
  /** Uma dica por linha no formulário. */
  dicas: string;
  selo: SeloEditorial | null;
  status: StatusDaAvaliacao;
};

export type Avaliacao = DadosDaAvaliacao & { id: string; atualizadaEm: string };
