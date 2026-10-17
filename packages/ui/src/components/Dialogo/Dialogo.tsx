"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

import { usePresenca } from "../../hooks/use-presenca";
import { cn } from "../../lib/cn";
import { Botao, BotaoDeIcone } from "../Botao";
import { IconeFechar } from "../Icones";

export type TamanhoDoDialogo = "sm" | "md" | "lg" | "xl";

const LARGURA: Record<TamanhoDoDialogo, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-3xl",
  xl: "max-w-[780px]",
};

/**
 * `padrao`: título e descrição sobre a superfície. `destaque`: cabeçalho em
 * degradê azul-escuro com ícone, para janelas de produto (notas de versão,
 * catálogos), como no protótipo.
 */
export type VarianteDoDialogo = "padrao" | "destaque";

export type DialogoProps = {
  aberto: boolean;
  /** Esc, clique fora ou botão de fechar. Quem abriu decide o que fazer. */
  aoFechar: () => void;
  titulo: ReactNode;
  descricao?: ReactNode;
  /** Botões de ação, alinhados à direita no rodapé. */
  rodape?: ReactNode;
  tamanho?: TamanhoDoDialogo;
  variante?: VarianteDoDialogo;
  /** Ícone ao lado do título; só na variante `destaque`. */
  icone?: ReactNode;
  /** Esconde o botão de fechar e ignora o clique fora: a pessoa precisa escolher uma ação. */
  semFechar?: boolean;
  /**
   * O conteúdo não rola. Para formulários curtos com Select ou seletor de data:
   * a área com rolagem cortaria a caixa suspensa (limite registrado no ADR-0008).
   */
  semRolagem?: boolean;
  /**
   * Não escurece nem desfoca a página atrás. Para janelas em que a pessoa
   * consulta a tela enquanto preenche, como o filtro customizado da Tabela.
   */
  semVeu?: boolean;
  children?: ReactNode;
};

/**
 * Janela modal sobre a página, feita com o `<dialog>` nativo: o navegador prende
 * o foco dentro dela, bloqueia o que está atrás e fecha com Esc. Ao fechar, o
 * foco volta para quem a abriu.
 */
export function Dialogo({
  aberto,
  aoFechar,
  titulo,
  descricao,
  rodape,
  tamanho = "md",
  variante = "padrao",
  icone,
  semFechar = false,
  semRolagem = false,
  semVeu = false,
  children,
}: DialogoProps) {
  const presenca = usePresenca(aberto);
  const dialogo = useRef<HTMLDialogElement>(null);
  const id = useId();
  const destaque = variante === "destaque";

  useEffect(() => {
    const elemento = dialogo.current;
    if (!presenca.montado || !elemento) return;
    const quemAbriu = document.activeElement as HTMLElement | null;
    if (!elemento.open) elemento.showModal();
    // showModal foca o primeiro controle; quem marca data-foco-inicial tem preferência.
    elemento.querySelector<HTMLElement>("[data-foco-inicial]")?.focus();
    return () => quemAbriu?.focus();
  }, [presenca.montado]);

  if (!presenca.montado) return null;

  return (
    <dialog
      ref={dialogo}
      aria-labelledby={`${id}-titulo`}
      aria-describedby={descricao ? `${id}-descricao` : undefined}
      onCancel={(evento) => {
        evento.preventDefault();
        if (!semFechar) aoFechar();
      }}
      onKeyDown={(evento) => {
        if (evento.key !== "Escape") return;
        evento.preventDefault();
        if (!semFechar) aoFechar();
      }}
      onClick={(evento) => {
        if (evento.target === evento.currentTarget && !semFechar) aoFechar();
      }}
      className={cn(
        "m-auto w-[calc(100vw-2rem)] rounded-overlay border border-border-strong bg-surface p-0 text-foreground shadow-xl outline-none [--popover-offset:8px]",
        semVeu
          ? "backdrop:bg-transparent"
          : "backdrop:bg-overlay backdrop:backdrop-blur-sm",
        LARGURA[tamanho],
        // O navegador dá `overflow: auto` ao dialog modal; sem rolagem, a caixa
        // suspensa pode sair do quadro, porque o dialog está na camada superior.
        semRolagem && "[&:modal]:overflow-visible",
        presenca.saindo ? "animate-popover-out" : "animate-popover-in"
      )}
    >
      <div className="flex max-h-[calc(100vh-4rem)] flex-col">
        <header
          className={cn(
            "flex justify-between gap-4",
            destaque
              ? "items-center bg-linear-135 from-dialog-header-start to-dialog-header-end px-6 py-[18px] text-white dark:border-b dark:border-border"
              : "items-start px-6 pt-5 pb-3"
          )}
        >
          <div
            className={cn(
              "flex min-w-0",
              destaque ? "items-center gap-3" : "flex-col gap-1"
            )}
          >
            {destaque && icone && (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-neon/20 text-sidebar-neon [&_svg]:size-5">
                {icone}
              </span>
            )}
            <div className="flex min-w-0 flex-col">
              <h2
                id={`${id}-titulo`}
                className={
                  destaque
                    ? "text-xl font-extrabold text-white"
                    : "text-2xl font-bold"
                }
              >
                {titulo}
              </h2>
              {descricao && (
                <p
                  id={`${id}-descricao`}
                  className={
                    destaque
                      ? "mt-0.5 text-sm text-white/70"
                      : "text-foreground-muted"
                  }
                >
                  {descricao}
                </p>
              )}
            </div>
          </div>
          {!semFechar && (
            <BotaoDeIcone
              rotulo="Fechar"
              icone={<IconeFechar />}
              variante="fantasma"
              tamanho="xs"
              onClick={aoFechar}
              className={
                destaque
                  ? "ml-4 size-9 rounded-[10px] border-white/15 bg-white/10 text-white transition-all hover:scale-105 hover:bg-white/25 hover:text-white [&_svg]:size-5"
                  : undefined
              }
            />
          )}
        </header>
        {children && (
          <div
            className={cn("flex-1 px-6 pb-5", !semRolagem && "overflow-y-auto")}
          >
            {children}
          </div>
        )}
        {rodape && (
          <footer className="flex items-center justify-end gap-2 rounded-b-overlay border-t border-border bg-surface-raised px-6 py-3.5">
            {rodape}
          </footer>
        )}
      </div>
    </dialog>
  );
}

export type DialogoDeConfirmacaoProps = {
  aberto: boolean;
  aoCancelar: () => void;
  aoConfirmar: () => void;
  titulo: ReactNode;
  descricao?: ReactNode;
  rotuloDeConfirmar?: string;
  rotuloDeCancelar?: string;
  /** Ação destrutiva: o botão de confirmar fica em vermelho. */
  perigo?: boolean;
  /** A ação está em andamento: bloqueia os botões e o fechamento. */
  carregando?: boolean;
  children?: ReactNode;
};

/**
 * Pergunta antes de uma ação que não dá para desfazer. O foco começa em
 * "Cancelar", para um Enter apressado não confirmar.
 */
export function DialogoDeConfirmacao({
  aberto,
  aoCancelar,
  aoConfirmar,
  titulo,
  descricao,
  rotuloDeConfirmar = "Confirmar",
  rotuloDeCancelar = "Cancelar",
  perigo = false,
  carregando = false,
  children,
}: DialogoDeConfirmacaoProps) {
  return (
    <Dialogo
      aberto={aberto}
      aoFechar={aoCancelar}
      titulo={titulo}
      descricao={descricao}
      tamanho="sm"
      semFechar={carregando}
      rodape={
        <>
          <Botao
            variante="fantasma"
            onClick={aoCancelar}
            desabilitado={carregando}
            data-foco-inicial=""
          >
            {rotuloDeCancelar}
          </Botao>
          <Botao
            intencao={perigo ? "perigo" : "padrao"}
            onClick={aoConfirmar}
            carregando={carregando}
          >
            {rotuloDeConfirmar}
          </Botao>
        </>
      }
    >
      {children}
    </Dialogo>
  );
}
