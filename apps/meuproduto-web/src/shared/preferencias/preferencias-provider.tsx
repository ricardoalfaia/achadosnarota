"use client";

import {
  createContext,
  use,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

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
  /** O servidor está refazendo a página no novo idioma. */
  trocandoDeIdioma: boolean;
};

const PreferenciasContext = createContext<Contexto | null>(null);

/**
 * Guarda as preferências de quem usa o sistema. O valor inicial vem dos
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
  const [trocandoDeIdioma, comoTransicao] = useTransition();
  const router = useRouter();

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
    // Os textos vêm do servidor: trocar de idioma pede a página de novo. Como
    // transição, a tela atual continua utilizável enquanto a nova chega.
    if (chave === "idioma") comoTransicao(() => router.refresh());
  }

  return (
    <PreferenciasContext value={{ preferencias, mudar, trocandoDeIdioma }}>
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
