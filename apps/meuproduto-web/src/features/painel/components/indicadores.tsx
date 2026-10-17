import Link from "next/link";
import { CartaoDeIndicador, type TomDoCartao } from "@meuproduto/ui";
import { Clock, FileText, PenLine, Users, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { rotaDoTenant } from "@/shared/rotas";
import {
  textoDaVariacao,
  type IdDoIndicador,
  type Indicador,
} from "../domain/painel";

const APARENCIA: Record<
  IdDoIndicador,
  { icone: LucideIcon; tom: TomDoCartao; caminho: string }
> = {
  documentos: { icone: FileText, tom: "primario", caminho: "/documentos" },
  assinaturas: { icone: PenLine, tom: "sucesso", caminho: "/assinaturas" },
  clientes: { icone: Users, tom: "destaque", caminho: "/clientes" },
  pendentes: { icone: Clock, tom: "aviso", caminho: "/documentos" },
};

/** Os quatro números do topo do painel, cada um levando à sua lista. */
export async function Indicadores({
  indicadores,
  slug,
}: {
  indicadores: readonly Indicador[];
  slug: string;
}) {
  const t = await getTranslations("Painel.indicadores");

  return (
    <ul
      aria-label={t("rotulo")}
      className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1"
    >
      {indicadores.map((indicador) => {
        const { icone: Icone, tom, caminho } = APARENCIA[indicador.id];
        return (
          <li key={indicador.id}>
            <Link
              href={rotaDoTenant(slug, caminho)}
              className="block h-full rounded-card outline-none"
            >
              <CartaoDeIndicador
                icone={<Icone />}
                valor={indicador.valor}
                rotulo={t(indicador.id)}
                tom={tom}
                {...(indicador.variacao
                  ? {
                      variacao: {
                        texto: textoDaVariacao(indicador.variacao.percentual),
                        tendencia: indicador.variacao.tendencia,
                        descricao: t("esteMes"),
                      },
                    }
                  : {})}
                rotulosDaTendencia={{
                  alta: t("tendencias.alta"),
                  baixa: t("tendencias.baixa"),
                  estavel: t("tendencias.estavel"),
                }}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
