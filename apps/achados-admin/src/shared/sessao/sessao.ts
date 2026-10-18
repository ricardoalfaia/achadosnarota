import type { PapelDaEquipe as PapelNoBanco } from "@achados/db";

// Quem está usando o painel, no formato que a casca mostra, e as regras puras
// de papel. Sem React e sem Next. Quem é da equipe e com que papel vem do
// banco (`staff_member`) a cada pedido; esconder um item do menu não é
// autorização: o banco recusa o que o papel não pode (RLS).

export type PapelDaEquipe = "administrador" | "curador" | "comercial";

export type PessoaDaEquipe = {
  id: string;
  nome: string;
  papel: PapelDaEquipe;
  /** A foto da conta (R2), se houver. */
  fotoUrl?: string | undefined;
};

export const ROTULO_DO_PAPEL: Record<PapelDaEquipe, string> = {
  administrador: "Administração",
  curador: "Curadoria",
  comercial: "Comercial",
};

const PAPEL_DO_BANCO: Record<PapelNoBanco, PapelDaEquipe> = {
  admin: "administrador",
  curator: "curador",
  commercial: "comercial",
};

export function papelDoBanco(papel: PapelNoBanco): PapelDaEquipe {
  return PAPEL_DO_BANCO[papel];
}

/** O que cada papel escreve (o banco confere de novo; isto só orienta a tela). */
export const ESCREVE: Record<
  "casas" | "curadoria" | "promocoes" | "operadores",
  readonly PapelDaEquipe[]
> = {
  casas: ["administrador", "curador"],
  curadoria: ["administrador", "curador"],
  promocoes: ["administrador", "comercial"],
  operadores: ["administrador"],
};

export function podeEscrever(
  pessoa: Pick<PessoaDaEquipe, "papel">,
  area: keyof typeof ESCREVE
): boolean {
  return ESCREVE[area].includes(pessoa.papel);
}
