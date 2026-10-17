"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { CampoDeTexto, Checkbox, IconeArroba } from "@meuproduto/ui";
import { useTranslations } from "next-intl";

import { useConfiguracao } from "@/shared/config/configuracao-provider";
import type { EstadoDoAcesso } from "../domain/estado";
import {
  guardarUsuarioLembrado,
  lerUsuarioLembrado,
} from "../domain/usuario-lembrado";
import { BotaoDeEnvio } from "./botao-de-envio";
import { CabecalhoDaEtapa } from "./cabecalho-da-etapa";
import { CampoDeSenha } from "./campo-de-senha";

export const ROTA_DA_RECUPERACAO = "/login/esqueci-a-senha";

// O e-mail lembrado é estado externo (localStorage): no servidor não existe,
// no navegador entra na hidratação sem efeito nem segundo render.
function assinarArmazenamento(aoMudar: () => void) {
  window.addEventListener("storage", aoMudar);
  return () => window.removeEventListener("storage", aoMudar);
}

function useEmailLembrado(): string {
  return useSyncExternalStore(
    assinarArmazenamento,
    () => lerUsuarioLembrado(localStorage),
    () => ""
  );
}

/** E-mail, senha, "lembrar meu e-mail" e o link de recuperação. */
export function EtapaDeCredenciais({
  estado,
  acao,
  aoDigitarSenha,
}: {
  estado: EstadoDoAcesso;
  acao: (dados: FormData) => void;
  /** A senha fica na memória da tela para a troca obrigatória não pedi-la de novo. */
  aoDigitarSenha: (senha: string) => void;
}) {
  const t = useTranslations("Acesso");
  const { nome: sistema } = useConfiguracao();
  const lembrado = useEmailLembrado();
  // `null` enquanto a pessoa não mexeu: vale o que estava lembrado.
  const [emailDigitado, setEmailDigitado] = useState<string | null>(null);
  const [lembrarEscolhido, setLembrarEscolhido] = useState<boolean | null>(
    null
  );
  const email = emailDigitado ?? lembrado;
  const lembrar = lembrarEscolhido ?? lembrado !== "";
  const erros = estado.erros ?? {};

  return (
    <form
      action={acao}
      noValidate
      onSubmit={() => guardarUsuarioLembrado(localStorage, email, lembrar)}
      className="flex flex-col gap-5"
    >
      <input type="hidden" name="etapa" value="credenciais" />
      <CabecalhoDaEtapa titulo={t("entrar.titulo")}>
        {t("entrar.subtitulo", { sistema })}
      </CabecalhoDaEtapa>

      <CampoDeTexto
        label={t("entrar.email")}
        name="email"
        tipo="email"
        valor={email}
        aoMudar={setEmailDigitado}
        autoComplete="username"
        required
        {...(erros.email ? { erro: t(`erros.${erros.email}`) } : {})}
        prefixo={<IconeArroba />}
      />

      <CampoDeSenha
        label={t("entrar.senha")}
        name="senha"
        aoMudar={aoDigitarSenha}
        erro={erros.senha && t(`erros.${erros.senha}`)}
      />

      <div className="flex items-center justify-between gap-4 text-sm">
        <Checkbox
          label={t("entrar.lembrarEmail")}
          marcado={lembrar}
          aoMudar={setLembrarEscolhido}
        />
        <Link
          href={ROTA_DA_RECUPERACAO}
          className="font-semibold text-primary underline-offset-3 hover:underline"
        >
          {t("entrar.esqueciASenha")}
        </Link>
      </div>

      <BotaoDeEnvio
        rotulo={t("entrar.botao")}
        rotuloEnviando={t("entrar.enviando")}
      />
    </form>
  );
}
