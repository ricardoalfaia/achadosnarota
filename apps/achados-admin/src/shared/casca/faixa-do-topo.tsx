"use client";

import { useRef } from "react";
import { BotaoDeIcone, CampoDeBusca } from "@achados/ui";
import { useKeyboardShortcut } from "@achados/ui/hooks";
import { Bell, Menu } from "lucide-react";

import type { PessoaDaEquipe } from "@/shared/sessao/sessao";
import { MenuDoUsuario } from "./menu-do-usuario";

/**
 * A faixa do topo: o botão da gaveta (celular), a busca e, à direita, as
 * notificações e o avatar. A busca ainda não tem destino: o texto digitado
 * não vai para a URL nem para telemetria (ADR-0006, pendência de busca).
 */
export function FaixaDoTopo({
  pessoa,
  gavetaAberta,
  aoAlternarGaveta,
}: {
  pessoa: PessoaDaEquipe;
  gavetaAberta: boolean;
  aoAlternarGaveta: () => void;
}) {
  const busca = useRef<HTMLInputElement>(null);

  // Ctrl+K leva à busca de qualquer tela.
  useKeyboardShortcut({ key: "k", ctrl: true }, () => busca.current?.focus(), {
    preventDefault: true,
  });

  return (
    <header className="relative z-30 flex h-18 shrink-0 items-center gap-3 border-b border-border bg-background/85 px-6 backdrop-blur-md max-sm:px-4">
      <BotaoDeIcone
        variante="fantasma"
        rotulo={gavetaAberta ? "Fechar menu" : "Abrir menu"}
        aria-expanded={gavetaAberta}
        aria-controls="menu-lateral"
        onClick={aoAlternarGaveta}
        icone={<Menu />}
        className="lg:hidden"
      />

      <form
        role="search"
        onSubmit={(evento) => evento.preventDefault()}
        className="max-w-xl flex-1 max-sm:hidden"
      >
        <CampoDeBusca
          ref={busca}
          rotulo="Buscar casas, promoções ou parceiros"
          placeholder="Buscar casas, promoções ou parceiros..."
          atalho="Ctrl K"
          className="bg-surface"
        />
      </form>

      <div className="ml-auto flex items-center gap-2">
        <BotaoDeIcone
          variante="fantasma"
          rotulo="Notificações (nenhuma)"
          icone={<Bell />}
        />
        <MenuDoUsuario pessoa={pessoa} />
      </div>
    </header>
  );
}
