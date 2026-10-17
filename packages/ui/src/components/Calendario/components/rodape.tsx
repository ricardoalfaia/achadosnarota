import { Botao } from "../../Botao";

/** Limpar e Aplicar, embaixo do calendário. */
export function RodapeDoCalendario({
  podeLimpar,
  podeAplicar,
  aoLimpar,
  aoAplicar,
  resumo,
}: {
  podeLimpar: boolean;
  podeAplicar: boolean;
  aoLimpar: () => void;
  aoAplicar: () => void;
  /** Texto curto no meio ("12 dias"), anunciado a leitores de tela. */
  resumo?: string;
}) {
  return (
    <div className="mt-4 flex items-center justify-between gap-2">
      <Botao variante="fantasma" onClick={aoLimpar} desabilitado={!podeLimpar}>
        Limpar
      </Botao>
      <span
        aria-live="polite"
        className="truncate text-xs text-foreground-muted"
      >
        {resumo}
      </span>
      <Botao onClick={aoAplicar} desabilitado={!podeAplicar}>
        Aplicar
      </Botao>
    </div>
  );
}
