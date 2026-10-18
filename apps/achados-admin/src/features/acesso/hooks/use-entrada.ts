"use client";

import { useActionState } from "react";

import {
  confirmarCodigo,
  entrarComSenha,
  gerarAutenticador,
  ligarAutenticador,
} from "../actions";
import type { EstadoDaEntrada, EstadoDoAutenticador } from "../domain/entrada";

/**
 * A entrada em dois passos no mesmo formulário: e-mail e senha; com o 2FA
 * ligado, o código do autenticador. O servidor decide o passo seguinte.
 */
export function useEntrada() {
  const [estado, enviar, enviando] = useActionState<EstadoDaEntrada, FormData>(
    (anterior, dados) =>
      anterior.etapa === "codigo"
        ? confirmarCodigo(anterior, dados)
        : entrarComSenha(anterior, dados),
    { etapa: "credenciais" }
  );
  return { estado, enviar, enviando };
}

/**
 * O primeiro acesso: a senha de novo para gerar o segredo, depois o QR e o
 * primeiro código, que liga o autenticador.
 */
export function useConfiguracaoDoAutenticador() {
  const [estado, enviar, enviando] = useActionState<
    EstadoDoAutenticador,
    FormData
  >(
    (anterior, dados) =>
      anterior.etapa === "qr"
        ? ligarAutenticador(anterior, dados)
        : gerarAutenticador(anterior, dados),
    { etapa: "senha" }
  );
  return { estado, enviar, enviando };
}
