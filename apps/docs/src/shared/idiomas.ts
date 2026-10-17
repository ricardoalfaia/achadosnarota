import { defineI18n } from "fumadocs-core/i18n";

// Os mesmos idiomas do sistema (ADR-0017). O idioma é o começo do endereço:
// /pt-BR/docs em português, /en/docs em inglês.
export const i18n = defineI18n({
  defaultLanguage: "pt-BR",
  languages: ["pt-BR", "en"],
});

export type Idioma = (typeof i18n.languages)[number];

export function ehIdioma(valor: string): valor is Idioma {
  return i18n.languages.some((idioma) => idioma === valor);
}

/** O endereço de `caminho` no idioma: `/docs` vira `/en/docs`. */
export function comIdioma(idioma: Idioma, caminho: `/${string}`): string {
  return caminho === "/" ? `/${idioma}` : `/${idioma}${caminho}`;
}

/** O endereço da mesma página em outro idioma, a partir do endereço atual. */
export function trocarIdioma(
  caminho: string,
  atual: Idioma,
  novo: Idioma
): string {
  const prefixo = `/${atual}`;
  const temPrefixo = caminho === prefixo || caminho.startsWith(`${prefixo}/`);
  const semIdioma = temPrefixo ? caminho.slice(prefixo.length) : caminho;
  return comIdioma(novo, semIdioma === "" ? "/" : (semIdioma as `/${string}`));
}
