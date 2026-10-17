import { Esqueleto } from "@achados/ui";

import { EsqueletoDaExploracao, EsqueletoDaLista } from "@/features/catalogo";
import { Marca } from "@/shared/casca/marca";

/**
 * Explorar carregando. O cabeçalho mostra a marca e o avatar em esqueleto
 * (não "Entrar"), para quem está logado não ver o botão piscar.
 */
export default function CarregandoExplorar() {
  return (
    <div aria-busy="true" aria-label="Carregando">
      <div className="flex items-center justify-between border-b border-border bg-header px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 lg:hidden">
        <Marca />
        <div className="flex items-center gap-2.5">
          <Esqueleto className="size-8 rounded-full" />
          <Esqueleto className="size-8 rounded-full" />
        </div>
      </div>
      <div className="lg:hidden">
        <EsqueletoDaExploracao />
      </div>
      <Esqueleto className="hidden h-[640px] rounded-none lg:block" />
      <div className="px-4 lg:mx-auto lg:max-w-7xl lg:px-8 lg:py-16">
        <EsqueletoDaLista />
      </div>
    </div>
  );
}
