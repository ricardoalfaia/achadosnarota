import type { KeyboardEvent } from "react";

import type { EstadoDoDia } from "../../../hooks/use-calendario";
import { cn } from "../../../lib/cn";
import { dataPorExtenso, diaDoMes, type DataIso } from "../../../lib/datas";

/** Faixa atrás do botão: é ela que liga o início ao fim do período. */
const FAIXA: Record<EstadoDoDia, string> = {
  normal: "",
  selecionado: "",
  inicio: "rounded-l-full bg-primary-subtle",
  meio: "bg-primary-subtle",
  fim: "rounded-r-full bg-primary-subtle",
  previa: "bg-primary-subtle/50",
};

const MARCADO: EstadoDoDia[] = ["selecionado", "inicio", "fim"];

export function Dia({
  dia,
  estado,
  hoje,
  desabilitado,
  tabulavel,
  aoEscolher,
  aoPassar,
  aoTeclar,
}: {
  dia: DataIso;
  estado: EstadoDoDia;
  hoje: boolean;
  desabilitado: boolean;
  tabulavel: boolean;
  aoEscolher: (dia: DataIso) => void;
  aoPassar?: (dia: DataIso | null) => void;
  aoTeclar: (evento: KeyboardEvent, dia: DataIso) => void;
}) {
  const marcado = MARCADO.includes(estado);

  return (
    <div className={cn("py-0.5", FAIXA[estado])}>
      <button
        type="button"
        data-dia={dia}
        tabIndex={tabulavel ? 0 : -1}
        aria-label={dataPorExtenso(dia)}
        aria-pressed={marcado}
        aria-current={hoje ? "date" : undefined}
        aria-disabled={desabilitado || undefined}
        onClick={() => !desabilitado && aoEscolher(dia)}
        onMouseEnter={() => aoPassar?.(dia)}
        onKeyDown={(evento) => aoTeclar(evento, dia)}
        className={cn(
          "mx-auto flex size-9 items-center justify-center rounded-full text-sm text-foreground transition-colors outline-none hover:bg-primary-subtle focus-visible:ring-2 focus-visible:ring-ring",
          hoje && "font-semibold text-primary",
          (estado === "meio" || estado === "previa") &&
            "text-foreground hover:bg-primary/15",
          marcado &&
            "bg-primary-solid font-semibold text-primary-solid-foreground hover:bg-primary-solid",
          desabilitado &&
            "cursor-not-allowed text-foreground-subtle hover:bg-transparent"
        )}
      >
        {diaDoMes(dia)}
      </button>
    </div>
  );
}
