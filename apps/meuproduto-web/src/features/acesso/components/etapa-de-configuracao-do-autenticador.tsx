"use client";

import Image from "next/image";
import { CampoDeTexto, IconeCadeado } from "@meuproduto/ui";
import { useTranslations } from "next-intl";

import type { EstadoDoAcesso } from "../domain/estado";
import { BotaoDeEnvio } from "./botao-de-envio";
import { CabecalhoDaEtapa } from "./cabecalho-da-etapa";
import { CampoDeSenha } from "./campo-de-senha";

/**
 * O cadastro obrigatório do autenticador (owner e admin, documento 04), em
 * dois passos: a senha de novo, para gerar o segredo; depois o QR (ou a
 * chave), os códigos de recuperação, mostrados só aqui, e o primeiro código do
 * aplicativo, que liga o segundo fator.
 */
export function EtapaDeConfiguracaoDoAutenticador({
  estado,
  acao,
}: {
  estado: EstadoDoAcesso;
  acao: (dados: FormData) => void;
}) {
  const t = useTranslations("Acesso");
  const erros = estado.erros ?? {};
  const autenticador = estado.autenticador;

  if (!autenticador) {
    return (
      <form action={acao} noValidate className="flex flex-col gap-5">
        <input type="hidden" name="etapa" value="configurarDoisFatores" />
        <input type="hidden" name="fase" value="senha" />
        <CabecalhoDaEtapa titulo={t("autenticador.titulo")}>
          {t("autenticador.subtitulo")}
        </CabecalhoDaEtapa>
        <CampoDeSenha
          label={t("autenticador.senha")}
          name="senhaDeConfirmacao"
          erro={
            erros.senhaDeConfirmacao && t(`erros.${erros.senhaDeConfirmacao}`)
          }
        />
        <BotaoDeEnvio
          rotulo={t("autenticador.gerar")}
          rotuloEnviando={t("autenticador.gerando")}
        />
      </form>
    );
  }

  return (
    <form action={acao} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="etapa" value="configurarDoisFatores" />
      <input type="hidden" name="fase" value="codigo" />
      <CabecalhoDaEtapa titulo={t("autenticador.titulo")}>
        {t("autenticador.lerQr")}
      </CabecalhoDaEtapa>

      {/* SVG gerado no servidor: não passa pelo otimizador do Next. */}
      <Image
        src={autenticador.qrCode}
        alt={t("autenticador.qrAlt")}
        width={176}
        height={176}
        unoptimized
        className="mx-auto rounded-card bg-white p-2"
      />

      <div className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-foreground">
          {t("autenticador.chave")}
        </span>
        <code
          data-testid="chave-do-autenticador"
          className="rounded border border-border bg-surface px-2 py-1 font-mono text-xs break-all text-foreground"
        >
          {autenticador.chave}
        </code>
      </div>

      <section
        aria-labelledby="codigos-de-recuperacao"
        className="flex flex-col gap-2 rounded-card border border-border bg-surface p-3"
      >
        <h3
          id="codigos-de-recuperacao"
          className="text-sm font-bold text-foreground"
        >
          {t("autenticador.codigosTitulo")}
        </h3>
        <p className="text-sm text-foreground-muted">
          {t("autenticador.codigosTexto")}
        </p>
        <ul className="grid grid-cols-2 gap-1 font-mono text-sm text-foreground">
          {autenticador.codigosDeRecuperacao.map((codigo) => (
            <li key={codigo}>{codigo}</li>
          ))}
        </ul>
      </section>

      <CampoDeTexto
        label={t("doisFatores.codigo")}
        name="codigo"
        modoDeEntrada="numeric"
        autoComplete="one-time-code"
        tamanhoMaximo={7}
        required
        {...(erros.codigo ? { erro: t(`erros.${erros.codigo}`) } : {})}
        prefixo={<IconeCadeado />}
      />

      <BotaoDeEnvio
        rotulo={t("autenticador.confirmar")}
        rotuloEnviando={t("doisFatores.enviando")}
      />
    </form>
  );
}
