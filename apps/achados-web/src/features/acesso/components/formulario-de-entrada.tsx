"use client";

import { useActionState, useState } from "react";
import { Alerta } from "@achados/ui";
import { useTranslations } from "next-intl";

import { useConfiguracao } from "@/shared/config/configuracao-provider";
import { avancarNaEntrada } from "../actions";
import { ESTADO_INICIAL, type EstadoDoAcesso } from "../domain/estado";
import { EtapaDeConfiguracaoDoAutenticador } from "./etapa-de-configuracao-do-autenticador";
import { EtapaDeCredenciais } from "./etapa-de-credenciais";
import { EtapaDeDoisFatores } from "./etapa-de-dois-fatores";
import { EtapaDeTrocaDeSenha } from "./etapa-de-troca-de-senha";

/**
 * A entrada no sistema dentro do cartão de acesso: credenciais e, quando a
 * conta pede, o código do autenticador, a troca de senha e a configuração do
 * autenticador, uma etapa por vez. Quem decide a etapa é o servidor
 * (`avancarNaEntrada` e a página, que começa na pendência de uma sessão já
 * aberta); aqui só se mostra.
 */
export function FormularioDeEntrada({
  inicial = ESTADO_INICIAL,
  voltar = "/",
}: {
  inicial?: EstadoDoAcesso;
  /** Para onde ir depois de entrar; o servidor confere de novo. */
  voltar?: string;
}) {
  const t = useTranslations("Acesso.erros");
  const { nome: sistema } = useConfiguracao();
  const [estado, despachar] = useActionState(avancarNaEntrada, inicial);
  // Toda etapa leva o destino de volta junto, sem cada formulário saber dele.
  const acao = (dados: FormData) => {
    dados.set("voltar", voltar);
    despachar(dados);
  };
  // A senha digitada fica só na memória da tela, para a troca obrigatória não
  // pedi-la de novo. Recarregou a página: a troca pede a senha atual.
  const [senha, setSenha] = useState("");

  return (
    <div className="flex flex-col gap-5">
      {estado.mensagem && (
        <Alerta intencao="erro">{t(estado.mensagem, { sistema })}</Alerta>
      )}

      {estado.etapa === "credenciais" && (
        <EtapaDeCredenciais
          estado={estado}
          acao={acao}
          aoDigitarSenha={setSenha}
        />
      )}
      {estado.etapa === "doisFatores" && (
        <EtapaDeDoisFatores estado={estado} acao={acao} />
      )}
      {estado.etapa === "trocaDeSenha" && (
        <EtapaDeTrocaDeSenha estado={estado} acao={acao} senhaAtual={senha} />
      )}
      {estado.etapa === "configurarDoisFatores" && (
        <EtapaDeConfiguracaoDoAutenticador estado={estado} acao={acao} />
      )}
    </div>
  );
}
