"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Alerta, CampoDeTexto, IconeArroba, IconeCheck } from "@meuproduto/ui";
import { estiloDoBotao } from "@meuproduto/ui/estilos";
import { useTranslations } from "next-intl";

import { useConfiguracao } from "@/shared/config/configuracao-provider";
import { solicitarNovaSenha } from "../actions";
import { BotaoDeEnvio } from "./botao-de-envio";

/**
 * O pedido de recuperação de senha: o e-mail e, depois do envio, a
 * mesma confirmação exista ou não cadastro (não se revela quem é usuário).
 */
export function FormularioDeRecuperacao() {
  const t = useTranslations("Acesso");
  const { nome: sistema } = useConfiguracao();
  const [estado, acao] = useActionState(solicitarNovaSenha, null);

  if (estado?.concluido) {
    return (
      <div className="flex flex-col items-center gap-5 py-2 text-center">
        <div className="flex size-16 items-center justify-center rounded-full border-2 border-success bg-success-subtle text-success [&_svg]:size-8">
          <IconeCheck />
        </div>
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground">
            {t("recuperar.concluidoTitulo")}
          </h2>
          <p className="mt-2 text-base leading-snug text-foreground-muted">
            {t("recuperar.concluidoTexto", {
              email: estado.concluido.email,
            })}
          </p>
        </div>
        <Link
          href="/login"
          className={estiloDoBotao({ tamanho: "lg", className: "w-full" })}
        >
          {t("recuperar.voltar")}
        </Link>
      </div>
    );
  }

  return (
    <form action={acao} noValidate className="flex flex-col gap-5">
      <header className="mb-2.5">
        <h2 className="text-4xl font-extrabold tracking-tight text-foreground">
          {t("recuperar.titulo")}
        </h2>
        <p className="mt-2 text-lg leading-snug text-foreground-muted">
          {t("recuperar.subtitulo")}
        </p>
      </header>

      {estado?.mensagem && (
        <Alerta intencao="erro">
          {t(`erros.${estado.mensagem}`, { sistema })}
        </Alerta>
      )}

      <CampoDeTexto
        label={t("recuperar.email")}
        name="email"
        tipo="email"
        autoComplete="username"
        required
        erro={
          estado?.erros?.email ? t(`erros.${estado.erros.email}`) : undefined
        }
        prefixo={<IconeArroba />}
      />

      <BotaoDeEnvio
        rotulo={t("recuperar.botao")}
        rotuloEnviando={t("recuperar.enviando")}
      />
    </form>
  );
}
