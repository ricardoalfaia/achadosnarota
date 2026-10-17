"use client";

import { BotaoDeIcone } from "@achados/ui";
import { Check, Share } from "lucide-react";

import { useCompartilhar } from "../hooks/use-compartilhar";

/**
 * Compartilhar a ficha. `flutuante` é o botão redondo sobre a foto; `acao`, a
 * quarta das ações rápidas. A lógica está em `useCompartilhar`.
 */
export function BotaoDeCompartilhar({
  titulo,
  caminho,
  aparencia = "flutuante",
}: {
  titulo: string;
  caminho: string;
  aparencia?: "flutuante" | "acao";
}) {
  const { copiado, compartilhar } = useCompartilhar(titulo, caminho);
  const icone = copiado ? <Check /> : <Share />;
  const aviso = (
    <span className="sr-only" aria-live="polite">
      {copiado ? "Link copiado" : ""}
    </span>
  );

  if (aparencia === "acao") {
    return (
      <button
        type="button"
        onClick={compartilhar}
        className="flex flex-col items-center rounded-2xl bg-surface-raised p-2.5 transition-colors outline-none hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-ring [&_svg]:mb-1 [&_svg]:size-4.5 [&_svg]:text-chip-foreground"
      >
        {icone}
        <span className="text-[10px] font-semibold text-foreground-muted">
          Compartilhar
        </span>
        {aviso}
      </button>
    );
  }

  return (
    <>
      <BotaoDeIcone
        rotulo={copiado ? "Link copiado" : "Compartilhar"}
        icone={icone}
        variante="flutuante"
        tamanho="xs"
        onClick={compartilhar}
        className="size-9 [&_svg]:size-4"
      />
      {aviso}
    </>
  );
}
