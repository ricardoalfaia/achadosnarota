"use client";

import { useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { useFecharAoSair } from "../../hooks/use-fechar-ao-sair";
import { usePresenca } from "../../hooks/use-presenca";
import {
  useSeletorDeData,
  type UseSeletorDeDataOpcoes,
} from "../../hooks/use-seletor-de-data";
import { cn } from "../../lib/cn";
import {
  CaixaDoCampo,
  idDaMensagem,
  MensagemDoCampo,
  TEXTO_DO_CAMPO,
} from "../CaixaDoCampo";
import type { PropsDeCampo } from "../tipos";
import { BotaoDoCalendario } from "./components/botao-do-calendario";
import { PainelDoSeletorDeData } from "./components/painel";

export type SeletorDeDataProps = UseSeletorDeDataOpcoes & PropsDeCampo;

/**
 * Data única: digitável em DD/MM/AAAA ou escolhida no calendário, confirmada
 * em "Aplicar". Emite `AAAA-MM-DD`.
 */
export function SeletorDeData({
  label,
  id,
  name,
  erro,
  ajuda,
  desabilitado,
  tamanho = "lg",
  required,
  aoSair,
  lado,
  className,
  ...opcoes
}: SeletorDeDataProps) {
  const seletor = useSeletorDeData(opcoes);
  const { pending } = useFormStatus();
  const idGerado = useId();
  const idDoCampo = id ?? idGerado;
  const raiz = useRef<HTMLDivElement>(null);
  const entrada = useRef<HTMLInputElement>(null);
  const [focado, setFocado] = useState(false);
  useFecharAoSair(raiz, seletor.aberto, seletor.fechar, entrada);
  const painel = usePresenca(seletor.aberto);

  const bloqueado = desabilitado || pending;
  const flutuando = focado || seletor.aberto || seletor.texto !== "";

  return (
    <div ref={raiz} className={cn("relative", className)}>
      <CaixaDoCampo
        id={idDoCampo}
        label={label}
        tamanho={tamanho}
        flutuando={flutuando}
        ativo={focado || seletor.aberto}
        invalido={Boolean(erro)}
        desabilitado={bloqueado}
        icone={
          <BotaoDoCalendario
            aberto={seletor.aberto}
            compacto={tamanho === "sm"}
            aoClicar={seletor.alternar}
            desabilitado={bloqueado}
          />
        }
      >
        <input
          ref={entrada}
          id={idDoCampo}
          value={seletor.texto}
          onChange={(evento) => seletor.digitar(evento.target.value)}
          onClick={seletor.abrir}
          onKeyDown={(evento) => evento.key === "ArrowDown" && seletor.abrir()}
          onFocus={() => setFocado(true)}
          onBlur={() => {
            setFocado(false);
            seletor.sairDoTexto();
            aoSair?.();
          }}
          inputMode="numeric"
          autoComplete="off"
          placeholder="dd/mm/aaaa"
          disabled={bloqueado}
          required={required}
          role="combobox"
          aria-haspopup="dialog"
          aria-expanded={seletor.aberto}
          aria-controls={`${idDoCampo}-calendario`}
          aria-invalid={erro ? true : undefined}
          aria-describedby={idDaMensagem(idDoCampo, erro, ajuda)}
          className={cn(
            "w-full bg-transparent text-foreground outline-none placeholder:text-foreground-subtle disabled:cursor-not-allowed",
            TEXTO_DO_CAMPO[tamanho],
            !flutuando && "sr-only"
          )}
        />
      </CaixaDoCampo>
      {name && <input type="hidden" name={name} value={seletor.valor ?? ""} />}
      <MensagemDoCampo id={`${idDoCampo}-mensagem`} erro={erro} ajuda={ajuda} />
      {painel.montado && (
        <PainelDoSeletorDeData
          saindo={painel.saindo}
          id={`${idDoCampo}-calendario`}
          seletor={seletor}
          lado={lado}
          aoAplicar={() => {
            seletor.aplicar();
            entrada.current?.focus();
          }}
        />
      )}
    </div>
  );
}
