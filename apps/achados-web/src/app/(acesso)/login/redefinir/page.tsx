import type { Metadata } from "next";
import Link from "next/link";
import { Alerta, IconeSetaLonga } from "@achados/ui";
import { getTranslations } from "next-intl/server";

import {
  FormularioDeRedefinicao,
  ROTA_DA_RECUPERACAO,
} from "@/features/acesso";
import { configuracaoDoApp } from "@/shared/config/configuracao";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Acesso.redefinir");
  return {
    title: `${t("titulo")} · ${configuracaoDoApp.nome}`,
    // O endereço leva o token do link: nada de Referer para outros sites.
    referrer: "no-referrer",
  };
}

/** A redefinição de senha pelo link do e-mail (`?token=...`). */
export default async function PaginaDeRedefinicao({
  searchParams,
}: PageProps<"/login/redefinir">) {
  const { token } = await searchParams;
  const t = await getTranslations("Acesso");
  const valido = typeof token === "string" && token.length > 0;

  return (
    <>
      <Link
        href="/login"
        className="mb-7 inline-flex items-center gap-2 text-base font-semibold text-primary transition-transform duration-200 ease-smooth hover:-translate-x-1"
      >
        <IconeSetaLonga className="rotate-180" />
        {t("recuperar.voltar")}
      </Link>
      {valido ? (
        <FormularioDeRedefinicao token={token} />
      ) : (
        <div className="flex flex-col gap-5">
          <Alerta intencao="erro">{t("erros.linkInvalido")}</Alerta>
          <Link
            href={ROTA_DA_RECUPERACAO}
            className="font-semibold text-primary underline-offset-3 hover:underline"
          >
            {t("redefinir.pedirOutro")}
          </Link>
        </div>
      )}
    </>
  );
}
