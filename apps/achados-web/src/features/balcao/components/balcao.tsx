"use client";

import { Alerta, Botao } from "@achados/ui";
import { cn } from "@achados/ui/estilos";
import { BadgeCheck, Store } from "lucide-react";

import {
  codigoParaConferir,
  horaDoUso,
  TAMANHO_DO_CODIGO,
} from "../domain/codigo-digitado";
import { useBalcao } from "../hooks/use-balcao";

/**
 * A tela do garçom: escolhe a casa (se opera mais de uma), digita o código
 * que o cliente mostra e confirma. Verde e grande quando dá certo, com o
 * benefício a aplicar; a recusa diz o motivo sem revelar nada do cliente.
 */
export function Balcao({
  casas,
}: {
  casas: readonly { id: string; nome: string }[];
}) {
  const balcao = useBalcao(casas);

  if (balcao.confirmado) {
    return (
      <section
        aria-live="polite"
        className="flex flex-col items-center gap-3 rounded-[2rem] bg-success-subtle px-5 py-8 text-center ring-1 ring-success-border"
      >
        <BadgeCheck aria-hidden="true" className="size-16 text-success" />
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
          Benefício confirmado
        </h2>
        <p className="text-lg font-bold text-foreground">
          {balcao.confirmado.beneficio}
        </p>
        <p className="text-sm text-foreground-muted">
          Usado às {horaDoUso(balcao.confirmado.usadoEm)}. Aplique na conta do
          cliente.
        </p>
        <Botao tamanho="lg" className="mt-2 px-8" onClick={balcao.proximo}>
          Validar outro código
        </Botao>
      </section>
    );
  }

  return (
    <form onSubmit={balcao.aoEnviar} className="flex flex-col gap-5">
      {casas.length > 1 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-bold text-foreground">
            Casa
          </legend>
          <div className="flex flex-wrap gap-2">
            {casas.map((casa) => (
              <label
                key={casa.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ring-1 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-ring",
                  casa.id === balcao.casaId
                    ? "bg-primary-solid text-primary-solid-foreground ring-transparent"
                    : "bg-surface text-foreground ring-border"
                )}
              >
                <input
                  type="radio"
                  name="casa"
                  value={casa.id}
                  checked={casa.id === balcao.casaId}
                  onChange={() => balcao.escolherCasa(casa.id)}
                  className="sr-only"
                />
                <Store aria-hidden="true" className="size-4" />
                {casa.nome}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <label className="flex flex-col gap-2">
        <span className="text-sm font-bold text-foreground">
          Código que o cliente mostra
        </span>
        <input
          value={codigoParaConferir(balcao.codigo)}
          onChange={(evento) => balcao.aoDigitar(evento.target.value)}
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          maxLength={TAMANHO_DO_CODIGO + 1}
          placeholder="ABC 234"
          aria-describedby="ajuda-do-codigo"
          className="h-20 rounded-3xl border-2 border-border bg-surface text-center font-mono text-4xl font-extrabold tracking-[0.2em] text-foreground outline-none placeholder:text-foreground-subtle/50 focus:border-ring focus:shadow-ring-glow"
        />
        <span id="ajuda-do-codigo" className="text-xs text-foreground-muted">
          6 caracteres. O código vale 10 minutos depois que o cliente gera.
        </span>
      </label>

      {balcao.recusa && <Alerta intencao="erro">{balcao.recusa}</Alerta>}

      <Botao
        type="submit"
        tamanho="lg"
        larguraTotal
        desabilitado={!balcao.podeValidar}
        carregando={balcao.validando}
      >
        Confirmar benefício
      </Botao>
    </form>
  );
}
