import Link from "next/link";
import { cn } from "@achados/ui/estilos";
import { ChevronsLeft } from "lucide-react";

import { ehRotaAtual, ROTAS } from "@/shared/rotas";
import { ICONE_DA_NAVEGACAO } from "./icones-da-navegacao";
import { Marca } from "./marca";
import { NAVEGACAO, type ItemDeNavegacao } from "./navegacao";

/**
 * O menu lateral: claro, com a marca no topo, as seções do painel e o botão
 * de recolher no rodapé. No desktop recolhe para a faixa só com ícones; no
 * celular é uma gaveta que entra pela esquerda. O que vale em cada largura é
 * CSS (`lg:`), então a página já chega do servidor no estado certo.
 */
export function MenuLateral({
  caminho,
  recolhido,
  gavetaAberta,
  aoAlternarRecolhido,
}: {
  caminho: string;
  recolhido: boolean;
  gavetaAberta: boolean;
  aoAlternarRecolhido: () => void;
}) {
  return (
    <aside
      id="menu-lateral"
      aria-label="Menu do painel"
      data-recolhido={recolhido || undefined}
      className={cn(
        "group/menu z-50 flex h-dvh w-68 shrink-0 flex-col border-r border-border bg-surface transition-[width,translate,visibility] duration-240 ease-smooth",
        "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:shadow-xl",
        gavetaAberta
          ? "max-lg:translate-x-0"
          : "max-lg:invisible max-lg:-translate-x-full",
        "lg:data-recolhido:w-20"
      )}
    >
      <div className="flex h-18 shrink-0 items-center px-5 lg:group-data-recolhido/menu:justify-center lg:group-data-recolhido/menu:px-2">
        <Link
          href={ROTAS.inicio}
          aria-label="Ir para o início do painel"
          className="rounded-control outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <Marca className="lg:group-data-recolhido/menu:hidden" />
          <Marca
            somenteSimbolo
            className="hidden lg:group-data-recolhido/menu:inline-flex"
          />
        </Link>
      </div>

      <nav
        aria-label="Seções do painel"
        className="scrollbar-none flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4 lg:group-data-recolhido/menu:px-2"
      >
        {NAVEGACAO.map((secao) => (
          <div key={secao.id} className="flex flex-col gap-1">
            {secao.titulo && (
              <p className="px-3 pb-1 text-2xs font-bold tracking-[0.12em] text-foreground-subtle uppercase lg:group-data-recolhido/menu:sr-only">
                {secao.titulo}
              </p>
            )}
            {secao.itens.map((item) => (
              <ItemDoMenu
                key={item.id}
                item={item}
                atual={ehRotaAtual(item.href, caminho)}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="hidden shrink-0 border-t border-border p-3 lg:block">
        <button
          type="button"
          onClick={aoAlternarRecolhido}
          aria-pressed={recolhido}
          aria-controls="menu-lateral"
          title={`${recolhido ? "Expandir" : "Recolher"} menu (Ctrl+B)`}
          className="flex w-full cursor-pointer items-center gap-3 rounded-control px-3 py-2.5 text-sm font-semibold text-foreground-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring lg:group-data-recolhido/menu:justify-center"
        >
          <ChevronsLeft
            aria-hidden="true"
            className="size-5 shrink-0 transition-transform duration-240 group-data-recolhido/menu:rotate-180"
          />
          <span className="group-data-recolhido/menu:sr-only">
            {recolhido ? "Expandir menu" : "Recolher menu"}
          </span>
        </button>
      </div>
    </aside>
  );
}

function ItemDoMenu({
  item,
  atual,
}: {
  item: ItemDeNavegacao;
  atual: boolean;
}) {
  const Icone = ICONE_DA_NAVEGACAO[item.id];
  return (
    <Link
      href={item.href}
      aria-current={atual ? "page" : undefined}
      title={item.rotulo}
      className={cn(
        "group/item relative flex items-center gap-3 rounded-control px-3 py-2.5 text-[15px] font-semibold text-foreground-muted transition-colors duration-150 outline-none hover:bg-surface-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring",
        "lg:group-data-recolhido/menu:justify-center lg:group-data-recolhido/menu:px-0",
        atual &&
          "bg-primary-subtle text-primary hover:bg-primary-subtle hover:text-primary"
      )}
    >
      {atual && (
        <span
          aria-hidden="true"
          className="absolute inset-y-2 -left-3 w-1 rounded-r-full bg-brand-gradient lg:group-data-recolhido/menu:-left-2"
        />
      )}
      <Icone aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.9} />
      <span className="truncate lg:group-data-recolhido/menu:sr-only">
        {item.rotulo}
      </span>
      {item.emConstrucao && (
        <span className="ml-auto rounded-full bg-surface-hover px-1.5 py-px text-2xs font-bold text-foreground-subtle lg:group-data-recolhido/menu:hidden">
          Em breve
        </span>
      )}
    </Link>
  );
}
