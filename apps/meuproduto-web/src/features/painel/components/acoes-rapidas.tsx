import Link from "next/link";
import { CartaoDeAcao, type TomDoCartao } from "@meuproduto/ui";
import {
  FileText,
  LayoutGrid,
  PenLine,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { rotaDoTenant } from "@/shared/rotas";
import { SecaoDoPainel } from "./secao-do-painel";

type IdDaAcao =
  "criarDocumento" | "enviarParaAssinatura" | "usarModelo" | "adicionarCliente";

const ACOES: readonly {
  id: IdDaAcao;
  icone: LucideIcon;
  tom: TomDoCartao;
  caminho: string;
}[] = [
  {
    id: "criarDocumento",
    icone: FileText,
    tom: "primario",
    caminho: "/documentos",
  },
  {
    id: "enviarParaAssinatura",
    icone: PenLine,
    tom: "sucesso",
    caminho: "/assinaturas",
  },
  { id: "usarModelo", icone: LayoutGrid, tom: "primario", caminho: "/modelos" },
  {
    id: "adicionarCliente",
    icone: UserPlus,
    tom: "destaque",
    caminho: "/clientes",
  },
];

/** Os atalhos para as tarefas mais comuns, cada um um link. */
export async function AcoesRapidas({ slug }: { slug: string }) {
  const t = await getTranslations("Painel.acoesRapidas");

  return (
    <SecaoDoPainel titulo={t("titulo")}>
      <ul className="flex flex-col gap-3">
        {ACOES.map(({ id, icone: Icone, tom, caminho }) => (
          <li key={id}>
            <Link
              href={rotaDoTenant(slug, caminho)}
              className="block rounded-card outline-none"
            >
              <CartaoDeAcao
                icone={<Icone />}
                titulo={t(`${id}.titulo`)}
                descricao={t(`${id}.descricao`)}
                tom={tom}
              />
            </Link>
          </li>
        ))}
      </ul>
    </SecaoDoPainel>
  );
}
