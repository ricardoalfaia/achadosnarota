import Link from "next/link";
import { EstadoVazio } from "@achados/ui";
import { estiloDoBotao } from "@achados/ui/estilos";

import { ROTAS } from "@/shared/rotas";
import { CabecalhoDaPagina } from "./cabecalho-da-pagina";
import { ICONE_DA_NAVEGACAO } from "./icones-da-navegacao";
import { itemDeNavegacao, type IdDeNavegacao } from "./navegacao";

/**
 * Item do menu ainda sem tela: a rota existe e diz o que virá, sem fingir que
 * a funcionalidade já funciona (ADR-0018).
 */
export function PaginaEmConstrucao({
  id,
  secao,
  descricao,
}: {
  id: IdDeNavegacao;
  secao?: string;
  /** O que a área vai fazer, em uma frase. */
  descricao: string;
}) {
  const item = itemDeNavegacao(id);
  const Icone = ICONE_DA_NAVEGACAO[id];
  return (
    <>
      <CabecalhoDaPagina secao={secao} titulo={item.rotulo} />
      <EstadoVazio
        nivelDoTitulo="h2"
        icone={<Icone />}
        titulo={`${item.rotulo} em construção`}
        descricao={descricao}
        acao={
          <Link
            href={ROTAS.inicio}
            className={estiloDoBotao({ variante: "contorno", tamanho: "sm" })}
          >
            Voltar ao início
          </Link>
        }
        className="flex-1 animate-pagina"
      />
    </>
  );
}
