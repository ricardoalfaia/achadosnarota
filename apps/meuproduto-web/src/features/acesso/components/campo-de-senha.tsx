"use client";

import { useState, type KeyboardEvent } from "react";
import {
  BotaoDeIcone,
  CampoDeTexto,
  IconeCadeado,
  IconeOlho,
  IconeOlhoFechado,
} from "@meuproduto/ui";
import { useTranslations } from "next-intl";

/**
 * O campo de senha do acesso: cadeado como prefixo, botão para mostrar ou
 * ocultar o que foi digitado e aviso quando o Caps Lock está ligado.
 */
export function CampoDeSenha({
  label,
  name,
  erro,
  aoMudar,
  nova = false,
}: {
  label: string;
  name: string;
  erro?: string | undefined;
  aoMudar?: (senha: string) => void;
  /** Senha sendo criada: o gerenciador de senhas oferece uma nova em vez da atual. */
  nova?: boolean;
}) {
  const t = useTranslations("Acesso.entrar");
  const [visivel, setVisivel] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  function observarCapsLock(evento: KeyboardEvent<HTMLDivElement>) {
    setCapsLock(evento.getModifierState("CapsLock"));
  }

  return (
    <div
      onKeyDownCapture={observarCapsLock}
      onKeyUpCapture={observarCapsLock}
      onBlurCapture={() => setCapsLock(false)}
    >
      <CampoDeTexto
        label={label}
        name={name}
        tipo={visivel ? "text" : "password"}
        autoComplete={nova ? "new-password" : "current-password"}
        required
        {...(aoMudar ? { aoMudar } : {})}
        {...(erro ? { erro } : {})}
        {...(capsLock ? { ajuda: t("capsLock") } : {})}
        prefixo={<IconeCadeado />}
        sufixo={
          <BotaoDeIcone
            variante="fantasma"
            tamanho="xs"
            rotulo={
              visivel
                ? t("ocultarSenha", { campo: label })
                : t("mostrarSenha", { campo: label })
            }
            aria-pressed={visivel}
            icone={visivel ? <IconeOlhoFechado /> : <IconeOlho />}
            onClick={() => setVisivel((estado) => !estado)}
          />
        }
      />
    </div>
  );
}
