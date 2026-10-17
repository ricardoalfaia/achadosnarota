"use client";

import { Botao, IconeSetaLonga } from "@meuproduto/ui";
import { useFormStatus } from "react-dom";

/** O botão que envia o formulário de acesso: largura total e estado de envio. */
export function BotaoDeEnvio({
  rotulo,
  rotuloEnviando,
}: {
  rotulo: string;
  rotuloEnviando: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Botao
      type="submit"
      tamanho="lg"
      larguraTotal
      carregando={pending}
      iconeFinal={pending ? undefined : <IconeSetaLonga />}
      className="mt-1.5 tracking-[0.03em] uppercase"
    >
      {pending ? rotuloEnviando : rotulo}
    </Botao>
  );
}
