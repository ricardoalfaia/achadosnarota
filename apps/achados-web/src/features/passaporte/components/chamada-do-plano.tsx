import Link from "next/link";
import { ArrowRight, Crown } from "lucide-react";

import { ROTAS } from "@/shared/rotas";
import { formatarPreco, type Plano } from "../domain/passaporte";

/**
 * O convite ao passaporte junto do cartão no topo desktop, com o preço vindo
 * do banco. Sem plano cadastrado, convida sem preço.
 */
export function ChamadaDoPlano({ plano }: { plano: Plano | null }) {
  return (
    <Link
      href={ROTAS.passaporte}
      className="group inline-flex items-center gap-3 rounded-full border border-white/20 bg-[rgb(15_23_42/0.6)] py-2 pr-4 pl-2 text-sm text-white shadow-xl backdrop-blur-md transition-colors outline-none hover:border-white/40 focus-visible:outline-2 focus-visible:outline-white"
    >
      <span className="flex size-8 items-center justify-center rounded-full bg-accent-on-dark/20 text-accent-on-dark">
        <Crown aria-hidden="true" className="size-4" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[11px] font-semibold text-white/70">
          Passaporte anual
        </span>
        <span className="font-extrabold">
          {plano
            ? `${formatarPreco(plano.precoEmCentavos, plano.moeda)} por ano`
            : "Conheça os benefícios"}
        </span>
      </span>
      <ArrowRight
        aria-hidden="true"
        className="size-4 transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}
