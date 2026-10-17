"use client";

import {
  Activity,
  createContext,
  use,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { useValorControlavel } from "../../hooks/use-valor-controlavel";
import { cn } from "../../lib/cn";
import { abaDestino } from "./navegacao";

/**
 * `linha`: abas de página, com o traço laranja sob a ativa (Cupons, Avaliações,
 * Fotos, Sobre). `pilula`: alternância compacta de visão. `segmentos`: as
 * pílulas que dividem a largura toda, sobre a faixa cinza arredondada
 * (Disponíveis, Utilizados, Expirados). `formulario`: as abas de cadastro,
 * sobre a faixa cinza, com a aba ativa branca e o painel entrando de cima.
 */
export type VarianteDeAbas = "linha" | "pilula" | "segmentos" | "formulario";

type Contexto = {
  id: string;
  valor: string;
  mudar: (valor: string) => void;
  variante: VarianteDeAbas;
  manterEstado: boolean;
};

const AbasContext = createContext<Contexto | null>(null);

function useAbas(): Contexto {
  const contexto = use(AbasContext);
  if (!contexto) {
    throw new Error(
      "ListaDeAbas, Aba e PainelDaAba precisam estar dentro de <Abas>."
    );
  }
  return contexto;
}

type Controle<T extends string> =
  | { valor: T; valorInicial?: never; aoMudar: (valor: T) => void }
  | { valor?: undefined; valorInicial: T; aoMudar?: (valor: T) => void };

export type AbasProps<T extends string> = Controle<T> & {
  variante?: VarianteDeAbas;
  /**
   * Mantém vivo o painel das abas já visitadas: ao voltar, o que foi digitado,
   * filtrado ou rolado continua lá. Sem isso, o painel é recriado a cada visita.
   */
  manterEstado?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Abas no padrão WAI-ARIA: setas, Home e End trocam de aba e a seleção acompanha
 * o foco. Composição explícita: `ListaDeAbas` com as `Aba`, e um `PainelDaAba`
 * para cada valor.
 */
export function Abas<T extends string>({
  valor,
  valorInicial,
  aoMudar,
  variante = "linha",
  manterEstado = false,
  className,
  children,
}: AbasProps<T>) {
  const [atual, mudar] = useValorControlavel<string>(
    valor,
    valorInicial ?? "",
    aoMudar as ((valor: string) => void) | undefined
  );
  const id = useId();

  return (
    <AbasContext value={{ id, valor: atual, mudar, variante, manterEstado }}>
      <div className={className}>{children}</div>
    </AbasContext>
  );
}

const LISTA: Record<VarianteDeAbas, string> = {
  linha: "flex gap-1 border-b border-border",
  pilula:
    "inline-flex gap-1 rounded-control border border-border bg-surface-hover p-1",
  segmentos: "flex gap-1 rounded-full bg-surface-hover p-1",
  formulario: "flex gap-1.5 border-b border-border bg-surface-hover px-6",
};

const INDICADOR: Record<VarianteDeAbas, string> = {
  linha: "-bottom-px h-0.5 rounded-full bg-brand",
  pilula:
    "inset-y-1 rounded-md border border-primary-solid-border bg-primary-solid",
  segmentos: "inset-y-1 rounded-full bg-primary-solid shadow-sm",
  formulario: "-bottom-px h-[3px] bg-ring",
};

export function ListaDeAbas({
  rotulo,
  className,
  children,
}: {
  /** Nome acessível do conjunto, lido pelo leitor de tela. */
  rotulo: string;
  className?: string;
  children: ReactNode;
}) {
  const { valor, mudar, variante } = useAbas();
  const lista = useRef<HTMLDivElement>(null);
  const indicador = useRef<HTMLSpanElement>(null);
  const jaMediu = useRef(false);

  // O indicador desliza até a aba ativa. A posição vem do DOM, então é escrita
  // direto no estilo, sem estado; a primeira medição não anima.
  useLayoutEffect(() => {
    const raiz = lista.current;
    const marca = indicador.current;
    if (!raiz || !marca) return;

    function posicionar(animar: boolean) {
      const ativa = raiz?.querySelector<HTMLElement>('[aria-selected="true"]');
      if (!marca) return;
      if (!ativa) {
        marca.style.opacity = "0";
        return;
      }
      if (!animar) marca.style.transition = "none";
      marca.style.left = `${ativa.offsetLeft}px`;
      marca.style.width = `${ativa.offsetWidth}px`;
      marca.style.opacity = "1";
      if (!animar) {
        void marca.offsetWidth;
        marca.style.transition = "";
      }
    }

    posicionar(jaMediu.current);
    jaMediu.current = true;

    const observador = new ResizeObserver(() => posicionar(false));
    observador.observe(raiz);
    return () => observador.disconnect();
  }, [valor, variante]);

  function aoTeclar(evento: KeyboardEvent<HTMLDivElement>) {
    const abas = [
      ...evento.currentTarget.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]:not(:disabled)'
      ),
    ];
    const destino = abaDestino(
      abas.map((aba) => aba.dataset.valor ?? ""),
      valor,
      evento.key
    );
    if (destino === null) return;
    evento.preventDefault();
    mudar(destino);
    abas.find((aba) => aba.dataset.valor === destino)?.focus();
  }

  return (
    <div
      ref={lista}
      role="tablist"
      aria-label={rotulo}
      onKeyDown={aoTeclar}
      className={cn("relative", LISTA[variante], className)}
    >
      <span
        ref={indicador}
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute opacity-0 transition-[left,width,opacity] duration-300 ease-smooth",
          INDICADOR[variante]
        )}
      />
      {children}
    </div>
  );
}

const ABA: Record<VarianteDeAbas, string> = {
  // No celular, as abas dividem a largura e encolhem em vez de vazar da tela
  // (4 abas não cabem em 360px com largura fixa); de 640px em diante, cada uma
  // tem a largura do próprio nome.
  linha:
    "h-control-sm min-w-0 flex-1 shrink justify-center rounded-t-control px-2 text-sm hover:text-primary aria-selected:text-primary sm:flex-none sm:px-4",
  pilula:
    "h-7 rounded-md px-3 text-sm hover:text-foreground aria-selected:text-primary-solid-foreground",
  segmentos:
    "h-8 flex-1 justify-center rounded-full px-2 text-xs hover:text-foreground aria-selected:text-primary-solid-foreground",
  formulario:
    "px-4.5 py-3 text-[13px] hover:text-primary aria-selected:bg-surface aria-selected:text-primary",
};

/** Como o painel entra: o do formulário desce de cima, como no protótipo (fadeInDown). */
const PAINEL: Record<VarianteDeAbas, string> = {
  linha: "animate-panel-in pt-4",
  pilula: "animate-panel-in pt-4",
  segmentos: "animate-panel-in pt-3",
  formulario: "animate-fade-in-down duration-250",
};

export function Aba({
  valor,
  icone,
  contador,
  desabilitada,
  children,
}: {
  valor: string;
  icone?: ReactNode;
  /** Quantidade ao lado do nome: pendências, itens, erros. */
  contador?: number;
  desabilitada?: boolean;
  children: ReactNode;
}) {
  const abas = useAbas();
  const selecionada = abas.valor === valor;

  return (
    <button
      type="button"
      role="tab"
      id={`${abas.id}-aba-${valor}`}
      data-valor={valor}
      aria-selected={selecionada}
      aria-controls={`${abas.id}-painel-${valor}`}
      tabIndex={selecionada ? 0 : -1}
      disabled={desabilitada}
      onClick={() => abas.mudar(valor)}
      className={cn(
        "group relative z-10 inline-flex shrink-0 cursor-pointer items-center gap-2 font-bold whitespace-nowrap text-foreground-muted transition-colors duration-200 ease-smooth outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        ABA[abas.variante]
      )}
    >
      {icone}
      {children}
      {contador !== undefined && (
        <span
          className={cn(
            "rounded-full bg-current/12 px-1.5 font-mono text-2xs leading-4 text-foreground group-aria-selected:text-inherit",
            // Sobre o azul sólido da pílula escolhida, o contador escurece para o branco atingir AA.
            (abas.variante === "pilula" || abas.variante === "segmentos") &&
              "group-aria-selected:bg-black/15"
          )}
        >
          {contador}
        </span>
      )}
    </button>
  );
}

export function PainelDaAba({
  valor,
  className,
  children,
}: {
  valor: string;
  className?: string;
  children: ReactNode;
}) {
  const abas = useAbas();
  const ativo = abas.valor === valor;
  const [visitado, setVisitado] = useState(ativo);
  if (ativo && !visitado) setVisitado(true);

  if (abas.manterEstado ? !visitado : !ativo) return null;

  const painel = (
    <div
      role="tabpanel"
      id={`${abas.id}-painel-${valor}`}
      aria-labelledby={`${abas.id}-aba-${valor}`}
      tabIndex={0}
      className={cn(
        "rounded-control outline-none focus-visible:ring-2 focus-visible:ring-ring",
        PAINEL[abas.variante],
        className
      )}
    >
      {children}
    </div>
  );

  // Activity esconde o painel sem desmontá-lo: o estado fica, os efeitos param
  // e o que está escondido é atualizado com prioridade baixa.
  return abas.manterEstado ? (
    <Activity mode={ativo ? "visible" : "hidden"}>{painel}</Activity>
  ) : (
    painel
  );
}
