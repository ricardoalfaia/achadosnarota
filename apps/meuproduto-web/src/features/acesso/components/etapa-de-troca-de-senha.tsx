"use client";

import { useTranslations } from "next-intl";

import type { EstadoDoAcesso } from "../domain/estado";
import { BotaoDeEnvio } from "./botao-de-envio";
import { CabecalhoDaEtapa } from "./cabecalho-da-etapa";
import { CampoDeSenha } from "./campo-de-senha";

/**
 * A troca obrigatória de senha (senha provisória). A senha atual é a que a
 * pessoa acabou de digitar: vai junto, sem pedir de novo. Se a página foi
 * recarregada, ela não está na memória e o campo aparece.
 */
export function EtapaDeTrocaDeSenha({
  estado,
  acao,
  senhaAtual,
}: {
  estado: EstadoDoAcesso;
  acao: (dados: FormData) => void;
  senhaAtual: string;
}) {
  const t = useTranslations("Acesso");
  const erros = estado.erros ?? {};

  return (
    <form action={acao} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="etapa" value="trocaDeSenha" />
      <CabecalhoDaEtapa titulo={t("trocaDeSenha.titulo")}>
        {t("trocaDeSenha.subtitulo")}
      </CabecalhoDaEtapa>

      {senhaAtual ? (
        <input type="hidden" name="senhaAtual" value={senhaAtual} />
      ) : (
        <CampoDeSenha
          label={t("trocaDeSenha.senhaAtual")}
          name="senhaAtual"
          erro={erros.senhaAtual && t(`erros.${erros.senhaAtual}`)}
        />
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
        rotulo={t("trocaDeSenha.botao")}
        rotuloEnviando={t("trocaDeSenha.enviando")}
      />
    </form>
  );
}
