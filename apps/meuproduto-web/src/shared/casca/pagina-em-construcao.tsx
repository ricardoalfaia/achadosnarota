import type { Metadata } from "next";
import Link from "next/link";
import { EstadoVazio } from "@meuproduto/ui";
import { estiloDoBotao } from "@meuproduto/ui/estilos";
import { getTranslations } from "next-intl/server";

import { configuracaoDoApp } from "@/shared/config/configuracao";
import { rotaDoTenant } from "@/shared/rotas";
import { exigirTenant } from "@/shared/sessao/tenant.servidor";
import { ICONE_DE_NAVEGACAO } from "./icones-de-navegacao";
import type { IdEmConstrucao } from "./navegacao";

/** O título da aba de um item do menu: "Documentos · Meuproduto". */
export async function metadataDoItem(id: IdEmConstrucao): Promise<Metadata> {
  const t = await getTranslations("Navegacao");
  return { title: `${t(id)} · ${configuracaoDoApp.nome}` };
}

/**
 * A página de um item do menu que ainda não tem tela: o nome do item e um
 * estado vazio dizendo o que virá, sem prazo. Cada item tem a sua rota (nada
 * de rota coringa, para endereço errado continuar dando 404); todas usam esta
 * mesma página. Confere o tenant por conta própria: layout não é barreira.
 */
export async function PaginaEmConstrucao({
  id,
  slug,
}: {
  id: IdEmConstrucao;
  slug: string;
}) {
  const { tenant } = await exigirTenant(slug);
  const t = await getTranslations("EmConstrucao");
  const tNavegacao = await getTranslations("Navegacao");
  const Icone = ICONE_DE_NAVEGACAO[id];

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        {tNavegacao(id)}
      </h1>
      <EstadoVazio
        icone={<Icone />}
        titulo={t("titulo")}
        descricao={t(`itens.${id}`)}
        acao={
          <Link
            href={rotaDoTenant(tenant.slug, "/")}
            className={estiloDoBotao({ variante: "contorno" })}
          >
            {t("voltar")}
          </Link>
        }
        className="rounded-card border border-border bg-surface py-14"
      />
    </div>
  );
}
