import type { Metadata } from "next";
import Link from "next/link";
import { IconeSetaLonga } from "@meuproduto/ui";
import { getTranslations } from "next-intl/server";

import { FormularioDeRecuperacao } from "@/features/acesso";
import { configuracaoDoApp } from "@/shared/config/configuracao";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Acesso.recuperar");
  return { title: `${t("titulo")} · ${configuracaoDoApp.nome}` };
}

/** Recuperação de senha: o pedido, com o caminho de volta para o login. */
export default async function PaginaDeRecuperacaoDeSenha() {
  const t = await getTranslations("Acesso.recuperar");

  return (
    <>
      <Link
        href="/login"
        className="mb-7 inline-flex items-center gap-2 text-base font-semibold text-primary transition-transform duration-200 ease-smooth hover:-translate-x-1"
      >
        <IconeSetaLonga className="rotate-180" />
        {t("voltar")}
      </Link>
      <FormularioDeRecuperacao />
    </>
  );
}
