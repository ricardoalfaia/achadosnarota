import {
  useDeferredValue,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronRight, FunnelX } from "lucide-react";

import { normalizarParaBusca } from "../../../hooks/use-select";
import { cn } from "../../../lib/cn";
import { Botao } from "../../Botao";
import { CampoDeTexto } from "../../CampoDeTexto";
import { Checkbox } from "../../Checkbox";
import { IconeBusca, IconeCheck } from "../../Icones";
import type { FiltroDeColuna, TipoDeColuna } from "../tipos";
import { VAZIO } from "../valores";
import { IconeDeOrdem } from "./icone-de-ordem";
import {
  operadoresDe,
  rotuloCurto,
  type OperadorDeCondicao,
} from "./operadores";

/** Um valor distinto da coluna, como aparece na lista. */
export type OpcaoDeFiltro = { chave: string; rotulo: string; total: number };

const ALTURA_DO_ITEM = 32;

const ROTULOS_DE_ORDEM: Record<TipoDeColuna, [string, string]> = {
  texto: ["Ordenar de A a Z", "Ordenar de Z a A"],
  numero: ["Ordenar do menor para o maior", "Ordenar do maior para o menor"],
  data: [
    "Ordenar da mais antiga para a mais nova",
    "Ordenar da mais nova para a mais antiga",
  ],
};

const ROTULO_DO_SUBMENU: Record<TipoDeColuna, string> = {
  texto: "Filtros de texto",
  numero: "Filtros de número",
  data: "",
};

/** Largura do submenu; serve para decidir de que lado ele abre. */
const LARGURA_DO_SUBMENU = 208;

function ItemDoMenu({
  children,
  icone,
  ativo,
  desabilitado,
  aoClicar,
  className,
  ...resto
}: {
  children: ReactNode;
  /** Ocupa a coluna da esquerda; sem ícone, o texto fica alinhado com os demais. */
  icone?: ReactNode;
  ativo?: boolean;
  desabilitado?: boolean;
  aoClicar: () => void;
  className?: string;
  role?: string;
  "aria-haspopup"?: "menu";
  "aria-expanded"?: boolean;
  onMouseEnter?: () => void;
  onKeyDown?: (evento: KeyboardEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      disabled={desabilitado}
      aria-pressed={ativo}
      onClick={aoClicar}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm font-semibold text-foreground transition-colors duration-150 ease-smooth outline-none hover:bg-surface-hover hover:text-primary focus-visible:bg-surface-hover focus-visible:text-primary disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:text-primary",
        className
      )}
      {...resto}
    >
      <span className="flex size-4 shrink-0 items-center justify-center [&_svg]:size-4">
        {icone}
      </span>
      <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
        {children}
      </span>
    </button>
  );
}

/**
 * "Filtros de texto": abre a lista de operadores ao lado. Cada um leva ao
 * diálogo do filtro customizado com aquele operador já escolhido.
 */
function SubmenuDeCondicoes({
  tipo,
  operadorAtivo,
  aoEscolher,
}: {
  tipo: TipoDeColuna;
  /** O operador da condição em vigor, quando ela tem só uma cláusula. */
  operadorAtivo: OperadorDeCondicao | undefined;
  aoEscolher: (operador?: OperadorDeCondicao) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [lado, setLado] = useState<"direita" | "esquerda">("direita");
  const raiz = useRef<HTMLDivElement>(null);
  const operadores = operadoresDe(tipo);

  function abrir() {
    const borda = raiz.current?.getBoundingClientRect();
    if (borda) {
      const cabe = borda.right + LARGURA_DO_SUBMENU + 8 <= window.innerWidth;
      setLado(cabe ? "direita" : "esquerda");
    }
    setAberto(true);
  }

  function aoTeclar(evento: KeyboardEvent<HTMLButtonElement>) {
    if (evento.key === "ArrowRight" || evento.key === "Enter") {
      evento.preventDefault();
      abrir();
      requestAnimationFrame(() =>
        raiz.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
      );
    }
  }

  function aoTeclarNoSubmenu(evento: KeyboardEvent<HTMLDivElement>) {
    if (evento.key !== "ArrowLeft") return;
    evento.preventDefault();
    setAberto(false);
    raiz.current?.querySelector<HTMLElement>("button")?.focus();
  }

  return (
    <div ref={raiz} className="relative" onMouseLeave={() => setAberto(false)}>
      <ItemDoMenu
        icone={operadorAtivo && <IconeCheck />}
        aria-haspopup="menu"
        aria-expanded={aberto}
        onMouseEnter={abrir}
        onKeyDown={aoTeclar}
        aoClicar={abrir}
        className={cn(aberto && "bg-surface-hover text-primary")}
      >
        {ROTULO_DO_SUBMENU[tipo]}
        <ChevronRight aria-hidden="true" className="size-4 shrink-0" />
      </ItemDoMenu>

      {aberto && (
        <div
          role="menu"
          aria-label={ROTULO_DO_SUBMENU[tipo]}
          onKeyDown={aoTeclarNoSubmenu}
          style={{ width: LARGURA_DO_SUBMENU }}
          className={cn(
            "absolute top-0 z-30 flex animate-popover-in flex-col gap-0.5 rounded-overlay border border-border-strong bg-surface p-1.5 shadow-xl",
            lado === "direita" ? "left-full ml-1" : "right-full mr-1"
          )}
        >
          {operadores.map((operador) => (
            <ItemDoMenu
              key={operador.valor}
              role="menuitem"
              icone={operador.valor === operadorAtivo && <IconeCheck />}
              ativo={operador.valor === operadorAtivo}
              aoClicar={() => aoEscolher(operador.valor)}
            >
              {rotuloCurto(operador.label)}
            </ItemDoMenu>
          ))}
          <div role="separator" className="my-1 border-t border-border" />
          <ItemDoMenu role="menuitem" aoClicar={() => aoEscolher()}>
            Filtro customizado...
          </ItemDoMenu>
        </div>
      )}
    </div>
  );
}

/**
 * O menu de uma coluna, como o do Excel: ordenar, limpar, as condições e a
 * lista de valores com busca. A lista só é aplicada no OK; as condições abrem
 * o diálogo do filtro customizado.
 */
export function MenuDeFiltro({
  titulo,
  tipo,
  opcoes,
  filtro,
  ordem,
  podeOrdenar,
  aoOrdenar,
  aoAplicar,
  aoAbrirCustomizado,
  aoCancelar,
}: {
  titulo: string;
  tipo: TipoDeColuna;
  /** Valores distintos da coluna, já considerando os filtros das outras colunas. */
  opcoes: readonly OpcaoDeFiltro[];
  filtro: FiltroDeColuna | undefined;
  ordem: false | "asc" | "desc";
  podeOrdenar: boolean;
  aoOrdenar: (direcao: "asc" | "desc") => void;
  /** `undefined` remove o filtro da coluna. */
  aoAplicar: (filtro: FiltroDeColuna | undefined) => void;
  /** Abre o diálogo do filtro customizado, com o operador escolhido no submenu. */
  aoAbrirCustomizado: (operador?: OperadorDeCondicao) => void;
  aoCancelar: () => void;
}) {
  const [busca, setBusca] = useState("");
  const [marcados, setMarcados] = useState<ReadonlySet<string>>(
    () => filtro?.valores ?? new Set(opcoes.map((opcao) => opcao.chave))
  );

  // A lista pode ter milhares de valores: ela acompanha a busca com um pequeno
  // atraso, para a digitação nunca travar.
  const buscaAdiada = useDeferredValue(busca);
  const visiveis = useMemo(() => {
    const procurado = normalizarParaBusca(buscaAdiada);
    if (procurado === "") return opcoes;
    return opcoes.filter((opcao) =>
      normalizarParaBusca(opcao.rotulo || VAZIO).includes(procurado)
    );
  }, [opcoes, buscaAdiada]);

  const marcadosVisiveis = visiveis.filter((opcao) =>
    marcados.has(opcao.chave)
  ).length;
  const todosMarcados =
    visiveis.length > 0 && marcadosVisiveis === visiveis.length;

  const lista = useRef<HTMLDivElement>(null);
  const virtual = useVirtualizer({
    count: visiveis.length,
    getScrollElement: () => lista.current,
    estimateSize: () => ALTURA_DO_ITEM,
    overscan: 6,
  });

  function alternar(chave: string, marcar: boolean) {
    const proximo = new Set(marcados);
    if (marcar) proximo.add(chave);
    else proximo.delete(chave);
    setMarcados(proximo);
  }

  function alternarTodos(marcar: boolean) {
    const proximo = new Set(marcados);
    for (const opcao of visiveis) {
      if (marcar) proximo.add(opcao.chave);
      else proximo.delete(opcao.chave);
    }
    setMarcados(proximo);
  }

  function aplicar() {
    // Com busca ativa, vale o que está marcado entre os resultados, como no Excel.
    const escolhidos = busca
      ? visiveis.filter((opcao) => marcados.has(opcao.chave))
      : opcoes.filter((opcao) => marcados.has(opcao.chave));
    const todos = escolhidos.length === opcoes.length;
    const novo: FiltroDeColuna = {
      valores: todos
        ? undefined
        : new Set(escolhidos.map((opcao) => opcao.chave)),
      condicao: filtro?.condicao,
    };
    aoAplicar(novo.valores || novo.condicao ? novo : undefined);
  }

  const [crescente, decrescente] = ROTULOS_DE_ORDEM[tipo];
  const temFiltro = Boolean(filtro);
  const nadaMarcado = marcadosVisiveis === 0;
  const condicao = filtro?.condicao;
  const operadorAtivo =
    condicao && !condicao.segunda ? condicao.operador : undefined;

  return (
    <form
      aria-label={`Filtro de ${titulo}`}
      className="flex w-72 flex-col"
      onSubmit={(evento) => {
        evento.preventDefault();
        if (!nadaMarcado) aplicar();
      }}
    >
      <div className="flex flex-col gap-0.5 p-1.5">
        {podeOrdenar && (
          <>
            <ItemDoMenu
              icone={<IconeDeOrdem tipo={tipo} direcao="asc" />}
              ativo={ordem === "asc"}
              aoClicar={() => aoOrdenar("asc")}
            >
              {crescente}
            </ItemDoMenu>
            <ItemDoMenu
              icone={<IconeDeOrdem tipo={tipo} direcao="desc" />}
              ativo={ordem === "desc"}
              aoClicar={() => aoOrdenar("desc")}
            >
              {decrescente}
            </ItemDoMenu>
            <div role="separator" className="my-1 border-t border-border" />
          </>
        )}
        <ItemDoMenu
          icone={<FunnelX aria-hidden="true" className="text-danger" />}
          desabilitado={!temFiltro}
          aoClicar={() => aoAplicar(undefined)}
        >
          Limpar filtro
        </ItemDoMenu>
        {tipo !== "data" && (
          <SubmenuDeCondicoes
            tipo={tipo}
            operadorAtivo={operadorAtivo}
            aoEscolher={aoAbrirCustomizado}
          />
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-border p-3">
        <CampoDeTexto
          label="Buscar"
          tipo="search"
          tamanho="sm"
          valor={busca}
          aoMudar={setBusca}
          prefixo={<IconeBusca />}
          focoInicial
        />
        <Checkbox
          label={busca ? "Selecionar os resultados" : "Selecionar tudo"}
          marcado={todosMarcados}
          indeterminado={!todosMarcados && marcadosVisiveis > 0}
          aoMudar={alternarTodos}
          desabilitado={visiveis.length === 0}
        />
        <div
          ref={lista}
          role="group"
          aria-label={`Valores de ${titulo}`}
          tabIndex={0}
          className="h-52 overflow-y-auto rounded-control border border-border outline-none focus-visible:border-primary"
        >
          {visiveis.length === 0 ? (
            <p className="p-3 text-sm text-foreground-muted">
              Nenhum valor encontrado.
            </p>
          ) : (
            <div
              className="relative"
              style={{ height: virtual.getTotalSize() }}
            >
              {virtual.getVirtualItems().map((item) => {
                const opcao = visiveis[item.index];
                if (!opcao) return null;
                return (
                  <div
                    key={opcao.chave}
                    className="absolute inset-x-0 flex items-center px-2.5"
                    style={{
                      height: ALTURA_DO_ITEM,
                      transform: `translateY(${item.start}px)`,
                    }}
                  >
                    <Checkbox
                      label={
                        <span className="flex items-baseline gap-2 font-medium">
                          <span className="truncate">
                            {opcao.rotulo || VAZIO}
                          </span>
                          <span className="font-mono text-2xs text-foreground-muted">
                            {opcao.total}
                          </span>
                        </span>
                      }
                      marcado={marcados.has(opcao.chave)}
                      aoMudar={(marcar) => alternar(opcao.chave, marcar)}
                      className="min-w-0 flex-1"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 rounded-b-overlay border-t border-border bg-surface-raised px-3 py-2.5">
        <Botao variante="fantasma" tamanho="xs" onClick={aoCancelar}>
          Cancelar
        </Botao>
        <Botao type="submit" tamanho="xs" desabilitado={nadaMarcado}>
          OK
        </Botao>
      </div>
    </form>
  );
}
