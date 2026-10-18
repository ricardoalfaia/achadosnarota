"use client";

import { createContext, use, useState, type ReactNode } from "react";

import {
  atributoDoTema,
  cookieDaPreferencia,
  type Preferencias,
} from "./preferencias";

type Contexto = {
  preferencias: Preferencias;
  mudar: <C extends keyof Preferencias>(
    chave: C,
    valor: Preferencias[C]
  ) => void;
};

const PreferenciasContext = createContext<Contexto | null>(null);

/**
 * Guarda as preferências de quem usa o painel. O valor inicial vem dos
 * cookies, lidos no layout raiz; cada mudança grava o cookie e vale na hora.
 */
export function PreferenciasProvider({
  iniciais,
  children,
}: {
  iniciais: Preferencias;
  children: ReactNode;
}) {
  const [preferencias, setPreferencias] = useState(iniciais);

  function mudar<C extends keyof Preferencias>(
    chave: C,
    valor: Preferencias[C]
  ) {
    setPreferencias((atuais) => ({ ...atuais, [chave]: valor }));
    document.cookie = cookieDaPreferencia(chave, valor);

    if (chave === "tema") {
      const atributo = atributoDoTema(valor as Preferencias["tema"]);
      if (atributo) document.documentElement.dataset.theme = atributo;
      else delete document.documentElement.dataset.theme;
    }
  }

  return (
    <PreferenciasContext value={{ preferencias, mudar }}>
      {children}
    </PreferenciasContext>
  );
}

/** As preferências atuais e como mudá-las, em componentes cliente. */
export function usePreferencias(): Contexto {
  const contexto = use(PreferenciasContext);
  if (!contexto) {
    throw new Error(
      "usePreferencias precisa do PreferenciasProvider do layout raiz."
    );
  }
  return contexto;
}
