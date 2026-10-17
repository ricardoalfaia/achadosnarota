"use client";

import { useId, useRef } from "react";
import { useFormStatus } from "react-dom";

import { useFecharAoSair } from "../../hooks/use-fechar-ao-sair";
import { usePresenca } from "../../hooks/use-presenca";
import {
  useSeletorDePeriodo,
  type Atalho,
  type UseSeletorDePeriodoOpcoes,
} from "../../hooks/use-seletor-de-periodo";
import { cn } from "../../lib/cn";
import { idDaMensagem, MensagemDoCampo } from "../CaixaDoCampo";
import type { PropsDeCampo } from "../tipos";
import { GatilhoDoPeriodo } from "./components/gatilho";
import { PainelDoPeriodo } from "./components/painel";

export type SeletorDePeriodoProps = UseSeletorDePeriodoOpcoes &
  Omit<PropsDeCampo, "label"> & {
    labelInicio?: string;
    labelFim?: string;
    /** Botões de período pronto terminando hoje; os maiores que `maxDias` não aparecem. */
    atalhos?: readonly Atalho[];
  };

/**
 * Período "de … até": dois campos, um calendário. Com `name`, escreve
 * `${name}.inicio` e `${name}.fim` no `FormData`.
 */
export function SeletorDePeriodo({
  labelInicio = "Data inicial",
  labelFim = "Data final",
  atalhos,
  id,
  name,
  erro,
  ajuda,
  desabilitado,
  tamanho,
  aoSair,
  lado,
  className,
  ...opcoes
}: SeletorDePeriodoProps) {
  const seletor = useSeletorDePeriodo(opcoes);
  const { pending } = useFormStatus();
  const idGerado = useId();
  const idBase = id ?? idGerado;
  const raiz = useRef<HTMLDivElement>(null);
  const gatilho = useRef<HTMLButtonElement>(null);
  useFecharAoSair(raiz, seletor.aberto, seletor.fechar, gatilho);
  const painel = usePresenca(seletor.aberto);

  const bloqueado = desabilitado || pending;
  const mostrado = seletor.aberto
    ? seletor.rascunho
    : (seletor.valor ?? { inicio: null, fim: null });
  const comuns = {
    aberto: seletor.aberto,
    invalido: Boolean(erro),
    desabilitado: bloqueado,
    tamanho,
    descricao: idDaMensagem(idBase, erro, ajuda),
    aoClicar: seletor.alternar,
    aoSair,
  };

  return (
    <div ref={raiz} className={cn("relative", className)}>
      <div className="grid grid-cols-2 gap-2">
        <GatilhoDoPeriodo
          {...comuns}
          ref={gatilho}
          id={`${idBase}-inicio`}
          label={labelInicio}
          data={mostrado.inicio}
          ativo={seletor.aberto && !seletor.escolhendoFim}
        />
        <GatilhoDoPeriodo
          {...comuns}
          id={`${idBase}-fim`}
          label={labelFim}
          data={mostrado.fim}
          ativo={seletor.escolhendoFim}
        />
      </div>
      {name && (
        <>
          <input
            type="hidden"
            name={`${name}.inicio`}
            value={seletor.valor?.inicio ?? ""}
          />
          <input
            type="hidden"
            name={`${name}.fim`}
            value={seletor.valor?.fim ?? ""}
          />
        </>
      )}
      <MensagemDoCampo id={`${idBase}-mensagem`} erro={erro} ajuda={ajuda} />
      {painel.montado && (
        <PainelDoPeriodo
          saindo={painel.saindo}
          seletor={seletor}
          atalhos={atalhos}
          lado={lado}
          aoAplicar={() => {
            seletor.aplicar();
            gatilho.current?.focus();
          }}
        />
      )}
    </div>
  );
}
