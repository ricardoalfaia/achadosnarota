import type { FiltroDoCatalogo } from "./tipos";

// Os filtros da exploração moram na URL (P07: navegáveis, compartilháveis e
// renderizados no servidor). Aqui eles são lidos e validados; qualquer valor
// fora da regra é ignorado, nunca repassado ao banco como veio.

const SLUG = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;
const TAMANHO_MAXIMO_DA_BUSCA = 80;

type Parametros = Record<string, string | string[] | undefined>;

function primeiro(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

function slugValido(valor: string | undefined): string | undefined {
  const v = valor?.trim().toLowerCase();
  return v && SLUG.test(v) ? v : undefined;
}

/** Busca livre: sem espaços repetidos, sem caracteres de controle, até 80. */
export function normalizarBusca(valor: string | undefined): string | undefined {
  const limpa = valor
    ?.replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, TAMANHO_MAXIMO_DA_BUSCA)
    .trim();
  return limpa ? limpa : undefined;
}

export function lerFiltro(parametros: Parametros): FiltroDoCatalogo {
  const categoria = slugValido(primeiro(parametros.categoria));
  const cidade = slugValido(primeiro(parametros.cidade));
  const busca = normalizarBusca(primeiro(parametros.q));
  return {
    ...(categoria ? { categoria } : {}),
    ...(cidade ? { cidade } : {}),
    ...(busca ? { busca } : {}),
  };
}

export type MudancaDoFiltro = Partial<
  Record<keyof FiltroDoCatalogo, string | undefined>
>;

/** Os parâmetros de URL do filtro, os mesmos na página e no BFF. */
export function parametrosDoFiltro(filtro: FiltroDoCatalogo): string {
  const parametros = new URLSearchParams();
  if (filtro.busca) parametros.set("q", filtro.busca);
  if (filtro.categoria) parametros.set("categoria", filtro.categoria);
  if (filtro.cidade) parametros.set("cidade", filtro.cidade);
  return parametros.toString();
}

/** O filtro com a mudança aplicada. */
export function aplicarMudanca(
  atual: FiltroDoCatalogo,
  mudanca: MudancaDoFiltro
): FiltroDoCatalogo {
  const proximo = { ...atual, ...mudanca };
  return {
    ...(proximo.categoria ? { categoria: proximo.categoria } : {}),
    ...(proximo.cidade ? { cidade: proximo.cidade } : {}),
    ...(proximo.busca ? { busca: proximo.busca } : {}),
  };
}

/** O endereço da exploração com o filtro trocado: `/?categoria=cafes&q=serra`. */
export function hrefDoFiltro(
  atual: FiltroDoCatalogo,
  mudanca: MudancaDoFiltro
): string {
  const texto = parametrosDoFiltro(aplicarMudanca(atual, mudanca));
  return texto ? `/?${texto}` : "/";
}

/** Dois filtros pedem os mesmos lugares? */
export function mesmoFiltro(a: FiltroDoCatalogo, b: FiltroDoCatalogo): boolean {
  return parametrosDoFiltro(a) === parametrosDoFiltro(b);
}

/** O filtro está vazio (a página inicial sem nada escolhido)? */
export function semFiltro(filtro: FiltroDoCatalogo): boolean {
  return !filtro.categoria && !filtro.cidade && !filtro.busca;
}

/**
 * O termo de busca como padrão do ILIKE, com `%` e `_` escapados: quem busca
 * "50%" procura o texto, não um curinga.
 */
export function padraoDeBusca(busca: string): string {
  return `%${busca.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}
