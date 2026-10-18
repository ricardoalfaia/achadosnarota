import type { ReactNode } from "react";

/**
 * Remontado a cada navegação: a tela nova entra com um esmaecer curto. Só
 * opacidade, para não criar um bloco de contenção que quebre o `fixed` e o
 * `sticky` de dentro (barra da ficha, foto do desktop).
 */
export default function TemplateDoApp({ children }: { children: ReactNode }) {
  return <div className="animate-pagina">{children}</div>;
}
