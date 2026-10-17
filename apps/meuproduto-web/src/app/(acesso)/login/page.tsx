import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Alerta } from "@meuproduto/ui";
import { getTranslations } from "next-intl/server";

import { FormularioDeEntrada, type EstadoDoAcesso } from "@/features/acesso";
import { configuracaoDoApp } from "@/shared/config/configuracao";
import { lerSessao, pendenciasDe } from "@/shared/sessao/sessao.servidor";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Acesso.entrar");
  return { title: `${t("titulo")} · ${configuracaoDoApp.nome}` };
}

/**
 * A tela de entrada. Com sessão válida e nada pendente, vai ao sistema; com
 * troca de senha ou autenticador pendente, o formulário já começa nessa etapa.
 * Cookie vencido ou revogado não abre sessão: o formulário aparece (sem laço
 * com o proxy). Banco fora do ar: o formulário aparece com o aviso.
 */
export default async function PaginaDeLogin() {
  const sessao = await lerSessao();
  let inicial: EstadoDoAcesso | undefined;
  let indisponivel = !sessao.ok;

  if (sessao.ok && sessao.value) {
    const pendencias = await pendenciasDe(sessao.value);
    if (!pendencias.ok) indisponivel = true;
    else if (pendencias.value.length === 0) redirect("/");
    else inicial = { etapa: pendencias.value[0]! };
  }

  const t = await getTranslations("Acesso.conexao");
  return (
    <>
      {indisponivel && (
        <Alerta intencao="erro" className="mb-5">
          {t("servicoIndisponivel", { sistema: configuracaoDoApp.nome })}
        </Alerta>
      )}
      <FormularioDeEntrada {...(inicial ? { inicial } : {})} />
    </>
  );
}
