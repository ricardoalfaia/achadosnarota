import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Alerta } from "@achados/ui";
import { getTranslations } from "next-intl/server";

import { FormularioDeEntrada, type EstadoDoAcesso } from "@/features/acesso";
import { configuracaoDoApp } from "@/shared/config/configuracao";
import { destinoSeguro, rotaDeCriarConta } from "@/shared/rotas";
import { lerSessao, pendenciasDe } from "@/shared/sessao/sessao.servidor";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Acesso.entrar");
  return { title: t("titulo"), robots: { index: false } };
}

/**
 * A tela de entrada. Com sessão válida e nada pendente, volta para onde a
 * pessoa estava; com troca de senha pendente, o formulário já começa nessa
 * etapa. Banco fora do ar: o formulário aparece com o aviso.
 */
export default async function PaginaDeLogin({
  searchParams,
}: PageProps<"/login">) {
  const { voltar: pedido } = await searchParams;
  const voltar = destinoSeguro(typeof pedido === "string" ? pedido : undefined);

  const sessao = await lerSessao();
  let inicial: EstadoDoAcesso | undefined;
  const indisponivel = !sessao.ok;

  if (sessao.ok && sessao.value) {
    const pendencias = pendenciasDe(sessao.value);
    if (pendencias.length === 0) redirect(voltar);
    inicial = { etapa: pendencias[0]! };
  }

  const t = await getTranslations("Acesso");
  return (
    <>
      {indisponivel && (
        <Alerta intencao="erro" className="mb-5">
          {t("conexao.servicoIndisponivel", {
            sistema: configuracaoDoApp.nome,
          })}
        </Alerta>
      )}
      <FormularioDeEntrada voltar={voltar} {...(inicial ? { inicial } : {})} />
      <p className="mt-6 text-center text-sm text-foreground-muted">
        {t("entrar.semConta")}{" "}
        <Link
          href={rotaDeCriarConta(voltar)}
          className="font-bold text-primary underline-offset-2 hover:underline"
        >
          {t("entrar.criarConta")}
        </Link>
      </p>
    </>
  );
}
