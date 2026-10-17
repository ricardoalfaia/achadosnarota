import type { Tema } from "@achados/ui";

// As preferências de quem usa o app: regras puras, sem React e sem Next.
// Cada preferência fica em um cookie, lido no servidor para a página já chegar
// no tema e no idioma escolhidos.

/**
 * Só português por enquanto (ADR-0017): o mecanismo do next-intl fica, e um
 * idioma novo entra com o arquivo em `messages/` e a entrada aqui.
 */
export const IDIOMAS = ["pt-BR"] as const;
export type Idioma = (typeof IDIOMAS)[number];
export const IDIOMA_PADRAO: Idioma = "pt-BR";

/** Código curto de cada idioma, para o selo do seletor. */
export const CODIGO_DO_IDIOMA: Record<Idioma, string> = {
  "pt-BR": "PT",
};

export type Preferencias = {
  tema: Tema;
  idioma: Idioma;
};

/**
 * O tema é claro por padrão, por decisão do responsável (17/10/2026): o
 * escuro (asfalto da marca, ADR-0022) continua disponível por escolha no
 * perfil, e "auto" segue o aparelho.
 */
export const PREFERENCIAS_PADRAO: Preferencias = {
  tema: "light",
  idioma: IDIOMA_PADRAO,
};

/** Nome do cookie de cada preferência. */
export const COOKIES: Record<keyof Preferencias, string> = {
  tema: "achados-tema",
  idioma: "achados-idioma",
};

const UM_ANO_EM_SEGUNDOS = 60 * 60 * 24 * 365;

export function lerTema(valor: string | undefined): Tema {
  return valor === "light" || valor === "dark" || valor === "auto"
    ? valor
    : PREFERENCIAS_PADRAO.tema;
}

export function lerIdioma(valor: string | undefined): Idioma {
  return IDIOMAS.find((idioma) => idioma === valor) ?? IDIOMA_PADRAO;
}

/** As preferências a partir dos cookies; valor ausente ou desconhecido cai no padrão. */
export function lerPreferencias(
  cookie: (nome: string) => string | undefined
): Preferencias {
  return {
    tema: lerTema(cookie(COOKIES.tema)),
    idioma: lerIdioma(cookie(COOKIES.idioma)),
  };
}

/** `data-theme` do `<html>`: ausente em `auto`, para o sistema operacional decidir. */
export function atributoDoTema(tema: Tema): "light" | "dark" | undefined {
  return tema === "auto" ? undefined : tema;
}

const COR_DA_BARRA = { light: "#f15a24", dark: "#06131e" } as const;

/**
 * A cor da barra de status do celular (`theme-color`): laranja da marca no
 * claro, asfalto no escuro; em `auto`, uma para cada tema do aparelho.
 */
export function corDaBarra(
  tema: Tema
): string | { media: string; color: string }[] {
  if (tema !== "auto") return COR_DA_BARRA[tema];
  return [
    { media: "(prefers-color-scheme: light)", color: COR_DA_BARRA.light },
    { media: "(prefers-color-scheme: dark)", color: COR_DA_BARRA.dark },
  ];
}

/**
 * Texto para `document.cookie`. São preferências visuais, sem dado sensível, e
 * por isso legíveis pelo navegador.
 */
export function cookieDaPreferencia<C extends keyof Preferencias>(
  chave: C,
  valor: Preferencias[C]
): string {
  return `${COOKIES[chave]}=${valor}; Path=/; Max-Age=${UM_ANO_EM_SEGUNDOS}; SameSite=Lax`;
}
