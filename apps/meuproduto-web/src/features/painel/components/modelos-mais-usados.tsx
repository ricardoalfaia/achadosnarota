import Link from "next/link";
import { CartaoDeModelo, type TomDoCartao } from "@meuproduto/ui";
import { FileLock, FileText, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { rotaDoTenant } from "@/shared/rotas";
import type { IconeDoModelo, ModeloMaisUsado } from "../domain/painel";
import { SecaoDoPainel } from "./secao-do-painel";

const ICONE: Record<IconeDoModelo, LucideIcon> = {
  documento: FileText,
  cadeado: FileLock,
};

/** Os tons em sequência, como no mockup: verde água, azul, roxo... */
const TONS: readonly TomDoCartao[] = ["sucesso", "primario", "destaque"];

/** Os modelos que o escritório mais usa, cada um levando aos modelos. */
export async function ModelosMaisUsados({
  modelos,
  slug,
}: {
  modelos: readonly ModeloMaisUsado[];
  slug: string;
}) {
  const t = await getTranslations("Painel.modelosMaisUsados");
  const href = rotaDoTenant(slug, "/modelos");

  return (
    <SecaoDoPainel
      titulo={t("titulo")}
      verTodos={{
        href,
        rotulo: t("verTodos"),
        descricao: t("verTodosDescricao"),
      }}
    >
      {modelos.length === 0 ? (
        <p className="text-sm text-foreground-muted">{t("vazio")}</p>
      ) : (
        <ul className="grid grid-cols-4 gap-4 max-lg:grid-cols-2">
          {modelos.map((modelo, indice) => {
            const Icone = ICONE[modelo.icone];
            return (
              <li key={modelo.id}>
                <Link
                  href={href}
                  className="block h-full rounded-card outline-none"
                >
                  <CartaoDeModelo
                    icone={<Icone />}
                    nome={modelo.nome}
                    detalhe={t("usos", { quantidade: modelo.usos })}
                    tom={TONS[indice % TONS.length]}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </SecaoDoPainel>
  );
}
