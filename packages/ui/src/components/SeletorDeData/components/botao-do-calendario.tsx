import { cn } from "../../../lib/cn";
import { IconeCalendario, IconeSeta } from "../../Icones";

/** Ícone à direita: calendário fechado, seta para cima aberto. Fora da ordem de Tab — o input já abre. */
export function BotaoDoCalendario({
  aberto,
  compacto,
  aoClicar,
  desabilitado,
}: {
  aberto: boolean;
  /** Botão menor, para o campo `sm`. */
  compacto?: boolean;
  aoClicar: () => void;
  desabilitado?: boolean;
}) {
  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={aoClicar}
      disabled={desabilitado}
      aria-label={aberto ? "Fechar calendário" : "Abrir calendário"}
      className={cn(
        "flex items-center justify-center rounded-full text-foreground-muted hover:bg-surface-hover disabled:cursor-not-allowed",
        compacto ? "size-6" : "size-8"
      )}
    >
      {aberto ? <IconeSeta aberto /> : <IconeCalendario />}
    </button>
  );
}
