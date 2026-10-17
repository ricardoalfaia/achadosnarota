"use client";

import { Alerta, Dialogo } from "@achados/ui";
import { QrCode } from "lucide-react";

import { IconeVisor } from "./icones-da-navegacao";

/**
 * O leitor do passaporte (botão central da barra). O visual é o do protótipo,
 * com o feixe que varre o visor. A leitura de verdade (câmera e validação do
 * código no servidor) chega com os benefícios, na F4 (docs/produto/06): até
 * lá a janela diz isso, sem simular check-in nem desbloquear nada.
 */
export function DialogoDoLeitor({
  aberto,
  aoFechar,
}: {
  aberto: boolean;
  aoFechar: () => void;
}) {
  return (
    <Dialogo
      aberto={aberto}
      aoFechar={aoFechar}
      variante="cartao"
      tamanho="sm"
      tema="dark"
      icone={<IconeVisor />}
      titulo="Leitor do Passaporte"
      descricao="Aponte para o QR Code do estabelecimento parceiro."
    >
      <div
        aria-hidden="true"
        className="relative mx-auto my-2 flex size-56 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-brand/60 bg-black/40"
      >
        <span className="absolute inset-x-[5%] h-[3px] animate-scan bg-[linear-gradient(90deg,transparent_0%,var(--ar-brand)_50%,transparent_100%)] shadow-[0_0_12px_var(--ar-brand)]" />
        <QrCode className="size-16 text-white/20" />
      </div>
      <Alerta intencao="info" className="mt-4 text-left">
        A leitura pelo app chega junto com o resgate de benefícios. Por
        enquanto, os benefícios aparecem na ficha de cada lugar.
      </Alerta>
    </Dialogo>
  );
}
