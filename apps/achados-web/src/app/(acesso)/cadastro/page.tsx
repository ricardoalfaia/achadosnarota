import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { FormularioDeCadastro } from "@/features/acesso";
import { destinoSeguro, rotaDeEntrar } from "@/shared/rotas";
import { sessaoLiberada } from "@/shared/sessao/sessao.servidor";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Acesso.cadastro");
  return { title: t("titulo"), robots: { index: false } };
}

/** Criar conta. Quem já entrou volta para onde estava. */
export default async function PaginaDeCadastro({
  searchParams,
}: PageProps<"/cadastro">) {
  const { voltar: pedido } = await searchParams;
  const voltar = destinoSeguro(typeof pedido === "string" ? pedido : undefined);
  if (await sessaoLiberada()) redirect(voltar);

  const t = await getTranslations("Acesso.cadastro");
  return (
    <>
      <FormularioDeCadastro
        voltar={voltar}
        rotaDosTermos="/termos"
        rotaDaPrivacidade="/privacidade"
      />
      <p className="mt-6 text-center text-sm text-foreground-muted">
        {t("jaTemConta")}{" "}
        <Link
          href={rotaDeEntrar(voltar)}
          className="font-bold text-primary underline-offset-2 hover:underline"
        >
          {t("entrar")}
        </Link>
      </p>
    </>
  );
}
