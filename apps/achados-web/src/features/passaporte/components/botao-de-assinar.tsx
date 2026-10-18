"use client";

import { Alerta, Botao } from "@achados/ui";
import { CreditCard } from "lucide-react";

import { useAssinar } from "../hooks/use-assinar";

/** "Assinar" ou "Renovar": leva ao Checkout da Stripe (cartão ou Pix). */
export function BotaoDeAssinar({ rotulo = "Assinar" }: { rotulo?: string }) {
  const { assinar, abrindo, erro } = useAssinar();
  return (
    <div className="flex flex-col gap-2">
      <Botao
        larguraTotal
        tamanho="lg"
        icone={<CreditCard />}
        onClick={assinar}
        carregando={abrindo}
      >
        {rotulo}
      </Botao>
      <p className="text-center text-[11px] text-foreground-muted">
        Cartão ou Pix, no ambiente seguro da Stripe.
      </p>
      {erro && <Alerta intencao="erro">{erro}</Alerta>}
    </div>
  );
}
