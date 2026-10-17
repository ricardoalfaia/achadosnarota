"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { I18nProviderProps } from "fumadocs-ui/contexts/i18n";
import { RootProvider } from "fumadocs-ui/provider/next";

import { ehIdioma, trocarIdioma, type Idioma } from "./idiomas";

type Props = {
  idioma: Idioma;
  /** Idiomas disponíveis e textos do Fumadocs, montados no servidor. */
  i18n: Omit<I18nProviderProps, "children" | "onLocaleChange">;
  children: ReactNode;
};

/** Tema, busca e idioma do Fumadocs para a aplicação inteira. */
export function Provedores({ idioma, i18n, children }: Props) {
  const caminho = usePathname();

  return (
    <RootProvider
      i18n={{
        ...i18n,
        // Trocar de idioma recarrega a página: o layout raiz muda de idioma e,
        // remontado no navegador, o provedor de tema renderizaria seu <script>
        // de novo, o que o React acusa como erro.
        onLocaleChange: (novo) => {
          if (ehIdioma(novo))
            window.location.assign(trocarIdioma(caminho, idioma, novo));
        },
      }}
      // `data-theme` troca os tokens do Achados na Rota; `class`, os estilos do Fumadocs.
      theme={{ attribute: ["class", "data-theme"] }}
    >
      {children}
    </RootProvider>
  );
}
