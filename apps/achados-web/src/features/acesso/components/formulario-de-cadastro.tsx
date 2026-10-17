"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  Alerta,
  CampoDeTexto,
  Checkbox,
  IconeArroba,
  IconeUsuario,
} from "@achados/ui";
import { useTranslations } from "next-intl";

import { useConfiguracao } from "@/shared/config/configuracao-provider";
import { criarConta, type EstadoDoCadastro } from "../actions";
import { BotaoDeEnvio } from "./botao-de-envio";
import { CabecalhoDaEtapa } from "./cabecalho-da-etapa";
import { CampoDeSenha } from "./campo-de-senha";

/**
 * O cadastro de assinante: nome, e-mail, senha e o aceite dos termos. Só o
 * mínimo para a conta (docs/produto/04): nada de CPF, telefone ou endereço.
 * Quem valida de verdade é o servidor; os erros voltam por campo.
 */
export function FormularioDeCadastro({
  voltar,
  rotaDosTermos,
  rotaDaPrivacidade,
}: {
  voltar: string;
  rotaDosTermos: string;
  rotaDaPrivacidade: string;
}) {
  const t = useTranslations("Acesso");
  const { nome: sistema } = useConfiguracao();
  const [estado, acao] = useActionState<EstadoDoCadastro, FormData>(
    criarConta,
    null
  );
  const erros = estado?.erros ?? {};

  return (
    <form action={acao} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="voltar" value={voltar} />
      <CabecalhoDaEtapa titulo={t("cadastro.titulo")}>
        {t("cadastro.subtitulo")}
      </CabecalhoDaEtapa>

      {estado?.mensagem && (
        <Alerta intencao="erro">
          {t(`erros.${estado.mensagem}`, { sistema })}
        </Alerta>
      )}

      <CampoDeTexto
        label={t("cadastro.nome")}
        name="nome"
        autoComplete="name"
        required
        valorInicial={estado?.valores?.nome ?? ""}
        prefixo={<IconeUsuario />}
        {...(erros.nome ? { erro: t(`erros.${erros.nome}`) } : {})}
      />
      <CampoDeTexto
        label={t("cadastro.email")}
        name="email"
        tipo="email"
        autoComplete="email"
        required
        valorInicial={estado?.valores?.email ?? ""}
        prefixo={<IconeArroba />}
        {...(erros.email ? { erro: t(`erros.${erros.email}`) } : {})}
      />
      <CampoDeSenha
        label={t("cadastro.senha")}
        name="senha"
        nova
        erro={erros.senha && t(`erros.${erros.senha}`)}
      />

      <div className="flex flex-col gap-1.5">
        <Checkbox
          name="aceite"
          label={t.rich("cadastro.aceite", {
            termos: (trecho) => (
              <Link
                href={rotaDosTermos}
                target="_blank"
                className="font-semibold text-primary underline underline-offset-2"
              >
                {trecho}
              </Link>
            ),
            privacidade: (trecho) => (
              <Link
                href={rotaDaPrivacidade}
                target="_blank"
                className="font-semibold text-primary underline underline-offset-2"
              >
                {trecho}
              </Link>
            ),
          })}
        />
        {erros.aceite && (
          <p role="alert" className="text-sm text-danger">
            {t(`erros.${erros.aceite}`)}
          </p>
        )}
      </div>

      <BotaoDeEnvio
        rotulo={t("cadastro.botao")}
        rotuloEnviando={t("cadastro.enviando")}
      />
    </form>
  );
}
