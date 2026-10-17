"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@meuproduto/ui/estilos";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import { Marca } from "@/shared/marca";
import { usePreferencias } from "@/shared/preferencias/preferencias-provider";
import { rotaDoTenant } from "@/shared/rotas";
import { ICONE_DE_NAVEGACAO } from "../icones-de-navegacao";
import {
  ehItemAtual,
  hrefDoItem,
  NAVEGACAO,
  type ItemDeNavegacao,
} from "../navegacao";

/**
 * O menu lateral do mockup: claro, com borda à direita, a marca no topo, o
 * botão de recolher e os itens planos. Recolhido, fica só com os ícones. O
 * estado recolhido é preferência do usuário (cookie) e já vem do servidor,
 * sem saltar na primeira pintura.
 */
export function MenuLateral({ slug }: { slug: string }) {
  const t = useTranslations("Casca");
  const caminho = usePathname();
  const { preferencias, mudar } = usePreferencias();
  const recolhido = preferencias.menuRecolhido;

  return (
    <aside
      aria-label={t("menuLateral")}
      data-recolhido={recolhido || undefined}
      className={cn(
        "sticky top-0 z-40 flex h-screen shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 ease-smooth",
        recolhido ? "w-18" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex h-18 items-center",
          recolhido
            ? "flex-col justify-center gap-1 px-2"
            : "justify-between px-5"
        )}
      >
        <Link
          href={rotaDoTenant(slug, "/")}
          aria-label={t("irParaOInicio")}
          className="rounded-control"
        >
          <Marca somenteEmblema={recolhido} />
        </Link>
        <button
          type="button"
          aria-label={recolhido ? t("expandirMenu") : t("recolherMenu")}
          title={recolhido ? t("expandirMenu") : t("recolherMenu")}
          aria-pressed={recolhido}
          onClick={() => mudar("menuRecolhido", !recolhido)}
          className="flex size-8 cursor-pointer items-center justify-center rounded-control text-foreground-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          <ChevronLeft
            aria-hidden="true"
            className={cn(
              "size-4.5 transition-transform duration-200",
              recolhido && "rotate-180"
            )}
          />
        </button>
      </div>

      <nav
        aria-label={t("menuPrincipal")}
        className={cn(
          "flex flex-1 flex-col gap-1 overflow-y-auto py-3",
          recolhido ? "items-center px-2" : "px-3"
        )}
      >
        {NAVEGACAO.map((item) => (
          <ItemDoMenu
            key={item.id}
            item={item}
            href={hrefDoItem(slug, item)}
            recolhido={recolhido}
            atual={ehItemAtual(slug, item, caminho)}
          />
        ))}
      </nav>
    </aside>
  );
}

function ItemDoMenu({
  item,
  href,
  recolhido,
  atual,
}: {
  item: ItemDeNavegacao;
  href: string;
  recolhido: boolean;
  atual: boolean;
}) {
  const t = useTranslations("Navegacao");
  const rotulo = t(item.id);
  const Icone = ICONE_DE_NAVEGACAO[item.id];

  return (
    <Link
      href={href}
      aria-current={atual ? "page" : undefined}
      // Recolhido, o nome sai da tela: fica no rótulo e na dica.
      aria-label={recolhido ? rotulo : undefined}
      title={recolhido ? rotulo : undefined}
      className={cn(
        "flex items-center gap-3 rounded-control text-[15px] font-medium text-foreground-muted transition-colors duration-150 hover:bg-surface-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring",
        recolhido ? "size-11 justify-center" : "px-3.5 py-2.5",
        atual &&
          "bg-primary-subtle text-primary hover:bg-primary-subtle hover:text-primary"
      )}
    >
      <Icone aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.8} />
      {!recolhido && <span className="truncate">{rotulo}</span>}
    </Link>
  );
}
