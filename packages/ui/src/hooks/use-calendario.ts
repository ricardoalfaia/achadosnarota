import { useCallback, useState, type KeyboardEvent } from "react";

import {
  diaDaSemana,
  mesDe,
  primeiroDiaDoMes,
  somarDias,
  somarMeses,
  somarMesesNaData,
  ultimoDiaDoMes,
  type DataIso,
  type Mes,
} from "../lib/datas";

export type LimitesDeData = {
  /** Primeiro dia que pode ser escolhido. */
  min?: DataIso;
  /** Último dia que pode ser escolhido. */
  max?: DataIso;
  /** Regra extra de dia indisponível (fim de semana, feriado). Passe uma função estável. */
  desabilitada?: (dia: DataIso) => boolean;
};

/** Como um dia aparece na grade. `previa` é o trecho do período sob o mouse. */
export type EstadoDoDia =
  "normal" | "selecionado" | "inicio" | "meio" | "fim" | "previa";

export type UseCalendarioOpcoes = LimitesDeData & {
  /** Meses lado a lado. */
  meses?: 1 | 2;
};

const PASSOS_DO_TECLADO: Record<string, (dia: DataIso) => DataIso> = {
  ArrowLeft: (dia) => somarDias(dia, -1),
  ArrowRight: (dia) => somarDias(dia, 1),
  ArrowUp: (dia) => somarDias(dia, -7),
  ArrowDown: (dia) => somarDias(dia, 7),
  PageUp: (dia) => somarMesesNaData(dia, -1),
  PageDown: (dia) => somarMesesNaData(dia, 1),
  Home: (dia) => somarDias(dia, -diaDaSemana(dia)),
  End: (dia) => somarDias(dia, 6 - diaDaSemana(dia)),
};

/**
 * Navegação de um calendário: meses visíveis, limites e teclado (setas,
 * PageUp/PageDown, Home/End). Não sabe o que está selecionado — quem usa
 * decide o estado de cada dia.
 */
export function useCalendario({
  min,
  max,
  desabilitada,
  meses = 1,
}: UseCalendarioOpcoes = {}) {
  const [inicioVisivel, setInicioVisivel] = useState<Mes | null>(null);
  const [focado, setFocado] = useState<DataIso | null>(null);

  const estaDesabilitada = useCallback(
    (dia: DataIso) =>
      (min !== undefined && dia < min) ||
      (max !== undefined && dia > max) ||
      (desabilitada?.(dia) ?? false),
    [min, max, desabilitada]
  );

  const visiveis = inicioVisivel
    ? Array.from({ length: meses }, (_, i) => somarMeses(inicioVisivel, i))
    : [];
  const podeVoltar =
    inicioVisivel !== null &&
    (min === undefined || ultimoDiaDoMes(somarMeses(inicioVisivel, -1)) >= min);
  const podeAvancar =
    inicioVisivel !== null &&
    (max === undefined ||
      primeiroDiaDoMes(somarMeses(inicioVisivel, meses)) <= max);

  /** Mostra o mês de `dia` (na primeira coluna), sem mover o foco. */
  const mostrar = useCallback((dia: DataIso) => {
    setInicioVisivel(mesDe(dia));
    setFocado(null);
  }, []);

  function navegar(passo: number) {
    setInicioVisivel((atual) => atual && somarMeses(atual, passo));
  }

  function focar(dia: DataIso) {
    setFocado(dia);
    setInicioVisivel((atual) => {
      const alvo = mesDe(dia);
      if (!atual || primeiroDiaDoMes(alvo) < primeiroDiaDoMes(atual))
        return alvo;
      const ultimo = somarMeses(atual, meses - 1);
      return primeiroDiaDoMes(alvo) > primeiroDiaDoMes(ultimo)
        ? somarMeses(alvo, 1 - meses)
        : atual;
    });
  }

  function aoTeclar(evento: KeyboardEvent, dia: DataIso) {
    const passo = PASSOS_DO_TECLADO[evento.key];
    if (!passo) return;
    evento.preventDefault();
    focar(passo(dia));
  }

  return {
    visiveis,
    podeVoltar,
    podeAvancar,
    anterior: () => navegar(-1),
    proximo: () => navegar(1),
    mostrar,
    focado,
    aoTeclar,
    estaDesabilitada,
  };
}

export type Calendario = ReturnType<typeof useCalendario>;
