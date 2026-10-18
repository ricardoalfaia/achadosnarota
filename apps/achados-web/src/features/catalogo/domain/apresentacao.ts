import type { Beneficio, PeriodoDeUso, Selo } from "./tipos";

// Como os dados do catálogo aparecem na tela. Funções puras e testáveis.

/** "Pindamonhangaba" + "SP" → "Pindamonhangaba - SP", como no protótipo. */
export function localDoLugar(cidade: string, uf: string): string {
  return `${cidade} - ${uf}`;
}

export const ROTULO_DO_SELO: Record<Selo, string> = {
  featured: "Destaque",
  beloved: "Mais querido",
  verified: "Verificado",
  new: "Novo",
};

/** O tom da Etiqueta de cada selo: laranja, céu, verde e asfalto. */
export const TOM_DO_SELO = {
  featured: "marca",
  beloved: "info",
  verified: "sucesso",
  new: "escuro",
} as const satisfies Record<Selo, string>;

/**
 * Telefone brasileiro só com dígitos para exibição: "1236448899" →
 * "(12) 3644-8899"; celular com 11 dígitos → "(12) 99123-4567". Fora desses
 * tamanhos, devolve como veio.
 */
export function telefoneParaExibir(digitos: string): string {
  const d = digitos.replace(/\D/g, "");
  if (d.length === 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length === 11)
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  return digitos;
}

/** `tel:` com o código do país, para o botão Ligar. */
export function hrefDoTelefone(digitos: string): string {
  const d = digitos.replace(/\D/g, "");
  return `tel:+55${d}`;
}

/**
 * O endereço no Google Maps, para o botão Como chegar. Só a busca pública
 * pelo endereço e nome: nenhuma coordenada ou dado da pessoa vai na URL.
 */
export function hrefComoChegar(nome: string, endereco: string): string {
  const consulta = encodeURIComponent(`${nome}, ${endereco}`);
  return `https://www.google.com/maps/search/?api=1&query=${consulta}`;
}

const MES_E_ANO = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "2026-09-14" → "setembro de 2026", para "Visita em setembro de 2026". */
export function mesDaVisita(dataIso: string): string {
  return MES_E_ANO.format(new Date(`${dataIso}T00:00:00Z`));
}

/** Endereço público do site, sem o esquema: "example.com/rancho". */
export function siteParaExibir(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

const NO_PERIODO: Record<Exclude<PeriodoDeUso, "unlimited">, string> = {
  day: "por dia",
  week: "por semana",
  month: "por mês",
  year: "por ano",
};

/** A regra de uso em linguagem de gente: "1 vez por ano", "Sem limite de usos". */
export function textoDaRegraDeUso({
  limite,
  periodo,
}: Pick<Beneficio, "limite" | "periodo">): string {
  if (periodo === "unlimited") return "Sem limite de usos";
  return `${limite} ${limite === 1 ? "vez" : "vezes"} ${NO_PERIODO[periodo]}`;
}
