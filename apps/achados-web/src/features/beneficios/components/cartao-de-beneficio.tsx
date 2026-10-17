import type { ReactNode } from "react";
import { CaixaDeIcone } from "@achados/ui";

import { IconeDoBeneficio, type Beneficio } from "@/features/catalogo";

/**
 * Um benefício na ficha do lugar: o ícone no quadrado laranja, o título, as
 * regras completas (mostradas antes do resgate, docs/produto/08) e a ação.
 */
export function CartaoDeBeneficio({
  beneficio,
  acao,
}: {
  beneficio: Beneficio;
  acao: ReactNode;
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl border border-primary-border bg-primary-subtle p-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <CaixaDeIcone tom="marca">
          <IconeDoBeneficio chave={beneficio.icone} />
        </CaixaDeIcone>
        <div className="min-w-0">
          <h3 className="text-xs leading-tight font-bold text-foreground">
            {beneficio.titulo}
          </h3>
          <p className="mt-0.5 text-[11px] leading-snug text-foreground-muted">
            {beneficio.regras}
          </p>
        </div>
      </div>
      <div className="shrink-0">{acao}</div>
    </li>
  );
}
