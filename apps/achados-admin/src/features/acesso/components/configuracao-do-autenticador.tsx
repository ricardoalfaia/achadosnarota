"use client";

import { Alerta, Botao, CampoDeTexto } from "@achados/ui";

import { useConfiguracaoDoAutenticador } from "../hooks/use-entrada";

/**
 * O autenticador é obrigatório no painel. No primeiro acesso: a senha de
 * novo, o QR (ou a chave para digitar), os códigos de recuperação e o
 * primeiro código, que liga o 2FA.
 */
export function ConfiguracaoDoAutenticador() {
  const { estado, enviar, enviando } = useConfiguracaoDoAutenticador();
  return (
    <form action={enviar} className="flex flex-col gap-4">
      {estado.etapa === "senha" ? (
        <>
          <p className="text-sm leading-relaxed text-foreground-muted">
            O painel exige um aplicativo autenticador (Google Authenticator,
            Microsoft Authenticator, 1Password…). Confirme a sua senha para
            gerar o código de configuração.
          </p>
          <CampoDeTexto
            label="Senha"
            name="senha"
            tipo="password"
            autoComplete="current-password"
            required
            focoInicial
          />
        </>
      ) : (
        <>
          <p className="text-sm leading-relaxed text-foreground-muted">
            Leia o QR com o aplicativo, ou digite a chave. Depois informe os 6
            números que ele mostrar.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element -- QR gerado no servidor, em data URI */}
          <img
            src={estado.qrCode}
            alt="QR para configurar o autenticador"
            className="mx-auto size-48 rounded-2xl bg-white p-2"
          />
          <p className="text-center font-mono text-sm break-all text-foreground">
            {estado.chave}
          </p>
          <div className="rounded-2xl bg-surface-raised p-3 text-sm">
            <p className="font-bold text-foreground">Códigos de recuperação</p>
            <p className="mt-1 text-xs text-foreground-muted">
              Guarde num lugar seguro. Cada um entra uma vez, se o celular se
              perder.
            </p>
            <ul className="mt-2 grid grid-cols-2 gap-1 font-mono text-xs text-foreground">
              {estado.codigosDeRecuperacao.map((codigo) => (
                <li key={codigo}>{codigo}</li>
              ))}
            </ul>
          </div>
          <CampoDeTexto
            label="Código do aplicativo"
            name="codigo"
            modoDeEntrada="numeric"
            autoComplete="one-time-code"
            required
            focoInicial
          />
        </>
      )}
      {estado.erro && <Alerta intencao="erro">{estado.erro}</Alerta>}
      <Botao type="submit" tamanho="lg" larguraTotal carregando={enviando}>
        {estado.etapa === "senha" ? "Gerar código" : "Ligar autenticador"}
      </Botao>
    </form>
  );
}
