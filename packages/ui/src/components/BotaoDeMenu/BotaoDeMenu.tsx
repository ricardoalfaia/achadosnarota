"use client";

import {
  createContext,
  use,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { useFecharAoSair } from "../../hooks/use-fechar-ao-sair";
import { usePresenca } from "../../hooks/use-presenca";
import { cn } from "../../lib/cn";
import { itemDestino } from "../../lib/navegacao";
import {
  estiloDoBotao,
  type IntencaoDoBotao,
  type TamanhoDoBotao,
  type VarianteDoBotao,
} from "../Botao";
import { CaixaSuspensa } from "../CaixaSuspensa";
import { IconeSeta } from "../Icones";
import type { Lado } from "../tipos";

type Contexto = { fechar: () => void };

const MenuContext = createContext<Contexto | null>(null);

export type BotaoDeMenuProps = {
  /** Texto do botão; com `somenteIcone`, vira o nome acessível. */
  rotulo: string;
  icone?: ReactNode;
  /** Botão quadrado só com o ícone, sem texto nem seta: ações de uma linha de tabela. */
  somenteIcone?: boolean;
  variante?: VarianteDoBotao;
  intencao?: IntencaoDoBotao;
  tamanho?: TamanhoDoBotao;
  /** De que lado do botão o menu abre. */
  lado?: Lado;
  /** Borda do botão com a qual o menu se alinha. */
  alinhamento?: "inicio" | "fim";
  desabilitado?: boolean;
  className?: string;
  /** `ItemDeMenu` e `SeparadorDeMenu`. */
  children: ReactNode;
};

/**
 * Botão que abre um menu de ações, no padrão WAI-ARIA de menu button: Enter,
 * espaço ou seta para baixo abrem; setas, Home e End percorrem os itens; Esc
 * fecha e devolve o foco ao botão.
 */
export function BotaoDeMenu({
  rotulo,
  icone,
  somenteIcone = false,
  variante = "contorno",
  intencao,
  tamanho,
  lado,
  alinhamento = "inicio",
  desabilitado,
  className,
  children,
}: BotaoDeMenuProps) {
  const [aberto, setAberto] = useState(false);
  const id = useId();
  const raiz = useRef<HTMLDivElement>(null);
  const gatilho = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const focoInicial = useRef<"primeiro" | "ultimo">("primeiro");
  const presenca = usePresenca(aberto);

  function fechar() {
    setAberto(false);
  }
  useFecharAoSair(raiz, aberto, fechar, gatilho);

  function itens(): HTMLElement[] {
    return [
      ...(menu.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not(:disabled)'
      ) ?? []),
    ];
  }

  // Ao abrir, o foco entra no menu: no primeiro item, ou no último se abriu com seta para cima.
  useEffect(() => {
    if (!aberto) return;
    const lista = itens();
    (focoInicial.current === "ultimo" ? lista.at(-1) : lista[0])?.focus();
  }, [aberto]);

  function abrir(foco: "primeiro" | "ultimo") {
    focoInicial.current = foco;
    setAberto(true);
  }

  function aoTeclarNoGatilho(evento: KeyboardEvent<HTMLButtonElement>) {
    if (evento.key === "ArrowDown" || evento.key === "ArrowUp") {
      evento.preventDefault();
      abrir(evento.key === "ArrowUp" ? "ultimo" : "primeiro");
    }
  }

  function aoTeclarNoMenu(evento: KeyboardEvent<HTMLDivElement>) {
    if (evento.key === "Tab") {
      fechar();
      return;
    }
    const destino = itemDestino(
      itens(),
      document.activeElement as HTMLElement,
      evento.key,
      "vertical"
    );
    if (destino === null) return;
    evento.preventDefault();
    destino.focus();
  }

  return (
    <div ref={raiz} className={cn("relative inline-flex", className)}>
      <button
        ref={gatilho}
        type="button"
        id={`${id}-gatilho`}
        data-botao=""
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-controls={aberto ? `${id}-menu` : undefined}
        aria-label={somenteIcone ? rotulo : undefined}
        title={somenteIcone ? rotulo : undefined}
        disabled={desabilitado}
        onClick={() => (aberto ? fechar() : abrir("primeiro"))}
        onKeyDown={aoTeclarNoGatilho}
        className={estiloDoBotao({
          variante,
          intencao,
          tamanho,
          somenteIcone,
          className:
            aberto && variante !== "solido" ? "bg-surface-hover" : undefined,
        })}
      >
        {icone}
        {!somenteIcone && (
          <>
            {rotulo}
            <IconeSeta aberto={aberto} className="duration-200 ease-smooth" />
          </>
        )}
      </button>
      {presenca.montado && (
        <CaixaSuspensa
          lado={lado}
          saindo={presenca.saindo}
          className={cn(
            "min-w-48 p-1.5",
            alinhamento === "fim" && "right-0 left-auto"
          )}
        >
          <div
            ref={menu}
            role="menu"
            id={`${id}-menu`}
            aria-labelledby={`${id}-gatilho`}
            onKeyDown={aoTeclarNoMenu}
            className="flex flex-col gap-0.5"
          >
            <MenuContext
              value={{
                fechar: () => {
                  fechar();
                  gatilho.current?.focus();
                },
              }}
            >
              {children}
            </MenuContext>
          </div>
        </CaixaSuspensa>
      )}
    </div>
  );
}

export function ItemDeMenu({
  icone,
  perigo = false,
  desabilitado,
  aoEscolher,
  children,
}: {
  icone?: ReactNode;
  /** Ação destrutiva: excluir, inativar. */
  perigo?: boolean;
  desabilitado?: boolean;
  aoEscolher?: () => void;
  children: ReactNode;
}) {
  const contexto = use(MenuContext);
  if (!contexto) {
    throw new Error("ItemDeMenu precisa estar dentro de <BotaoDeMenu>.");
  }

  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      disabled={desabilitado}
      onClick={() => {
        aoEscolher?.();
        contexto.fechar();
      }}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-semibold transition-colors duration-150 ease-smooth outline-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
        perigo
          ? "text-danger hover:bg-danger-subtle focus-visible:bg-danger-subtle"
          : "text-foreground hover:bg-surface-hover hover:text-primary focus-visible:bg-surface-hover focus-visible:text-primary"
      )}
    >
      {icone}
      {children}
    </button>
  );
}

/** Título de um grupo de itens, como "Ações rápidas". */
export function RotuloDeMenu({ children }: { children: ReactNode }) {
  return (
    <div className="px-2.5 pt-1.5 pb-1 text-xs font-semibold text-foreground-muted">
      {children}
    </div>
  );
}

export function SeparadorDeMenu() {
  return <div role="separator" className="my-1 border-t border-border" />;
}
