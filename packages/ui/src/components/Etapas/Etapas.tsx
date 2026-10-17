import { Check } from "lucide-react";

import { cn } from "../../lib/cn";
import { estadosDasEtapas, type EstadoDaEtapa } from "./estado";

export type Etapa = { id: string; rotulo: string; descricao?: string };

const ROTULOS_DO_ESTADO: Record<EstadoDaEtapa, string> = {
  concluida: "concluída",
  atual: "etapa atual",
  pendente: "pendente",
};

const MARCADOR: Record<EstadoDaEtapa, string> = {
  concluida:
    "border-primary-solid bg-primary-solid text-primary-solid-foreground",
  atual: "border-primary bg-primary-subtle text-primary shadow-ring-glow",
  pendente: "border-border-strong bg-surface text-foreground-muted",
};

/**
 * O progresso de um fluxo em etapas, na horizontal (rascunho → revisão →
 * aprovado → gerado). As anteriores à `atual` aparecem concluídas, com check; a
 * atual leva `aria-current="step"`; as seguintes, pendentes. O estado de cada
 * uma também é lido por leitores de tela. Só mostra: avançar é da aplicação.
 */
export function Etapas({
  etapas,
  atual,
  rotulo = "Progresso",
  rotulosDoEstado = ROTULOS_DO_ESTADO,
  className,
}: {
  etapas: readonly Etapa[];
  /** O `id` da etapa em que o fluxo está. */
  atual: string;
  /** Nome acessível da lista ("Etapas do documento"). */
  rotulo?: string;
  /** Lidos depois de cada etapa por leitores de tela; para traduzir. */
  rotulosDoEstado?: Record<EstadoDaEtapa, string>;
  className?: string;
}) {
  const estados = estadosDasEtapas(
    etapas.map((etapa) => etapa.id),
    atual
  );
  return (
    <ol aria-label={rotulo} className={cn("flex w-full", className)}>
      {etapas.map((etapa, indice) => {
        const estado = estados[indice] ?? "pendente";
        const ultima = indice === etapas.length - 1;
        return (
          <li
            key={etapa.id}
            aria-current={estado === "atual" ? "step" : undefined}
            className="relative flex flex-1 flex-col items-center gap-2 px-2 text-center"
          >
            {!ultima && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-4 right-[calc(-50%+1.25rem)] left-[calc(50%+1.25rem)] h-0.5 rounded-full",
                  estado === "concluida" ? "bg-primary" : "bg-border-strong"
                )}
              />
            )}
            <span
              aria-hidden="true"
              className={cn(
                "flex size-8 items-center justify-center rounded-full border-2 text-sm font-bold tabular-nums",
                MARCADOR[estado]
              )}
            >
              {estado === "concluida" ? (
                <Check className="size-4" strokeWidth={3} />
              ) : (
                indice + 1
              )}
            </span>
            <span className="flex flex-col gap-0.5">
              <span
                className={cn(
                  "text-base font-semibold",
                  estado === "pendente"
                    ? "text-foreground-muted"
                    : "text-foreground"
                )}
              >
                {etapa.rotulo}
                <span className="sr-only">, {rotulosDoEstado[estado]}</span>
              </span>
              {etapa.descricao && (
                <span className="text-sm text-foreground-muted">
                  {etapa.descricao}
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
