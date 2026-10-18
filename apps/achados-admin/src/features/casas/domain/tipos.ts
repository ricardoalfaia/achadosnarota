import type { PlaceStatus } from "@achados/db";

// A casa (estabelecimento) no painel: só dados de descoberta. Avaliação
// editorial e promoção comercial são domínios próprios (ADR-004 de produto);
// a lista mostra contagens deles, sem misturar as escritas.

export type StatusDaCasa = PlaceStatus;

export type Cidade = { id: string; nome: string; uf: string };
export type Categoria = { id: string; nome: string };

export type OpcoesDoCatalogo = {
  cidades: readonly Cidade[];
  categorias: readonly Categoria[];
};

/** Uma linha da listagem de casas. */
export type CasaDaLista = {
  id: string;
  nome: string;
  especialidade: string;
  /** "Campos do Jordão · SP". */
  cidade: string;
  categoria: string;
  status: StatusDaCasa;
  fotos: number;
  /** Há avaliação publicada pela curadoria. */
  avaliada: boolean;
  promocoesAtivas: number;
  /** ISO 8601. */
  atualizadaEm: string;
};

/** O que o formulário edita. Vazio é `""`; o servidor guarda nulo. */
export type DadosDaCasa = {
  nome: string;
  slug: string;
  categoriaId: string;
  cidadeId: string;
  especialidade: string;
  resumo: string;
  descricao: string;
  tags: readonly string[];
  endereco: string;
  /** Só dígitos, com DDD. */
  telefone: string;
  site: string;
  status: StatusDaCasa;
};

export type FotoDaCasa = {
  id: string;
  /** Vazio enquanto o envio ao armazenamento não existe (R2, próxima fase). */
  url: string;
  alt: string;
  origem: string;
};

export type Casa = DadosDaCasa & {
  id: string;
  fotos: readonly FotoDaCasa[];
  publicadaEm: string | null;
  atualizadaEm: string;
};
