"use client";

import { useActionState, useEffect } from "react";
import { Alerta, Botao, CampoDeTexto, Select } from "@achados/ui";
import { UserPlus } from "lucide-react";

import { vincularOperador, type EstadoDoVinculo } from "../actions";

/**
 * O formulário de vínculo: o e-mail da conta e a casa que ela vai operar.
 * Com `casa`, a casa já vem escolhida (aberto de dentro do balcão dela).
 */
export function VincularOperador({
  casas,
  casa,
  aoVincular,
}: {
  casas: readonly { id: string; nome: string }[];
  casa?: { id: string; nome: string };
  /** Depois de um vínculo que deu certo. */
  aoVincular?: () => void;
}) {
  const [estado, enviar, enviando] = useActionState<EstadoDoVinculo, FormData>(
    vincularOperador,
    {}
  );
  useEffect(() => {
    if (estado.mensagem) aoVincular?.();
  }, [estado, aoVincular]);

  return (
    <form action={enviar} className="flex flex-col gap-4">
      <CampoDeTexto
        label="E-mail da conta"
        name="email"
        tipo="email"
        ajuda="A pessoa precisa ter criado a conta no app."
        required
      />
      {casa ? (
        <input type="hidden" name="casaId" value={casa.id} />
      ) : (
        <Select
          label="Casa"
          name="casaId"
          required
          opcoes={casas.map((c) => ({ valor: c.id, label: c.nome }))}
          valorInicial={casas[0]?.id ?? null}
          pesquisavel={casas.length > 8}
        />
      )}
      {estado.erro && <Alerta intencao="erro">{estado.erro}</Alerta>}
      {estado.mensagem && !aoVincular && (
        <Alerta intencao="sucesso">{estado.mensagem}</Alerta>
      )}
      <Botao
        type="submit"
        icone={<UserPlus />}
        carregando={enviando}
        larguraTotal
      >
        {casa ? `Vincular a ${casa.nome}` : "Vincular"}
      </Botao>
    </form>
  );
}
