"use client";

import { BotaoDeIcone, Dialogo, EstadoVazio } from "@achados/ui";
import { useToggle } from "@achados/ui/hooks";
import { Bell } from "lucide-react";

/**
 * O sino do cabeçalho. Ainda não há notificações no app (avisos de novos
 * benefícios dependem de consentimento e de push, fora desta etapa): a janela
 * diz isso, sem ponto de "novidade" inventado.
 */
export function BotaoDeNotificacoes() {
  const painel = useToggle();
  return (
    <>
      <BotaoDeIcone
        rotulo="Notificações"
        icone={<Bell />}
        variante="suave"
        tamanho="xs"
        onClick={painel.on}
        className="[&_svg]:size-4"
      />
      <Dialogo
        aberto={painel.isOpen}
        aoFechar={painel.off}
        variante="cartao"
        tamanho="sm"
        icone={<Bell />}
        titulo="Notificações"
      >
        <EstadoVazio
          titulo="Nada por aqui ainda"
          descricao="Quando houver novos benefícios nos lugares que você salvou, eles aparecem aqui."
          className="border-0 py-4"
        />
      </Dialogo>
    </>
  );
}
