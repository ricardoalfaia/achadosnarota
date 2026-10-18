import type { IntencaoDoSeloDeStatus } from "@achados/ui";

import type { StatusDaCasa } from "./tipos";

// Como a casa aparece no painel. Regras puras, testadas sem a tela.

export const STATUS_DA_CASA: Record<
  StatusDaCasa,
  { rotulo: string; plural: string; intencao: IntencaoDoSeloDeStatus }
> = {
  published: { rotulo: "Publicada", plural: "Publicadas", intencao: "sucesso" },
  draft: { rotulo: "Rascunho", plural: "Rascunhos", intencao: "atencao" },
  archived: { rotulo: "Arquivada", plural: "Arquivadas", intencao: "neutro" },
};

/** "há 3 dias", "hoje", "ontem": a idade de uma alteração, em dias. */
export function tempoDesde(iso: string, agora: Date = new Date()): string {
  const dias = Math.floor(
    (inicioDoDia(agora) - inicioDoDia(new Date(iso))) / 86_400_000
  );
  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  if (dias < 30) return `há ${dias} dias`;
  const meses = Math.floor(dias / 30);
  return meses === 1 ? "há 1 mês" : `há ${meses} meses`;
}

function inicioDoDia(data: Date): number {
  return new Date(
    data.getFullYear(),
    data.getMonth(),
    data.getDate()
  ).getTime();
}

/** "Casa Ipê Amarelo" → "casa-ipe-amarelo": endereço público da ficha. */
export function slugDoNome(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** "1236448899" → "(12) 3644-8899"; o celular com 9 dígitos também. */
export function formatarTelefone(digitos: string): string {
  const d = digitos.replace(/\D/g, "");
  if (d.length === 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length === 11)
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  return digitos;
}
