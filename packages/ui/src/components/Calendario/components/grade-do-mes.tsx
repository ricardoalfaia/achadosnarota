import { useId } from "react";

import type { Calendario, EstadoDoDia } from "../../../hooks/use-calendario";
import {
  semanasDoMes,
  tituloDoMes,
  type DataIso,
  type Mes,
} from "../../../lib/datas";
import { Dia } from "./dia";

const DIAS_DA_SEMANA = [
  ["D", "domingo"],
  ["S", "segunda"],
  ["T", "terça"],
  ["Q", "quarta"],
  ["Q", "quinta"],
  ["S", "sexta"],
  ["S", "sábado"],
] as const;

export function GradeDoMes({
  mes,
  calendario,
  estadoDoDia,
  hoje,
  tabulavel,
  aoEscolher,
  aoPassar,
}: {
  mes: Mes;
  calendario: Calendario;
  estadoDoDia: (dia: DataIso) => EstadoDoDia;
  hoje: DataIso | null;
  tabulavel: DataIso | null;
  aoEscolher: (dia: DataIso) => void;
  aoPassar?: (dia: DataIso | null) => void;
}) {
  const idDoTitulo = useId();

  return (
    <div>
      <h3
        id={idDoTitulo}
        className="mb-4 flex h-8 items-center pr-20 text-base font-bold text-foreground"
      >
        {tituloDoMes(mes)}
      </h3>
      <table
        role="grid"
        aria-labelledby={idDoTitulo}
        className="border-collapse"
      >
        <thead>
          <tr>
            {DIAS_DA_SEMANA.map(([inicial, nome]) => (
              <th
                key={nome}
                scope="col"
                abbr={nome}
                className="w-10 pb-3 text-xs font-medium text-primary"
              >
                {inicial}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {semanasDoMes(mes).map((semana, linha) => (
            <tr key={linha}>
              {semana.map((dia, coluna) => (
                <td key={dia ?? `vazio-${coluna}`} className="p-0">
                  {dia && (
                    <Dia
                      dia={dia}
                      estado={estadoDoDia(dia)}
                      hoje={dia === hoje}
                      desabilitado={calendario.estaDesabilitada(dia)}
                      tabulavel={dia === tabulavel}
                      aoEscolher={aoEscolher}
                      aoPassar={aoPassar}
                      aoTeclar={calendario.aoTeclar}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
