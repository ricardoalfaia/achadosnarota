import type { ReactNode } from "react";
import { Globe, Navigation, Phone } from "lucide-react";

import {
  hrefComoChegar,
  hrefDoTelefone,
  telefoneParaExibir,
} from "../domain/apresentacao";
import type { FichaDoLugar } from "../domain/tipos";
import {
  ACAO_DA_FICHA,
  CIRCULO_DA_ACAO,
  ROTULO_DA_ACAO,
} from "./estilo-da-acao";

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
    <div className="grid grid-cols-4 gap-2 text-center">
      {lugar.telefone && (
        <a
          href={hrefDoTelefone(lugar.telefone)}
          className={ACAO_DA_FICHA}
          aria-label={`Ligar para ${telefoneParaExibir(lugar.telefone)}`}
        >
          <span className={CIRCULO_DA_ACAO}>
            <Phone aria-hidden="true" />
          </span>
          <span className={ROTULO_DA_ACAO}>Ligar</span>
        </a>
      )}
      {lugar.endereco && (
        <a
          href={hrefComoChegar(lugar.nome, lugar.endereco)}
          target="_blank"
          rel="noopener noreferrer"
          className={ACAO_DA_FICHA}
        >
          <span className={CIRCULO_DA_ACAO}>
            <Navigation aria-hidden="true" />
          </span>
          <span className={ROTULO_DA_ACAO}>Como chegar</span>
        </a>
      )}
      {lugar.site && (
        <a
          href={lugar.site}
          target="_blank"
          rel="noopener noreferrer"
          className={ACAO_DA_FICHA}
        >
          <span className={CIRCULO_DA_ACAO}>
            <Globe aria-hidden="true" />
          </span>
          <span className={ROTULO_DA_ACAO}>Site</span>
        </a>
      )}
      {compartilhar}
    </div>
  );
}
