import { useState, type KeyboardEvent } from "react";

import { useValorControlavel } from "./use-valor-controlavel";

export type Opcao<T extends string = string> = {
  valor: T;
  label: string;
  /** Linha secundária, menor, abaixo do label. */
  descricao?: string;
  desabilitada?: boolean;
};

export type UseSelectOpcoes<T extends string> = {
  opcoes: readonly Opcao<T>[];
  valor?: T | null;
  valorInicial?: T | null;
  aoMudar?: (valor: T) => void;
  /** Mostra a busca no topo da lista e filtra enquanto se digita. */
  pesquisavel?: boolean;
  /** Filtro próprio; o padrão ignora acento e caixa e procura no label. */
  filtrar?: (opcao: Opcao<T>, busca: string) => boolean;
};

/** "São Paulo" → "sao paulo": busca sem acento e sem caixa. */
export function normalizarParaBusca(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function contemBusca(opcao: Opcao, busca: string): boolean {
  return normalizarParaBusca(opcao.label).includes(normalizarParaBusca(busca));
}

function proximaHabilitada(
  lista: readonly Opcao[],
  desde: number,
  passo: 1 | -1
): number {
  for (let i = desde; i >= 0 && i < lista.length; i += passo) {
    const opcao = lista[i];
    if (opcao && !opcao.desabilitada) return i;
  }
  return -1;
}

/**
 * Estado de um select: lista aberta, opção ativa (teclado e mouse) e busca
 * interna. O teclado segue o padrão combobox do WAI-ARIA: setas, Home/End,
 * Enter escolhe; Esc e clique fora ficam com a caixa suspensa.
 */
export function useSelect<T extends string>({
  opcoes,
  valor,
  valorInicial = null,
  aoMudar,
  pesquisavel = false,
  filtrar = contemBusca,
}: UseSelectOpcoes<T>) {
  const [atual, mudar] = useValorControlavel<T | null>(
    valor,
    valorInicial,
    (novo) => {
      if (novo !== null) aoMudar?.(novo);
    }
  );
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [ativo, setAtivo] = useState(-1);

  const filtrarLista = (texto: string) =>
    pesquisavel && texto.trim()
      ? opcoes.filter((opcao) => filtrar(opcao, texto))
      : opcoes;
  const filtradas = filtrarLista(busca);

  function abrir() {
    const selecionada = opcoes.findIndex((opcao) => opcao.valor === atual);
    setBusca("");
    setAtivo(selecionada >= 0 ? selecionada : proximaHabilitada(opcoes, 0, 1));
    setAberto(true);
  }

  function fechar() {
    setAberto(false);
  }

  function escolher(opcao: Opcao<T>) {
    if (opcao.desabilitada) return;
    mudar(opcao.valor);
    fechar();
  }

  function buscar(texto: string) {
    setBusca(texto);
    setAtivo(proximaHabilitada(filtrarLista(texto), 0, 1));
  }

  function mover(passo: 1 | -1) {
    setAtivo((indice) => {
      const proxima = proximaHabilitada(filtradas, indice + passo, passo);
      return proxima === -1 ? indice : proxima;
    });
  }

  function escolherAtiva() {
    const opcao = filtradas[ativo];
    if (opcao) escolher(opcao);
  }

  function aoTeclar(evento: KeyboardEvent) {
    const teclas: Record<string, () => void> = aberto
      ? {
          ArrowDown: () => mover(1),
          ArrowUp: () => mover(-1),
          Enter: escolherAtiva,
          ...(pesquisavel
            ? {}
            : {
                " ": escolherAtiva,
                Home: () => setAtivo(proximaHabilitada(filtradas, 0, 1)),
                End: () =>
                  setAtivo(
                    proximaHabilitada(filtradas, filtradas.length - 1, -1)
                  ),
              }),
        }
      : { ArrowDown: abrir, ArrowUp: abrir, Enter: abrir, " ": abrir };

    if (evento.key === "Tab") return fechar();
    const acao = teclas[evento.key];
    if (!acao) return;
    evento.preventDefault();
    acao();
  }

  return {
    valor: atual,
    selecionada: opcoes.find((opcao) => opcao.valor === atual) ?? null,
    aberto,
    abrir,
    fechar,
    alternar: () => (aberto ? fechar() : abrir()),
    busca,
    buscar,
    filtradas,
    ativo,
    /** Mouse sobre a opção: vira a ativa, como no teclado. */
    destacar: setAtivo,
    escolher,
    aoTeclar,
  };
}

export type SelectEstado<T extends string> = ReturnType<typeof useSelect<T>>;
