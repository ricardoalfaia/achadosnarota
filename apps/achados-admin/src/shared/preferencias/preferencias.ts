import type { Tema } from "@achados/ui";

// As preferências de quem usa o painel: regras puras, sem React e sem Next.
// Cada preferência fica em um cookie, lido no servidor para a página já chegar
// no tema escolhido e com o menu no estado em que foi deixado (ADR-0017,
// ADR-0018), sem saltar na primeira pintura.

export type Preferencias = {
  tema: Tema;
  /** O menu lateral recolhido na faixa só com ícones. */
  menuRecolhido: boolean;
};

/** Claro por padrão, como o app do assinante (ADR-0022). */
export const PREFERENCIAS_PADRAO: Preferencias = {
  tema: "light",
  menuRecolhido: false,
};

/** Cookies próprios do painel: não se misturam com os do app do assinante. */
export const COOKIES: Record<keyof Preferencias, string> = {
  tema: "achados-admin-tema",
  menuRecolhido: "achados-admin-menu",
};

const UM_ANO_EM_SEGUNDOS = 60 * 60 * 24 * 365;

export function lerTema(valor: string | undefined): Tema {
  return valor === "light" || valor === "dark" || valor === "auto"
    ? valor
    : PREFERENCIAS_PADRAO.tema;
}

export function lerMenuRecolhido(valor: string | undefined): boolean {
  return valor === "1";
}

/** As preferências a partir dos cookies; valor ausente ou desconhecido cai no padrão. */
export function lerPreferencias(
  cookie: (nome: string) => string | undefined
): Preferencias {
  return {
    tema: lerTema(cookie(COOKIES.tema)),
    menuRecolhido: lerMenuRecolhido(cookie(COOKIES.menuRecolhido)),
  };
}

/** `data-theme` do `<html>`: ausente em `auto`, para o sistema operacional decidir. */
export function atributoDoTema(tema: Tema): "light" | "dark" | undefined {
  return tema === "auto" ? undefined : tema;
}

function valorDoCookie<C extends keyof Preferencias>(
  chave: C,
  valor: Preferencias[C]
): string {
  if (chave === "menuRecolhido") return valor ? "1" : "0";
  return String(valor);
}

/**
 * Texto para `document.cookie`. São preferências visuais, sem dado sensível, e
 * por isso legíveis pelo navegador.
 */
export function cookieDaPreferencia<C extends keyof Preferencias>(
  chave: C,
  valor: Preferencias[C]
): string {
  return `${COOKIES[chave]}=${valorDoCookie(chave, valor)}; Path=/; Max-Age=${UM_ANO_EM_SEGUNDOS}; SameSite=Lax`;
}
