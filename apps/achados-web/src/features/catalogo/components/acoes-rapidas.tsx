import type { ReactNode } from "react";
import { Globe, Navigation, Phone } from "lucide-react";

import {
  hrefComoChegar,
  hrefDoTelefone,
  telefoneParaExibir,
} from "../domain/apresentacao";
import type { FichaDoLugar } from "../domain/tipos";

const ACAO =
  "flex flex-col items-center rounded-2xl bg-surface-raised p-2.5 transition-colors outline-none hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-ring [&_svg]:mb-1 [&_svg]:size-4.5 [&_svg]:text-chip-foreground";
const ROTULO = "text-[10px] font-semibold text-foreground-muted";

/**
 * As quatro ações do protótipo: Ligar, Como chegar, Site e Compartilhar. Só
 * aparece a ação que tem dado; o compartilhar vem pronto de quem compõe, por
 * ser interativo.
 */
export function AcoesRapidas({
  lugar,
  compartilhar,
}: {
  lugar: Pick<FichaDoLugar, "nome" | "telefone" | "endereco" | "site">;
  compartilhar: ReactNode;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 border-t border-border pt-3 text-center">
      {lugar.telefone && (
        <a
          href={hrefDoTelefone(lugar.telefone)}
          className={ACAO}
          aria-label={`Ligar para ${telefoneParaExibir(lugar.telefone)}`}
        >
          <Phone aria-hidden="true" />
          <span className={ROTULO}>Ligar</span>
        </a>
      )}
      {lugar.endereco && (
        <a
          href={hrefComoChegar(lugar.nome, lugar.endereco)}
          target="_blank"
          rel="noopener noreferrer"
          className={ACAO}
        >
          <Navigation aria-hidden="true" />
          <span className={ROTULO}>Como chegar</span>
        </a>
      )}
      {lugar.site && (
        <a
          href={lugar.site}
          target="_blank"
          rel="noopener noreferrer"
          className={ACAO}
        >
          <Globe aria-hidden="true" />
          <span className={ROTULO}>Site</span>
        </a>
      )}
      {compartilhar}
    </div>
  );
}
