"use client";

import { useEffect, useRef } from "react";

import type {
  Calendario as EstadoDoCalendario,
  EstadoDoDia,
} from "../../hooks/use-calendario";
import {
  primeiroDiaDoMes,
  ultimoDiaDoMes,
  type DataIso,
} from "../../lib/datas";
import { GradeDoMes } from "./components/grade-do-mes";
import { Navegacao } from "./components/navegacao";

/**
 * Grade de um ou dois meses. Só desenha: o estado vem de `useCalendario` e o
 * estado de cada dia (`estadoDoDia`), de quem compõe (data única ou período).
 */
export function Calendario({
  calendario,
  estadoDoDia,
  hoje,
  referencia,
  aoEscolher,
  aoPassar,
}: {
  calendario: EstadoDoCalendario;
  estadoDoDia: (dia: DataIso) => EstadoDoDia;
  hoje: DataIso | null;
  /** Dia que recebe o Tab ao entrar na grade (o selecionado, em geral). */
  referencia: DataIso | null;
  aoEscolher: (dia: DataIso) => void;
  aoPassar?: (dia: DataIso | null) => void;
}) {
  const grade = useRef<HTMLDivElement>(null);
  const { focado, visiveis } = calendario;

  // Foco segue o teclado: a navegação muda `focado`, e o botão do dia recebe o foco.
  useEffect(() => {
    if (focado)
      grade.current
        ?.querySelector<HTMLElement>(`[data-dia="${focado}"]`)
        ?.focus();
  }, [focado]);

  const primeiroMes = visiveis.at(0);
  const ultimoMes = visiveis.at(-1);
  const primeiro = primeiroMes ? primeiroDiaDoMes(primeiroMes) : null;
  const ultimo = ultimoMes ? ultimoDiaDoMes(ultimoMes) : null;
  const visivel = (dia: DataIso | null): dia is DataIso =>
    dia !== null &&
    primeiro !== null &&
    ultimo !== null &&
    dia >= primeiro &&
    dia <= ultimo;
  const tabulavel = [focado, referencia, hoje].find(visivel) ?? primeiro;

  return (
    <div ref={grade} className="relative">
      <Navegacao calendario={calendario} />
      <div
        className="flex flex-col gap-6 sm:flex-row"
        onMouseLeave={() => aoPassar?.(null)}
      >
        {visiveis.map((mes) => (
          <GradeDoMes
            key={`${mes.ano}-${mes.mes}`}
            mes={mes}
            calendario={calendario}
            estadoDoDia={estadoDoDia}
            hoje={hoje}
            tabulavel={tabulavel}
            aoEscolher={aoEscolher}
            aoPassar={aoPassar}
          />
        ))}
      </div>
    </div>
  );
}
