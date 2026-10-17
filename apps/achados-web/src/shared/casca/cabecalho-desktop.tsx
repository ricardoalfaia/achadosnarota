"use client";

import Link from "next/link";
import { Avatar } from "@achados/ui";
import { cn, estiloDoBotao } from "@achados/ui/estilos";
import { Search } from "lucide-react";

import { ROTAS } from "@/shared/rotas";
import type { PessoaDaSessao } from "@/shared/sessao/sessao";
import { Marca } from "./marca";
import { useCabecalhoDesktop } from "./use-cabecalho-desktop";

/**
 * O cabeçalho da versão desktop (protótipo `index.html`): marca, navegação,
 * busca, entrar ou o avatar, e o botão do passaporte. Só aparece a partir de
 * 1024px; abaixo disso cada tela usa o cabeçalho do app.
 */
export function CabecalhoDesktop({
  pessoa,
}: {
  pessoa: PessoaDaSessao | null;
}) {
  const links = useCabecalhoDesktop();
  return (
    <header className="sticky top-0 z-40 hidden border-b border-border bg-header backdrop-blur-md lg:block">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">
        <Link
          href={ROTAS.explorar}
          aria-label="Achados na Rota, início"
          className="rounded-xl outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring [&_img]:transition-transform [&_img]:duration-300 hover:[&_img]:scale-105"
        >
          <Marca tamanho="lg" />
        </Link>

        <nav aria-label="Seções" className="flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link.ativo ? "page" : undefined}
              className={cn(
                "text-sm font-semibold transition-colors outline-none hover:text-primary focus-visible:underline",
                link.ativo ? "font-bold text-primary" : "text-foreground-muted"
              )}
            >
              {link.rotulo}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/#busca"
            aria-label="Buscar lugares"
            className={estiloDoBotao({
              variante: "fantasma",
              tamanho: "sm",
              somenteIcone: true,
              className: "[&_svg]:size-4.5",
            })}
          >
            <Search />
          </Link>
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
              className="text-sm font-bold text-foreground transition-colors hover:text-primary"
            >
              Entrar
            </Link>
          )}
          <Link
            href={ROTAS.passaporte}
            className={estiloDoBotao({ tamanho: "md", className: "px-6" })}
          >
            {pessoa ? "Meu passaporte" : "Assinar"}
          </Link>
        </div>
      </div>
    </header>
  );
}
