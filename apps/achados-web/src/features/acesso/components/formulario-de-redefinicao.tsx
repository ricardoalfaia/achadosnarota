"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Alerta, IconeCheck } from "@achados/ui";
import { estiloDoBotao } from "@achados/ui/estilos";
import { useTranslations } from "next-intl";

import { salvarNovaSenha } from "../actions";
import { BotaoDeEnvio } from "./botao-de-envio";
import { CabecalhoDaEtapa } from "./cabecalho-da-etapa";
import { CampoDeSenha } from "./campo-de-senha";

/**
 * A senha nova, a partir do link do e-mail. O token do link vai num campo
 * oculto; ao salvar, todas as sessões da conta são encerradas.
 */
export function FormularioDeRedefinicao({ token }: { token: string }) {
  const t = useTranslations("Acesso");
  const [estado, acao] = useActionState(salvarNovaSenha, null);
  const erros = estado?.erros ?? {};

  if (estado?.concluido) {
    return (
      <div className="flex flex-col items-center gap-5 py-2 text-center">
        <div className="flex size-16 items-center justify-center rounded-full border-2 border-success bg-success-subtle text-success [&_svg]:size-8">
          <IconeCheck />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            {t("redefinir.concluidoTitulo")}
          </h1>
          <p className="mt-2 text-base leading-snug text-foreground-muted">
            {t("redefinir.concluidoTexto")}
          </p>
        </div>
        <Link
          href="/login"
          className={estiloDoBotao({ tamanho: "lg", className: "w-full" })}
        >
          {t("redefinir.entrar")}
        </Link>
      </div>
    );
  }

  return (
    <form action={acao} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="token" value={token} />
      <CabecalhoDaEtapa titulo={t("redefinir.titulo")}>
        {t("redefinir.subtitulo")}
      </CabecalhoDaEtapa>

      {(estado?.mensagem || erros.token) && (
        <Alerta intencao="erro">
          {estado?.mensagem
            ? t(`erros.${estado.mensagem}`)
            : t("erros.linkInvalido")}
        </Alerta>
      )}

      <CampoDeSenha
        label={t("trocaDeSenha.novaSenha")}
        name="novaSenha"
        nova
        erro={erros.novaSenha && t(`erros.${erros.novaSenha}`)}
      />
      <CampoDeSenha
        label={t("trocaDeSenha.confirmacao")}
        name="confirmacao"
        nova
        erro={erros.confirmacao && t(`erros.${erros.confirmacao}`)}
      />

      <BotaoDeEnvio
        rotulo={t("redefinir.botao")}
        rotuloEnviando={t("trocaDeSenha.enviando")}
      />
    </form>
  );
}
