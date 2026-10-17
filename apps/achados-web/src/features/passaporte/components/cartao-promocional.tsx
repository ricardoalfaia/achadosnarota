import Image from "next/image";
import { cn } from "@achados/ui/estilos";
import { Crown } from "lucide-react";

/**
 * O cartão do passaporte como peça de vitrine (topo e chamada da versão
 * desktop): sem titular, código ou validade, porque não é o passaporte de
 * ninguém. Levemente inclinado; endireita ao passar o mouse.
 */
export function CartaoPromocionalDoPassaporte({
  inclinacao = "direita",
  className,
}: {
  inclinacao?: "direita" | "forte";
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative w-80 rounded-3xl border border-white/20 bg-passport p-6 text-white shadow-2xl transition-transform duration-500 hover:rotate-0",
        inclinacao === "forte" ? "w-64 rotate-6 p-5" : "rotate-3",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <Image
          src="/marca/simbolo.png"
          alt=""
          width={183}
          height={144}
          className={inclinacao === "forte" ? "h-8 w-auto" : "h-12 w-auto"}
        />
        <span className="flex items-center gap-1.5 rounded-full border border-accent-on-dark/40 bg-accent-on-dark/20 px-3 py-1 text-xs font-extrabold text-accent-on-dark">
          <Crown className="size-3" />
          Passaporte
        </span>
      </div>
      <div className={inclinacao === "forte" ? "mt-4" : "mt-8"}>
        <p className="text-xs font-semibold tracking-widest text-passport-muted uppercase">
          Passaporte oficial
        </p>
        <p className="mt-1 text-2xl font-extrabold tracking-tight">
          Achados na Rota
        </p>
        <p className="mt-1 text-xs font-medium text-accent-on-dark">
          Benefícios para quem está na rota
        </p>
      </div>
      <div className="mt-8 flex items-center justify-between border-t border-passport-border pt-4 text-[11px] text-passport-muted">
        <span>Anual</span>
        <span className="font-bold text-white">Curadoria independente</span>
      </div>
    </div>
  );
}
