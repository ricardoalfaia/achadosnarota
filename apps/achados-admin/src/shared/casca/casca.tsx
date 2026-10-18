"use client";

import type { ReactNode } from "react";
import { cn } from "@achados/ui/estilos";

import type { PessoaDaEquipe } from "@/shared/sessao/sessao";
import { FaixaDoTopo } from "./faixa-do-topo";
import { MenuLateral } from "./menu-lateral";
import { useCasca } from "./use-casca";

/**
 * A estrutura do painel (ADR-0018, aplicada à área administrativa): menu
 * lateral à esquerda e, ao lado, a faixa do topo e o conteúdo da rota. A
 * casca tem a altura da tela e o conteúdo rola por dentro, para as grades de
 * cadastro ocuparem o espaço que sobra. Só compõe; o estado mora em
 * `useCasca`.
 */
export function Casca({
  pessoa,
  children,
}: {
  pessoa: PessoaDaEquipe;
  children: ReactNode;
}) {
  const casca = useCasca();

  return (
    <div className="relative flex h-dvh w-full overflow-hidden bg-background">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-control focus:bg-surface focus:px-4 focus:py-2 focus:shadow-md"
      >
        Pular para o conteúdo
      </a>
      <MenuLateral
        caminho={casca.caminho}
        recolhido={casca.recolhido}
        gavetaAberta={casca.gavetaAberta}
        aoAlternarRecolhido={casca.alternarRecolhido}
      />
      {/* Fundo da gaveta no celular: tocar fora fecha. */}
      <div
        aria-hidden="true"
        onClick={casca.fecharGaveta}
        className={cn(
          "fixed inset-0 z-40 bg-overlay transition-opacity duration-240 lg:hidden",
          casca.gavetaAberta ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <FaixaDoTopo
          pessoa={pessoa}
          gavetaAberta={casca.gavetaAberta}
          aoAlternarGaveta={casca.alternarGaveta}
        />
        <main
          id="conteudo"
          tabIndex={-1}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto px-8 py-7 outline-none max-sm:px-4 max-sm:py-5"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
