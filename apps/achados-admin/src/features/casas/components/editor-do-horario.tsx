"use client";

import { Alerta, CampoDeTexto } from "@achados/ui";
import { cn } from "@achados/ui/estilos";
import { Copy, Plus, X } from "lucide-react";

import {
  adicionarTurno,
  alternarDia,
  copiarParaASemana,
  DIAS_DA_SEMANA,
  mudarTurno,
  problemasDoHorario,
  removerTurno,
  TURNOS_POR_DIA,
  turnosDoDia,
  type TurnoDaCasa,
} from "../domain/horario";

type Edicao = (turnos: readonly TurnoDaCasa[]) => readonly TurnoDaCasa[];

const CAMPO_DE_HORA =
  "h-10 w-[6.5rem] rounded-control border border-border bg-surface px-2 text-sm tabular-nums text-foreground outline-none focus:border-ring disabled:opacity-60";

/**
 * O horário da semana: um dia por linha, aberto ou fechado, com até dois
 * turnos (almoço e jantar). Turno que fecha depois da meia-noite é aceito
 * (17:00–01:00). As edições são funções puras de `domain/horario`.
 */
export function EditorDoHorario({
  turnos,
  aoEditar,
  observacao,
  aoMudarObservacao,
  erroDaObservacao,
  somenteLeitura = false,
}: {
  turnos: readonly TurnoDaCasa[];
  aoEditar: (edicao: Edicao) => void;
  observacao: string;
  aoMudarObservacao: (valor: string) => void;
  erroDaObservacao?: string | undefined;
  somenteLeitura?: boolean;
}) {
  const problemas = problemasDoHorario(turnos);
  return (
    <div className="flex flex-col gap-5 px-7 py-6">
      <p className="text-sm text-foreground-muted">
        Dia sem turno aparece como fechado na ficha. Use dois turnos para almoço
        e jantar; o horário que passa da meia-noite (17:00–01:00) vale.
      </p>
      <ul className="flex flex-col divide-y divide-border rounded-card border border-border">
        {DIAS_DA_SEMANA.map(({ dia, nome }) => {
          const doDia = turnosDoDia(turnos, dia);
          const aberto = doDia.length > 0;
          const problema = problemas.find((p) => p.dia === dia);
          return (
            <li
              key={dia}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3"
            >
              <label className="flex w-36 cursor-pointer items-center gap-2 text-sm font-bold text-foreground">
                <input
                  type="checkbox"
                  checked={aberto}
                  disabled={somenteLeitura}
                  onChange={() => aoEditar((t) => alternarDia(t, dia))}
                  className="size-4 accent-[var(--color-primary-solid)]"
                />
                {nome}
              </label>
              {aberto ? (
                <div className="flex flex-1 flex-wrap items-center gap-3">
                  {doDia.map((turno, indice) => (
                    <span
                      key={`${turno.abre}-${indice}`}
                      className="flex items-center gap-1.5"
                    >
                      <input
                        type="time"
                        aria-label={`${nome}, turno ${indice + 1}, abre`}
                        value={turno.abre}
                        disabled={somenteLeitura}
                        onChange={(e) =>
                          aoEditar((t) =>
                            mudarTurno(t, dia, indice, "abre", e.target.value)
                          )
                        }
                        className={CAMPO_DE_HORA}
                      />
                      <span className="text-foreground-muted">–</span>
                      <input
                        type="time"
                        aria-label={`${nome}, turno ${indice + 1}, fecha`}
                        value={turno.fecha}
                        disabled={somenteLeitura}
                        onChange={(e) =>
                          aoEditar((t) =>
                            mudarTurno(t, dia, indice, "fecha", e.target.value)
                          )
                        }
                        className={CAMPO_DE_HORA}
                      />
                      {!somenteLeitura && (
                        <button
                          type="button"
                          aria-label={`Remover o turno ${indice + 1} de ${nome}`}
                          onClick={() =>
                            aoEditar((t) => removerTurno(t, dia, indice))
                          }
                          className="flex size-8 cursor-pointer items-center justify-center rounded-full text-foreground-muted hover:bg-surface-hover hover:text-danger"
                        >
                          <X aria-hidden="true" className="size-4" />
                        </button>
                      )}
                    </span>
                  ))}
                  {!somenteLeitura && doDia.length < TURNOS_POR_DIA && (
                    <button
                      type="button"
                      onClick={() => aoEditar((t) => adicionarTurno(t, dia))}
                      className="flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary-subtle"
                    >
                      <Plus aria-hidden="true" className="size-3.5" />
                      Turno
                    </button>
                  )}
                  {!somenteLeitura && dia === 1 && (
                    <button
                      type="button"
                      onClick={() => aoEditar((t) => copiarParaASemana(t, 1))}
                      className="ml-auto flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-foreground-muted hover:bg-surface-hover"
                    >
                      <Copy aria-hidden="true" className="size-3.5" />
                      Copiar para todos os dias
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-sm text-foreground-muted">Fechado</span>
              )}
              {problema && (
                <span
                  className={cn("w-full text-xs font-semibold text-danger")}
                  role="alert"
                >
                  {problema.motivo}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      {problemas.length > 0 && (
        <Alerta intencao="atencao">
          Ajuste os dias marcados antes de salvar.
        </Alerta>
      )}
      <CampoDeTexto
        label="Observação do horário"
        valor={observacao}
        aoMudar={aoMudarObservacao}
        erro={erroDaObservacao}
        placeholder="Fecha em feriados · Cozinha até 22h"
        tamanhoMaximo={200}
        somenteLeitura={somenteLeitura}
      />
    </div>
  );
}
