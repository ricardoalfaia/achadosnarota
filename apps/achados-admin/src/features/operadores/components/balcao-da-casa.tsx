"use client";

import { useActionState, useState } from "react";
import { Alerta, Avatar, Botao, EstadoVazio } from "@achados/ui";
import { UserMinus, UserX } from "lucide-react";

import { desvincularOperador, type EstadoDoVinculo } from "../actions";
import type { CasaComOperadores, OperadorDaCasa } from "../domain/balcao";
import { VincularOperador } from "./vincular-operador";

/**
 * O balcão de uma casa: quem valida os códigos hoje, com o desvincular em
 * duas etapas, e o vínculo de mais alguém já com a casa escolhida.
 */
export function BalcaoDaCasa({ casa }: { casa: CasaComOperadores }) {
  const [estado, enviar, enviando] = useActionState<EstadoDoVinculo, FormData>(
    desvincularOperador,
    {}
  );

  return (
    <div className="flex flex-col gap-6">
      <section
        aria-labelledby="titulo-operadores"
        className="flex flex-col gap-3"
      >
        <h3
          id="titulo-operadores"
          className="text-xs font-bold tracking-wide text-foreground-muted uppercase"
        >
          No balcão ({casa.operadores.length})
        </h3>
        {casa.operadores.length === 0 ? (
          <EstadoVazio
            icone={<UserX />}
            titulo="Ninguém valida os códigos desta casa"
            descricao="Sem operador, o cliente não consegue usar o benefício no balcão."
            className="rounded-card border border-dashed border-border py-6"
          />
        ) : (
          <ul className="divide-y divide-border rounded-card border border-border">
            {casa.operadores.map((operador) => (
              <LinhaDoOperador
                key={operador.usuarioId}
                operador={operador}
                casaId={casa.id}
                enviar={enviar}
                enviando={enviando}
              />
            ))}
          </ul>
        )}
        {estado.erro && <Alerta intencao="erro">{estado.erro}</Alerta>}
        {estado.mensagem && (
          <Alerta intencao="sucesso">{estado.mensagem}</Alerta>
        )}
      </section>

      <section
        aria-labelledby="titulo-vincular"
        className="flex flex-col gap-3 border-t border-border pt-5"
      >
        <h3
          id="titulo-vincular"
          className="text-xs font-bold tracking-wide text-foreground-muted uppercase"
        >
          Vincular mais alguém
        </h3>
        <VincularOperador casas={[casa]} casa={casa} />
      </section>
    </div>
  );
}

/** Uma pessoa do balcão. Desvincular pede confirmação na própria linha. */
function LinhaDoOperador({
  operador,
  casaId,
  enviar,
  enviando,
}: {
  operador: OperadorDaCasa;
  casaId: string;
  enviar: (dados: FormData) => void;
  enviando: boolean;
}) {
  const [confirmando, setConfirmando] = useState(false);

  return (
    <li className="flex items-center gap-3 px-3 py-2.5">
      <Avatar nome={operador.nome} tamanho="md" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-foreground">
          {operador.nome}
        </span>
        <span className="block truncate text-xs text-foreground-muted">
          {operador.email}
        </span>
      </span>
      {confirmando ? (
        <form action={enviar} className="flex shrink-0 items-center gap-1">
          <input type="hidden" name="usuarioId" value={operador.usuarioId} />
          <input type="hidden" name="casaId" value={casaId} />
          <Botao
            variante="fantasma"
            tamanho="xs"
            onClick={() => setConfirmando(false)}
            desabilitado={enviando}
          >
            Manter
          </Botao>
          <Botao
            type="submit"
            tamanho="xs"
            intencao="perigo"
            carregando={enviando}
          >
            Desvincular
          </Botao>
        </form>
      ) : (
        <Botao
          variante="fantasma"
          intencao="perigo"
          tamanho="xs"
          icone={<UserMinus />}
          onClick={() => setConfirmando(true)}
          aria-label={`Desvincular ${operador.nome}`}
          className="shrink-0"
        >
          Desvincular
        </Botao>
      )}
    </li>
  );
}
