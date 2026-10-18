"use client";

import { BotaoDeIcone } from "@achados/ui";
import { cn } from "@achados/ui/estilos";
import { Check, Share } from "lucide-react";

import { useCompartilhar } from "../hooks/use-compartilhar";
import {
  ACAO_DA_FICHA,
  CIRCULO_DA_ACAO,
  ROTULO_DA_ACAO,
} from "./estilo-da-acao";

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
        className={cn(ACAO_DA_FICHA, "cursor-pointer")}
      >
        <span className={CIRCULO_DA_ACAO}>{icone}</span>
        <span className={ROTULO_DA_ACAO}>Compartilhar</span>
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
