"use client";

import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { cn } from "@achados/ui/estilos";

import { DialogoDoLeitor } from "./dialogo-do-leitor";
import {
  IconeBilhete,
  IconeCasa,
  IconeCoracao,
  IconePessoa,
  IconeVisor,
} from "./icones-da-navegacao";
import type { ItemDaNavegacao } from "./navegacao";
import { useNavegacaoInferior } from "./use-navegacao-inferior";

const ICONE: Record<
  ItemDaNavegacao["chave"],
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  explorar: IconeCasa,
  favoritos: IconeCoracao,
  passaporte: IconeBilhete,
  perfil: IconePessoa,
};

function ItemDaBarra({
  item,
  ativo,
}: {
  item: ItemDaNavegacao;
  ativo: boolean;
}) {
  const Icone = ICONE[item.chave];
  return (
    <Link
      href={item.href}
      aria-current={ativo ? "page" : undefined}
      className={cn(
        "flex min-w-[54px] flex-col items-center justify-center gap-[3px] rounded-xl py-1 transition-transform duration-200 outline-none focus-visible:outline-2 focus-visible:outline-ring active:scale-92",
        ativo ? "text-brand" : "text-chip-foreground hover:text-foreground"
      )}
    >
      <Icone className="size-6" />
      <span
        className={cn(
          "text-[11px] tracking-tight",
          ativo ? "font-bold text-primary" : "font-semibold"
        )}
      >
        {item.rotulo}
      </span>
    </Link>
  );
}

/**
 * A barra fixa no pé da tela, com os quatro destinos e o botão central do
 * leitor do passaporte, elevado e em degradê laranja, como no protótipo. Fica
 * na largura da coluna do app (até 480px) e respeita a área segura do iPhone.
 */
export function NavegacaoInferior() {
  const { ativo, leitor, antesDoLeitor, depoisDoLeitor } =
    useNavegacaoInferior();

  return (
    <>
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-[480px] items-center justify-around rounded-t-[32px] border-t border-border bg-surface px-3 pt-2.5 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-bottom-bar lg:hidden"
      >
        {antesDoLeitor.map((item) => (
          <ItemDaBarra
            key={item.chave}
            item={item}
            ativo={ativo === item.chave}
          />
        ))}
        <button
          type="button"
          onClick={leitor.on}
          aria-label="Abrir o leitor do passaporte"
          aria-haspopup="dialog"
          className="relative -top-5 -mb-5 flex size-[66px] cursor-pointer items-center justify-center rounded-full bg-[radial-gradient(circle,rgb(241_90_36/0.3)_0%,rgb(241_90_36/0.08)_68%,transparent_100%)] transition-transform duration-200 ease-spring outline-none hover:-translate-y-0.5 hover:scale-106 focus-visible:outline-2 focus-visible:outline-ring active:scale-95"
        >
          <span className="flex size-13 items-center justify-center rounded-full bg-brand-gradient text-white shadow-fab">
            <IconeVisor className="size-6" />
          </span>
        </button>
        {depoisDoLeitor.map((item) => (
          <ItemDaBarra
            key={item.chave}
            item={item}
            ativo={ativo === item.chave}
          />
        ))}
      </nav>
      <DialogoDoLeitor aberto={leitor.isOpen} aoFechar={leitor.off} />
    </>
  );
}
