"use client";

import { useState } from "react";
import { CampoDeTexto, IconeCadeado } from "@meuproduto/ui";
import { useTranslations } from "next-intl";

import type { EstadoDoAcesso } from "../domain/estado";
import { BotaoDeEnvio } from "./botao-de-envio";
import { CabecalhoDaEtapa } from "./cabecalho-da-etapa";

/**
 * O código de 6 dígitos do autenticador ou, sem o aparelho, um dos códigos de
 * recuperação mostrados quando o autenticador foi configurado.
 */
export function EtapaDeDoisFatores({
  estado,
  acao,
}: {
  estado: EstadoDoAcesso;
  acao: (dados: FormData) => void;
}) {
  const t = useTranslations("Acesso");
  const [recuperacao, setRecuperacao] = useState(
    estado.comCodigoDeRecuperacao === true
  );
  const erro = estado.erros?.codigo;

  return (
    <form action={acao} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="etapa" value="doisFatores" />
      <input
        type="hidden"
        name="tipo"
        value={recuperacao ? "recuperacao" : "autenticador"}
      />
      <CabecalhoDaEtapa titulo={t("doisFatores.titulo")}>
        {recuperacao
          ? t("doisFatores.subtituloRecuperacao")
          : t("doisFatores.subtitulo")}
      </CabecalhoDaEtapa>

      <CampoDeTexto
        // Trocar o tipo limpa o campo: um código não serve no lugar do outro.
        key={recuperacao ? "recuperacao" : "autenticador"}
        label={
          recuperacao
            ? t("doisFatores.codigoDeRecuperacao")
            : t("doisFatores.codigo")
        }
        name="codigo"
        {...(recuperacao
          ? { autoComplete: "off", tamanhoMaximo: 16 }
          : {
              modoDeEntrada: "numeric" as const,
              autoComplete: "one-time-code",
              tamanhoMaximo: 7,
            })}
        required
        {...(erro ? { erro: t(`erros.${erro}`) } : {})}
        prefixo={<IconeCadeado />}
      />

      <button
        type="button"
        onClick={() => setRecuperacao((atual) => !atual)}
        className="w-fit cursor-pointer text-sm font-semibold text-primary underline-offset-3 hover:underline"
      >
        {recuperacao
          ? t("doisFatores.usarAutenticador")
          : t("doisFatores.usarRecuperacao")}
      </button>

      <BotaoDeEnvio
        rotulo={t("doisFatores.botao")}
        rotuloEnviando={t("doisFatores.enviando")}
      />
    </form>
  );
}
