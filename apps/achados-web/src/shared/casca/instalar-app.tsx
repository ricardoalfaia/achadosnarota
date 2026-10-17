"use client";

import { useInstalacaoPwa } from "@achados/ui/hooks";
import { Download, Share, Smartphone } from "lucide-react";

const LINHA =
  "flex w-full items-center justify-between gap-3 py-3 text-left text-xs font-semibold";

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
        className={`${LINHA} cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-ring`}
      >
        <span className="flex items-center gap-2 text-foreground">
          <Download
            aria-hidden="true"
            className="size-4 text-foreground-subtle"
          />
          Instalar o app na tela inicial
        </span>
        <span className="font-bold text-primary">Instalar</span>
      </button>
    );
  }

  return (
    <div className={LINHA}>
      <span className="flex items-center gap-2 text-foreground">
        <Smartphone
          aria-hidden="true"
          className="size-4 text-foreground-subtle"
        />
        App na tela inicial
      </span>
      <span className="flex items-center gap-1 text-right font-bold text-foreground-muted">
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
