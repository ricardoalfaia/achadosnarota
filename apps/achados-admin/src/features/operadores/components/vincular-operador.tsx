"use client";

import { useActionState } from "react";
import { Alerta, Botao, CampoDeTexto } from "@achados/ui";
import { UserPlus } from "lucide-react";

import { vincularOperador, type EstadoDoVinculo } from "../actions";

/**
 * O vínculo de mais uma pessoa ao balcão da casa aberta: só o e-mail da
 * conta. Uma casa pode ter vários operadores. O formulário se limpa depois de
 * enviar, pronto para o próximo.
 */
export function VincularOperador({ casaId }: { casaId: string }) {
  const [estado, enviar, enviando] = useActionState<EstadoDoVinculo, FormData>(
    vincularOperador,
    {}
  );

  return (
    <form action={enviar} className="flex flex-col gap-3">
      <input type="hidden" name="casaId" value={casaId} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <CampoDeTexto
          label="E-mail da conta"
          name="email"
          tipo="email"
          ajuda="A pessoa precisa ter criado a conta no app."
          required
          className="flex-1"
        />
        <Botao
          type="submit"
          icone={<UserPlus />}
          tamanho="lg"
          carregando={enviando}
        >
          Vincular
        </Botao>
      </div>
      {estado.erro && <Alerta intencao="erro">{estado.erro}</Alerta>}
      {estado.mensagem && <Alerta intencao="sucesso">{estado.mensagem}</Alerta>}
    </form>
  );
}
