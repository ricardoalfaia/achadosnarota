"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Avatar } from "@achados/ui";
import { cn, estiloDoBotao } from "@achados/ui/estilos";
import {
  ArrowRight,
  Crown,
  Heart,
  House,
  Map as IconeMapa,
  Search,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

import { ROTAS } from "@/shared/rotas";
import type { PessoaDaSessao } from "@/shared/sessao/sessao";
import { Marca } from "./marca";
import {
  useCabecalhoDesktop,
  type LinkDoCabecalho,
} from "./use-cabecalho-desktop";

const ICONES: Record<LinkDoCabecalho["id"], LucideIcon> = {
  explorar: House,
  categorias: UtensilsCrossed,
  "como-funciona": IconeMapa,
  favoritos: Heart,
  passaporte: Crown,
};

/**
 * O cabeçalho da versão desktop: a marca, a navegação numa pílula com ícones
 * (a seção atual em laranja), a busca, entrar ou o avatar, e o botão do
 * passaporte. A busca fica sempre à mão: a partir de 1280px vira um campo
 * sempre que a busca do topo da exploração não está na tela; abaixo disso, um
 * botão que leva a ela. Só aparece a partir de 1024px; abaixo disso cada tela
 * usa o cabeçalho do app.
 */
export function CabecalhoDesktop({
  pessoa,
  busca,
}: {
  pessoa: PessoaDaSessao | null;
  /** O campo de busca compacto, composto por quem monta a casca. */
  busca: ReactNode;
}) {
  const { links, mostrarBusca } = useCabecalhoDesktop();
  return (
    <header className="sticky top-0 z-40 hidden border-b border-border bg-header backdrop-blur-md lg:block">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-8 xl:gap-6">
        <Link
          href={ROTAS.explorar}
          aria-label="Achados na Rota, início"
          className="shrink-0 rounded-xl outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring [&_img]:transition-transform [&_img]:duration-300 hover:[&_img]:scale-105"
        >
          <Marca tamanho="lg" />
        </Link>

        <nav
          aria-label="Seções"
          className="flex items-center gap-0.5 rounded-full border border-border bg-surface/70 p-1 shadow-sm"
        >
          {links.map((link) => {
            const Icone = ICONES[link.id];
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={link.ativo ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold whitespace-nowrap transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring xl:px-3.5 [&_svg]:size-4",
                  link.ativo
                    ? "bg-linear-135 from-primary-solid-start to-primary-solid-end font-bold text-primary-solid-foreground shadow-glow"
                    : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
                )}
              >
                <Icone
                  aria-hidden="true"
                  className={cn(
                    "hidden",
                    mostrarBusca ? "2xl:block" : "xl:block"
                  )}
                />
                {link.rotulo}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          {mostrarBusca && <div className="hidden w-52 xl:block">{busca}</div>}
          <Link
            href="/#busca"
            aria-label="Buscar lugares"
            className={cn(
              mostrarBusca && "xl:hidden",
              "inline-flex size-10 items-center justify-center rounded-full bg-primary-subtle text-primary transition-colors outline-none hover:bg-primary-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&_svg]:size-4.5"
            )}
          >
            <Search />
          </Link>
          <span
            aria-hidden="true"
            className="hidden h-8 w-px bg-border xl:block"
          />
          {pessoa ? (
            <Link
              href={ROTAS.perfil}
              aria-label="Meu perfil"
              className="rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Avatar
                nome={pessoa.nome}
                {...(pessoa.fotoUrl ? { fotoUrl: pessoa.fotoUrl } : {})}
              />
            </Link>
          ) : (
            <Link
              href={ROTAS.entrar}
              className="px-2 text-sm font-bold text-foreground transition-colors hover:text-primary"
            >
              Entrar
            </Link>
          )}
          <Link
            href={ROTAS.passaporte}
            className={estiloDoBotao({
              tamanho: "md",
              className: "px-5 xl:px-6",
            })}
          >
            {pessoa ? "Meu passaporte" : "Assinar"}
            <ArrowRight />
          </Link>
        </div>
      </div>
    </header>
  );
}
