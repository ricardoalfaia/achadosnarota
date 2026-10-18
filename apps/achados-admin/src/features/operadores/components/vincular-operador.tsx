"use client";

import { useActionState } from "react";
import { Alerta, Botao, CampoDeTexto } from "@achados/ui";

import { vincularOperador, type EstadoDoVinculo } from "../actions";

/** O formulário de vínculo: o e-mail da conta e a casa que ela vai operar. */
export function VincularOperador({
  casas,
}: {
  casas: readonly { id: string; nome: string }[];
}) {
  const [estado, enviar, enviando] = useActionState<EstadoDoVinculo, FormData>(
    vincularOperador,
    {}
  );
  return (
    <form
      action={enviar}
      className="flex flex-col gap-4 rounded-card bg-surface p-5 ring-1 ring-border/60"
    >
      <h2 className="text-base font-extrabold text-foreground">
        Vincular operador
      </h2>
      <p className="text-sm text-foreground-muted">
        A pessoa cria a conta no app e você vincula pelo e-mail. Ela passa a ver
        o modo balcão no perfil e só valida códigos desta casa.
      </p>
      <CampoDeTexto
        label="E-mail da conta"
        name="email"
        tipo="email"
        required
      />
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-foreground">
        Casa
        <select
          name="casaId"
          required
          className="h-control-lg rounded-control border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-ring"
        >
          {casas.map((casa) => (
            <option key={casa.id} value={casa.id}>
              {casa.nome}
            </option>
          ))}
        </select>
      </label>
      {estado.erro && <Alerta intencao="erro">{estado.erro}</Alerta>}
      {estado.mensagem && <Alerta intencao="sucesso">{estado.mensagem}</Alerta>}
      <Botao type="submit" carregando={enviando}>
        Vincular
      </Botao>
    </form>
  );
}
