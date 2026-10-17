"use client";

import { Activity, useState, type ReactNode } from "react";

import type { Sessao, TenantDaLista } from "@/shared/sessao/sessao";
import { FaixaDoTopo } from "./faixa-do-topo/faixa-do-topo";
import { MenuLateral } from "./menu-lateral/menu-lateral";
import { TrilhaDeNavegacao } from "./trilha-de-navegacao";

/**
 * A estrutura da tela, como no mockup do painel: menu lateral claro à
 * esquerda e, ao lado, a faixa do topo, a trilha e o conteúdo. Em telas
 * estreitas o botão da faixa esconde o menu; com `Activity` ele volta como
 * estava.
 */
export function Casca({
  sessao,
  slug,
  tenants,
  children,
}: {
  sessao: Sessao;
  /** O tenant ativo, que entra nos endereços da navegação (`rotaDoTenant`). */
  slug: string;
  /** Os tenants de quem entrou, para o seletor da faixa (sem ids). */
  tenants: readonly TenantDaLista[];
  children: ReactNode;
}) {
  const [menuVisivel, setMenuVisivel] = useState(true);

  return (
    <div className="relative flex min-h-screen w-full bg-background">
      <Activity mode={menuVisivel ? "visible" : "hidden"}>
        <MenuLateral slug={slug} />
      </Activity>
      <div className="relative flex min-w-0 flex-1 flex-col">
        <FaixaDoTopo
          sessao={sessao}
          tenants={tenants}
          menuVisivel={menuVisivel}
          aoAlternarMenu={() => setMenuVisivel((v) => !v)}
        />
        <main id="conteudo" className="flex-1 px-8 py-7 max-sm:px-4">
          <TrilhaDeNavegacao slug={slug} />
          {children}
        </main>
      </div>
    </div>
  );
}
