import Link from "next/link";
import { estiloDoBotao } from "@achados/ui/estilos";
import { ArrowRight, Ticket } from "lucide-react";

import type { SituacaoDoResgate } from "../domain/situacao";

const ACAO: Record<SituacaoDoResgate, string> = {
  entrar: "Entrar e usar",
  assinar: "Ver como usar",
  emissaoIndisponivel: "Usar agora",
};

/**
 * O pé fixo da ficha no celular, no lugar da barra de navegação: o principal
 * benefício do lugar e o botão que leva a ele (ou a entrar, sem conta). O
 * resgate em si continua no cartão do benefício, com as regras à vista.
 */
export function BarraDoBeneficio({
  titulo,
  total,
  situacao,
  hrefDosBeneficios,
  hrefDeEntrar,
}: {
  /** O primeiro benefício ativo. */
  titulo: string;
  total: number;
  situacao: SituacaoDoResgate;
  hrefDosBeneficios: string;
  hrefDeEntrar: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px] animate-fade-in-up border-t border-border bg-surface/95 px-4 pt-3 pb-[max(0.875rem,env(safe-area-inset-bottom))] shadow-bottom-bar backdrop-blur-md lg:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 truncate text-xs font-semibold whitespace-nowrap text-foreground-muted">
            <Ticket aria-hidden="true" className="size-3.5 text-brand" />
            {total === 1
              ? "1 benefício no passaporte"
              : `${total} benefícios no passaporte`}
          </p>
          <p className="truncate text-[15px] font-extrabold text-foreground">
            {titulo}
          </p>
        </div>
        <Link
          href={situacao === "entrar" ? hrefDeEntrar : hrefDosBeneficios}
          className={estiloDoBotao({
            tamanho: "md",
            className: "shrink-0 px-5",
          })}
        >
          {ACAO[situacao]}
          <ArrowRight />
        </Link>
      </div>
    </div>
  );
}
