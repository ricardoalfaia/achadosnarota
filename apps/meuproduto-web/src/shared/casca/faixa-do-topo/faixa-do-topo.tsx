"use client";

import { useRef } from "react";
import { BotaoDeIcone, CampoDeBusca } from "@meuproduto/ui";
import { useKeyboardShortcut } from "@meuproduto/ui/hooks";
import { Bell, Menu } from "lucide-react";
import { useTranslations } from "next-intl";

import { PainelDeNotificacoes } from "@/features/notificacoes";
import type { Sessao, TenantDaLista } from "@/shared/sessao/sessao";
import { MenuDoUsuario } from "./menu-do-usuario";
import { SeletorDeTenant } from "./seletor-de-tenant";

/**
 * A faixa do topo do mockup: a busca larga à esquerda e, à direita, o sino de
 * notificações, o tenant ativo (com o seletor, se houver outros) e o avatar com o menu do usuário. Em telas estreitas aparece
 * também o botão que esconde e traz de volta o menu lateral.
 */
export function FaixaDoTopo({
  sessao,
  tenants,
  menuVisivel,
  aoAlternarMenu,
}: {
  sessao: Sessao;
  tenants: readonly TenantDaLista[];
  menuVisivel: boolean;
  aoAlternarMenu: () => void;
}) {
  const t = useTranslations("Faixa");
  const busca = useRef<HTMLInputElement>(null);

  // Ctrl+K leva à busca de qualquer tela.
  useKeyboardShortcut({ key: "k", ctrl: true }, () => busca.current?.focus(), {
    preventDefault: true,
  });

  return (
    <header className="sticky top-0 z-30 flex h-18 items-center gap-4 border-b border-border bg-background/85 px-6 backdrop-blur-md max-sm:px-4">
      <BotaoDeIcone
        variante="fantasma"
        rotulo={t("alternarMenu")}
        aria-pressed={menuVisivel}
        onClick={aoAlternarMenu}
        icone={<Menu />}
        className="lg:hidden"
      />

      {/* A busca ainda não tem para onde levar: o envio fica parado aqui. */}
      <form
        role="search"
        onSubmit={(evento) => evento.preventDefault()}
        className="max-w-2xl flex-1"
      >
        <CampoDeBusca
          ref={busca}
          rotulo={t("buscar")}
          placeholder={t("buscar")}
          atalho={t("atalhoBusca")}
          className="bg-surface"
        />
      </form>

      <div className="ml-auto flex items-center gap-3">
        <PainelDeNotificacoes
          gatilho={({ ref, aberto, pendentes, aoAlternar }) => (
            <button
              ref={ref}
              type="button"
              aria-label={t("notificacoes", { pendentes })}
              aria-expanded={aberto}
              onClick={aoAlternar}
              className="relative flex size-10 cursor-pointer items-center justify-center rounded-full text-foreground-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            >
              <Bell aria-hidden="true" className="size-5.5" strokeWidth={1.8} />
              {pendentes > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white ring-2 ring-background"
                >
                  {pendentes}
                </span>
              )}
            </button>
          )}
        />
        <SeletorDeTenant ativo={sessao.tenant} tenants={tenants} />
        <MenuDoUsuario sessao={sessao} />
      </div>
    </header>
  );
}
