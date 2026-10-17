import type { Tema } from "@meuproduto/ui";

// As preferências de quem usa o sistema: regras puras, sem React e sem Next.
// Cada preferência fica em um cookie, lido no servidor para a página já chegar
// no tema, no idioma e com o menu no estado escolhidos.

export const IDIOMAS = ["pt-BR", "en"] as const;
export type Idioma = (typeof IDIOMAS)[number];
export const IDIOMA_PADRAO: Idioma = "pt-BR";

/** Código curto de cada idioma, para o selo do seletor. */
export const CODIGO_DO_IDIOMA: Record<Idioma, string> = {
  "pt-BR": "PT",
  en: "EN",
};

export type Preferencias = {
  tema: Tema;
  idioma: Idioma;
  /** O menu lateral fica só com os ícones. */
  menuRecolhido: boolean;
};

export const PREFERENCIAS_PADRAO: Preferencias = {
  tema: "auto",
  idioma: IDIOMA_PADRAO,
  menuRecolhido: false,
};

/** Nome do cookie de cada preferência. */
export const COOKIES: Record<keyof Preferencias, string> = {
  tema: "meuproduto-tema",
  idioma: "meuproduto-idioma",
  menuRecolhido: "meuproduto-menu",
};

const UM_ANO_EM_SEGUNDOS = 60 * 60 * 24 * 365;

export function lerTema(valor: string | undefined): Tema {
  return valor === "light" || valor === "dark" ? valor : "auto";
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
    menuRecolhido: cookie(COOKIES.menuRecolhido) === "recolhido",
  };
}

/** `data-theme` do `<html>`: ausente em `auto`, para o sistema operacional decidir. */
export function atributoDoTema(tema: Tema): "light" | "dark" | undefined {
  return tema === "auto" ? undefined : tema;
}

/**
 * Texto para `document.cookie`. São preferências visuais, sem dado sensível, e
 * por isso legíveis pelo navegador.
 */
export function cookieDaPreferencia<C extends keyof Preferencias>(
  chave: C,
  valor: Preferencias[C]
): string {
  const texto =
    typeof valor === "boolean" ? (valor ? "recolhido" : "aberto") : valor;
  return `${COOKIES[chave]}=${texto}; Path=/; Max-Age=${UM_ANO_EM_SEGUNDOS}; SameSite=Lax`;
}
