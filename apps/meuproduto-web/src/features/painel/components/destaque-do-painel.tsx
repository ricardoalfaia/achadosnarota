import Image from "next/image";
import Link from "next/link";
import { Destaque } from "@meuproduto/ui";
import { estiloDoBotao } from "@meuproduto/ui/estilos";
import { CirclePlus, PenLine } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { rotaDoTenant } from "@/shared/rotas";

/** O banner de boas-vindas: saudação, a frase da marca e as duas ações principais. */
export async function DestaqueDoPainel({
  primeiroNome,
  slug,
}: {
  primeiroNome: string;
  slug: string;
}) {
  const t = await getTranslations("Painel.destaque");

  return (
    <Destaque
      nivelDoTitulo="h1"
      saudacao={
        primeiroNome
          ? t("saudacao", { nome: primeiroNome })
          : t("saudacaoSemNome")
      }
      titulo={t.rich("titulo", {
        quebra: () => <br />,
        destaque: (trecho) => (
          <span className="text-brand-gradient">{trecho}</span>
        ),
      })}
      descricao={t("descricao")}
      acoes={
        <>
          <Link
            href={rotaDoTenant(slug, "/documentos")}
            className={estiloDoBotao({ tamanho: "md" })}
          >
            <CirclePlus aria-hidden="true" />
            {t("gerarDocumento")}
          </Link>
          <Link
            href={rotaDoTenant(slug, "/assinaturas")}
            className={estiloDoBotao({ variante: "contorno", tamanho: "md" })}
          >
            <PenLine aria-hidden="true" />
            {t("enviarParaAssinatura")}
          </Link>
        </>
      }
      ilustracao={
        <Image
          src="/emblema-meuproduto.png"
          alt=""
          width={190}
          height={190}
          priority
          className="drop-shadow-xl"
        />
      }
    />
  );
}
