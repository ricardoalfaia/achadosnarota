"use client";

import { useInstalacaoPwa } from "@achados/ui/hooks";
import { Download, Share, Smartphone } from "lucide-react";

import { LINHA_DE_AJUSTE, RotuloDaLinha } from "./linha-de-ajuste";

/**
 * A linha "App na tela inicial" do perfil. Quando o navegador oferece o
 * pedido de instalação, vira um botão; no iPhone, explica o "Adicionar à
 * Tela de Início"; instalado, só diz isso. A lógica está em `useInstalacaoPwa`.
 */
export function InstalarApp() {
  const { situacao, instalar } = useInstalacaoPwa();

  if (situacao === "disponivel") {
    return (
      <button
        type="button"
        onClick={instalar}
        className={`${LINHA_DE_AJUSTE} cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-ring`}
      >
        <RotuloDaLinha icone={<Download />}>
          Instalar o app na tela inicial
        </RotuloDaLinha>
        <span className="font-bold text-primary">Instalar</span>
      </button>
    );
  }

  return (
    <div className={LINHA_DE_AJUSTE}>
      <RotuloDaLinha icone={<Smartphone />}>App na tela inicial</RotuloDaLinha>
      <span className="flex items-center gap-1 text-right text-xs font-bold text-foreground-muted">
        {situacao === "instalado" && "Instalado"}
        {situacao === "ios" && (
          <>
            Toque em <Share aria-label="Compartilhar" className="size-3.5" /> e
            &quot;Adicionar à Tela de Início&quot;
          </>
        )}
        {situacao === "indisponivel" && "Pelo menu do navegador"}
      </span>
    </div>
  );
}
