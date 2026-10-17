import { useCallback, useState } from "react";

import {
  hojeNoNavegador,
  mesDe,
  primeiroDiaDoMes,
  somarDias,
  somarMeses,
  type DataIso,
  type Periodo,
} from "../lib/datas";
import {
  useCalendario,
  type EstadoDoDia,
  type UseCalendarioOpcoes,
} from "./use-calendario";
import { useValorControlavel } from "./use-valor-controlavel";

/** Atalho de período terminando hoje: `{ label: "30 dias", dias: 30 }`. */
export type Atalho = { label: string; dias: number };

export type UseSeletorDePeriodoOpcoes = UseCalendarioOpcoes & {
  valor?: Periodo | null;
  valorInicial?: Periodo | null;
  aoMudar?: (valor: Periodo | null) => void;
  hoje?: DataIso;
  /** Tamanho máximo do período, contando início e fim. */
  maxDias?: number;
};

type Rascunho = { inicio: DataIso | null; fim: DataIso | null };

const VAZIO: Rascunho = { inicio: null, fim: null };

/**
 * Estado de um seletor de período. O primeiro clique marca o início, o segundo
 * o fim; clicar antes do início recomeça. Com `maxDias`, os dias além do limite
 * ficam indisponíveis enquanto se escolhe o fim.
 */
export function useSeletorDePeriodo({
  valor,
  valorInicial = null,
  aoMudar,
  hoje,
  maxDias,
  meses = 1,
  desabilitada,
  ...limites
}: UseSeletorDePeriodoOpcoes) {
  const [atual, mudar] = useValorControlavel(valor, valorInicial, aoMudar);
  const [aberto, setAberto] = useState(false);
  const [rascunho, setRascunho] = useState<Rascunho>(VAZIO);
  const [passando, setPassando] = useState<DataIso | null>(null);
  const [hojeVisto, setHojeVisto] = useState<DataIso | null>(hoje ?? null);

  const escolhendoFim = rascunho.inicio !== null && rascunho.fim === null;
  const limiteDoFim =
    escolhendoFim && maxDias !== undefined
      ? somarDias(rascunho.inicio!, maxDias - 1)
      : null;

  const desabilitadaNoPeriodo = useCallback(
    (dia: DataIso) =>
      (desabilitada?.(dia) ?? false) ||
      (limiteDoFim !== null && dia > limiteDoFim),
    [desabilitada, limiteDoFim]
  );
  const calendario = useCalendario({
    ...limites,
    meses,
    desabilitada: desabilitadaNoPeriodo,
  });

  /** Mostra o mês de `dia` na última coluna — com dois meses, o anterior fica à esquerda. */
  function mostrarTerminandoEm(dia: DataIso) {
    calendario.mostrar(primeiroDiaDoMes(somarMeses(mesDe(dia), 1 - meses)));
  }

  function abrir() {
    if (aberto) return;
    const referencia = hoje ?? hojeNoNavegador();
    setHojeVisto(referencia);
    setRascunho(atual ?? VAZIO);
    calendario.mostrar(
      atual?.inicio ??
        primeiroDiaDoMes(somarMeses(mesDe(referencia), 1 - meses))
    );
    setAberto(true);
  }

  function fechar() {
    setAberto(false);
    setPassando(null);
  }

  function escolher(dia: DataIso) {
    if (calendario.estaDesabilitada(dia)) return;
    const { inicio, fim } = rascunho;
    const recomeca = inicio === null || fim !== null || dia < inicio;
    setRascunho(recomeca ? { inicio: dia, fim: null } : { inicio, fim: dia });
  }

  /** Período de `dias` terminando hoje (ou em `max`, se hoje passar dele). */
  function periodoDoAtalho(dias: number): Periodo {
    const referencia = hojeVisto ?? hoje ?? hojeNoNavegador();
    const fim =
      limites.max !== undefined && limites.max < referencia
        ? limites.max
        : referencia;
    const inicio = somarDias(fim, 1 - dias);
    return {
      inicio:
        limites.min !== undefined && inicio < limites.min
          ? limites.min
          : inicio,
      fim,
    };
  }

  function aplicarAtalho(dias: number) {
    const periodo = periodoDoAtalho(dias);
    setRascunho(periodo);
    mostrarTerminandoEm(periodo.fim);
  }

  function aplicar() {
    const { inicio, fim } = rascunho;
    if (inicio === null || fim === null) return;
    mudar({ inicio, fim });
    fechar();
  }

  function limpar() {
    setRascunho(VAZIO);
    mudar(null);
  }

  function estadoDoDia(dia: DataIso): EstadoDoDia {
    const { inicio, fim } = rascunho;
    if (inicio === null) return "normal";
    const ate =
      fim ?? (passando !== null && passando > inicio ? passando : null);
    if (dia === inicio) return ate ? "inicio" : "selecionado";
    if (ate === null || dia < inicio || dia > ate) return "normal";
    if (fim === null) return "previa";
    return dia === fim ? "fim" : "meio";
  }

  return {
    valor: atual,
    aberto,
    abrir,
    fechar,
    alternar: () => (aberto ? fechar() : abrir()),
    rascunho,
    escolhendoFim,
    escolher,
    /** Dia sob o mouse, para a prévia do período. */
    passar: (dia: DataIso | null) => setPassando(escolhendoFim ? dia : null),
    periodoDoAtalho,
    aplicarAtalho,
    aplicar,
    limpar,
    podeAplicar: rascunho.inicio !== null && rascunho.fim !== null,
    podeLimpar: rascunho.inicio !== null || atual !== null,
    maxDias,
    hoje: hojeVisto,
    calendario,
    estadoDoDia,
  };
}

export type SeletorDePeriodoEstado = ReturnType<typeof useSeletorDePeriodo>;
