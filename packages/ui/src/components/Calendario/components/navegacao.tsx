import type { Calendario } from "../../../hooks/use-calendario";
import { IconeLateral } from "../../Icones";

const BOTAO =
  "flex size-8 items-center justify-center rounded-full border border-primary text-primary transition-colors hover:bg-primary-subtle focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:border-primary/30 disabled:text-primary/30 disabled:hover:bg-transparent";

/** Mês anterior e próximo, no canto superior direito, alinhados ao título. */
export function Navegacao({ calendario }: { calendario: Calendario }) {
  return (
    <div className="absolute top-0 right-0 flex gap-2">
      <button
        type="button"
        className={BOTAO}
        onClick={calendario.anterior}
        disabled={!calendario.podeVoltar}
        aria-label="Mês anterior"
      >
        <IconeLateral direcao="anterior" />
      </button>
      <button
        type="button"
        className={BOTAO}
        onClick={calendario.proximo}
        disabled={!calendario.podeAvancar}
        aria-label="Próximo mês"
      >
        <IconeLateral direcao="proximo" />
      </button>
    </div>
  );
}
