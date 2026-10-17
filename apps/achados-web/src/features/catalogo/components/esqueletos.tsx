import { Esqueleto } from "@achados/ui";

/**
 * Os esqueletos das telas de descoberta, na forma final de cada uma (ADR-0016:
 * a tela não pula quando o conteúdo entra). Decorativos: quem os usa marca a
 * região com `aria-busy`.
 */

/** O topo de Explorar: busca, categorias e o cartão "Descubra". */
export function EsqueletoDaExploracao() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Esqueleto className="h-12 rounded-2xl" />
      <div className="flex gap-2 overflow-hidden">
        {["w-22", "w-32", "w-20", "w-18", "w-24"].map((largura) => (
          <Esqueleto
            key={largura}
            className={`h-9 shrink-0 rounded-2xl ${largura}`}
          />
        ))}
      </div>
      <Esqueleto className="h-[148px] rounded-3xl" />
      <Esqueleto className="h-4 w-36" />
    </div>
  );
}

/** Uma lista de linhas com foto à esquerda (favoritos, cupons). */
export function EsqueletoDeLinhas({ quantidade = 3 }: { quantidade?: number }) {
  return (
    <ul className="flex flex-col gap-3">
      {Array.from({ length: quantidade }, (_, i) => (
        <li
          key={i}
          className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
        >
          <Esqueleto className="size-14 shrink-0 rounded-xl" />
          <div className="flex flex-1 flex-col gap-2">
            <Esqueleto className="h-3.5 w-3/4" />
            <Esqueleto className="h-3 w-1/2" />
            <Esqueleto className="h-3 w-1/3" />
          </div>
        </li>
      ))}
    </ul>
  );
}
