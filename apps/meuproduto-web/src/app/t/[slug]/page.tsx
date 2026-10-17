import { Alerta } from "@meuproduto/ui";
import { getTranslations } from "next-intl/server";

import {
  AcoesRapidas,
  DestaqueDoPainel,
  DocumentosRecentes,
  Indicadores,
  lerPainel,
  ModelosMaisUsados,
} from "@/features/painel";
import { primeiroNome } from "@/shared/sessao/sessao";
import { exigirTenant } from "@/shared/sessao/tenant.servidor";

/**
 * O início do tenant: o painel do mockup, composto no servidor. O indicador de
 * clientes vem do banco, pelo RLS do tenant; o resto ainda é sintético. Falha
 * do banco mostra o erro na região do painel, sem derrubar a página.
 */
export default async function Inicio({ params }: PageProps<"/t/[slug]">) {
  const { slug } = await params;
  // Layout não é barreira: a página confere o tenant por conta própria.
  const contexto = await exigirTenant(slug);
  const painel = await lerPainel(contexto);
  const t = await getTranslations("Painel");

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-7">
      <DestaqueDoPainel
        primeiroNome={primeiroNome(contexto.usuario.nome)}
        slug={slug}
      />

      {painel.ok ? (
        <>
          <Indicadores indicadores={painel.value.indicadores} slug={slug} />
          <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-7 max-xl:grid-cols-1">
            <div className="flex min-w-0 flex-col gap-7">
              <DocumentosRecentes
                documentos={painel.value.documentosRecentes}
                slug={slug}
              />
              <ModelosMaisUsados
                modelos={painel.value.modelosMaisUsados}
                slug={slug}
              />
            </div>
            <AcoesRapidas slug={slug} />
          </div>
        </>
      ) : (
        <Alerta intencao="erro">{t("falha")}</Alerta>
      )}
    </div>
  );
}
