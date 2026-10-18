import type { ReactNode } from "react";
import { Crown } from "lucide-react";

import { IconeDoBeneficio, type Beneficio } from "@/features/catalogo";

const TIPO: Record<Beneficio["tipo"], string> = {
  discount: "Desconto",
  courtesy: "Cortesia",
};

/**
 * Um benefício na ficha, com cara de ingresso: o canhoto em degradê com o
 * ícone e o tipo, o picote com os recortes e, à direita, o título, as regras
 * completas (mostradas antes do resgate, docs/produto/08) e a ação.
 */
export function CartaoDeBeneficio({
  beneficio,
  acao,
}: {
  beneficio: Beneficio;
  acao: ReactNode;
}) {
  return (
    <li className="relative flex overflow-hidden rounded-3xl bg-surface shadow-[0_12px_28px_-18px_rgb(212_68_15/0.55)] ring-1 ring-primary-border">
      <div className="flex w-24 shrink-0 flex-col items-center justify-center gap-1.5 bg-brand-gradient px-2 py-4 text-white">
        <IconeDoBeneficio chave={beneficio.icone} className="size-8" />
        <span className="text-[11px] font-extrabold tracking-[0.12em] uppercase">
          {TIPO[beneficio.tipo]}
        </span>
      </div>
      {/* O picote: linha tracejada com dois recortes na cor do fundo. */}
      <div aria-hidden="true" className="relative w-0">
        <span className="absolute inset-y-3 -left-px border-l-2 border-dashed border-white/70" />
        <span className="absolute -top-2.5 -left-2.5 size-5 rounded-full bg-background" />
        <span className="absolute -bottom-2.5 -left-2.5 size-5 rounded-full bg-background" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 p-4">
        <h3 className="text-base leading-snug font-extrabold text-foreground">
          {beneficio.titulo}
        </h3>
        <p className="text-sm leading-snug text-foreground-muted">
          {beneficio.regras}
        </p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 text-xs font-bold text-primary">
            <Crown aria-hidden="true" className="size-3.5 text-star" />
            Passaporte
          </span>
          {acao}
        </div>
      </div>
    </li>
  );
}
