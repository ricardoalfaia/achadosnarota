"use client";

import { Alerta, Botao, CampoDeTexto } from "@achados/ui";

import { useEntrada } from "../hooks/use-entrada";

/** E-mail e senha e, com o 2FA ligado, o código do autenticador. */
export function FormularioDeEntrada() {
  const { estado, enviar, enviando } = useEntrada();
  return (
    <form action={enviar} className="flex flex-col gap-4">
      {estado.etapa === "credenciais" ? (
        <>
          <CampoDeTexto
            label="E-mail"
            name="email"
            tipo="email"
            autoComplete="username"
            valorInicial={estado.email ?? ""}
            required
            focoInicial
          />
          <CampoDeTexto
            label="Senha"
            name="senha"
            tipo="password"
            autoComplete="current-password"
            required
          />
        </>
      ) : (
        <CampoDeTexto
          label="Código do autenticador"
          name="codigo"
          modoDeEntrada="numeric"
          autoComplete="one-time-code"
          ajuda="Os 6 números do aplicativo autenticador, ou um código de recuperação."
          required
          focoInicial
        />
      )}
      {estado.erro && <Alerta intencao="erro">{estado.erro}</Alerta>}
      <Botao type="submit" tamanho="lg" larguraTotal carregando={enviando}>
        {estado.etapa === "credenciais" ? "Entrar" : "Confirmar código"}
      </Botao>
    </form>
  );
}
