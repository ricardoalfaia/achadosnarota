import { SeloDeStatus } from "@meuproduto/ui";
import { cn } from "@meuproduto/ui/estilos";
import { FileText } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";

import { rotaDoTenant } from "@/shared/rotas";
import {
  intencaoDoStatus,
  maisRecentes,
  type DocumentoRecente,
} from "../domain/painel";
import { SecaoDoPainel } from "./secao-do-painel";

const LIMITE = 5;

const CELULA = "px-4 py-3";

/** A tabela dos últimos documentos mexidos: nome, status e atualização. */
export async function DocumentosRecentes({
  documentos,
  slug,
}: {
  documentos: readonly DocumentoRecente[];
  slug: string;
}) {
  const t = await getTranslations("Painel.documentosRecentes");
  const formato = await getFormatter();
  const recentes = maisRecentes(documentos, LIMITE);

  return (
    <SecaoDoPainel
      titulo={t("titulo")}
      verTodos={{
        href: rotaDoTenant(slug, "/documentos"),
        rotulo: t("verTodos"),
        descricao: t("verTodosDescricao"),
      }}
    >
      <div className="overflow-x-auto rounded-card border border-border bg-surface">
        {recentes.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-foreground-muted">
            {t("vazio")}
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs font-semibold text-foreground-muted">
              <tr>
                <th scope="col" className={CELULA}>
                  {t("colunas.nome")}
                </th>
                <th scope="col" className={CELULA}>
                  {t("colunas.status")}
                </th>
                <th scope="col" className={CELULA}>
                  {t("colunas.atualizacao")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentes.map((documento) => (
                <tr key={documento.id} className="hover:bg-surface-hover">
                  <td className={CELULA}>
                    <span className="flex items-center gap-2.5 font-medium text-foreground">
                      <FileText
                        aria-hidden="true"
                        className="size-4.5 shrink-0 text-foreground-muted"
                      />
                      {documento.nome}
                    </span>
                  </td>
                  <td className={CELULA}>
                    <SeloDeStatus intencao={intencaoDoStatus(documento.status)}>
                      {t(`status.${documento.status}`)}
                    </SeloDeStatus>
                  </td>
                  <td
                    className={cn(
                      CELULA,
                      "whitespace-nowrap text-foreground-muted"
                    )}
                  >
                    <time dateTime={documento.atualizadoEm}>
                      {formato.dateTime(new Date(documento.atualizadoEm), {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </SecaoDoPainel>
  );
}
