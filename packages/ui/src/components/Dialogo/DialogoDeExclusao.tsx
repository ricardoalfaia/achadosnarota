"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { Alerta } from "../Alerta";
import { Botao } from "../Botao";
import { CampoDeTexto } from "../CampoDeTexto";
import { IconeLixeira } from "../Icones";
import { Dialogo } from "./Dialogo";
import { FRASE_DE_EXCLUSAO, fraseConfere } from "./frase";

export type DialogoDeExclusaoProps = {
  aberto: boolean;
  /** O que será excluído, como aparece nas frases: "o Cliente Exemplo Ltda.". */
  nome: string;
  aoCancelar: () => void;
  /** Só é chamado depois das duas confirmações. */
  aoExcluir: () => void;
  /** Frase que a pessoa precisa digitar na primeira etapa. */
  frase?: string;
  /** Segundos em que "Excluir" fica bloqueado ao chegar na segunda etapa. */
  espera?: number;
  /** A exclusão está em andamento: bloqueia os botões e o fechamento. */
  carregando?: boolean;
  /** Falha da exclusão, mostrada na segunda etapa para tentar de novo. */
  erro?: string;
  /** A explicação: o que é apagado e o que acontece depois. */
  children: ReactNode;
};

/**
 * Exclusão em duas confirmações, para o que não dá para desfazer.
 *
 * 1. Explica as consequências e pede a frase digitada; colar não vale.
 * 2. Uma segunda caixa pede o "Excluir" final, que fica bloqueado por alguns
 *    segundos para um clique duplo não atravessar as duas etapas.
 *
 * Fechar ou cancelar em qualquer ponto não exclui nada, e reabrir recomeça da
 * primeira etapa.
 */
export function DialogoDeExclusao({
  aberto,
  nome,
  aoCancelar,
  aoExcluir,
  frase = FRASE_DE_EXCLUSAO,
  espera = 3,
  carregando = false,
  erro,
  children,
}: DialogoDeExclusaoProps) {
  const [etapa, setEtapa] = useState<"explicar" | "excluir">("explicar");
  const [digitado, setDigitado] = useState("");
  const [faltam, setFaltam] = useState(espera);
  const voltar = useRef<HTMLButtonElement>(null);
  const formulario = useRef<HTMLFormElement>(null);

  // Cada abertura recomeça do zero: nada do preenchimento anterior é reaproveitado.
  const [abertoAntes, setAbertoAntes] = useState(aberto);
  if (aberto !== abertoAntes) {
    setAbertoAntes(aberto);
    if (aberto) {
      setEtapa("explicar");
      setDigitado("");
    }
  }

  const confere = fraseConfere(digitado, frase);

  function continuar() {
    if (!confere) return;
    setFaltam(espera);
    setEtapa("excluir");
  }

  // O foco acompanha a etapa: "Voltar" na segunda, o campo ao retornar à primeira.
  // A contagem libera o "Excluir".
  useEffect(() => {
    if (etapa === "excluir") voltar.current?.focus();
    else
      formulario.current
        ?.querySelector<HTMLElement>("[data-foco-inicial]")
        ?.focus();
  }, [etapa]);

  useEffect(() => {
    if (etapa !== "excluir" || faltam <= 0) return;
    const relogio = setTimeout(() => setFaltam((atual) => atual - 1), 1000);
    return () => clearTimeout(relogio);
  }, [etapa, faltam]);

  if (etapa === "explicar") {
    return (
      <Dialogo
        aberto={aberto}
        aoFechar={aoCancelar}
        titulo={`Excluir ${nome}?`}
        rodape={
          <>
            <Botao variante="fantasma" onClick={aoCancelar}>
              Cancelar
            </Botao>
            <Botao
              variante="contorno"
              intencao="perigo"
              onClick={continuar}
              desabilitado={!confere}
            >
              Continuar
            </Botao>
          </>
        }
      >
        <form
          ref={formulario}
          className="flex flex-col gap-4"
          onSubmit={(evento) => {
            evento.preventDefault();
            continuar();
          }}
        >
          <Alerta intencao="erro" titulo="Esta ação não pode ser desfeita" />
          <div className="flex flex-col gap-2">{children}</div>
          <p>
            Para continuar, digite{" "}
            <strong className="font-bold text-danger">{frase}</strong> no campo
            abaixo.
          </p>
          <CampoDeTexto
            label="Frase de confirmação"
            tamanho="md"
            valor={digitado}
            aoMudar={setDigitado}
            semColar
            focoInicial
            ajuda="Digite a frase; colar não é aceito."
          />
        </form>
      </Dialogo>
    );
  }

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={aoCancelar}
      titulo="Excluir definitivamente?"
      tamanho="sm"
      semFechar={carregando}
      rodape={
        <>
          <Botao
            ref={voltar}
            variante="fantasma"
            onClick={() => setEtapa("explicar")}
            desabilitado={carregando}
          >
            Voltar
          </Botao>
          <Botao
            intencao="perigo"
            icone={<IconeLixeira />}
            onClick={aoExcluir}
            desabilitado={faltam > 0}
            carregando={carregando}
          >
            {faltam > 0 ? `Excluir em ${faltam}s` : "Excluir"}
          </Botao>
        </>
      }
    >
      <div className="flex animate-panel-in flex-col gap-3">
        <p>
          Esta é a última confirmação. Ao clicar em Excluir,{" "}
          <strong className="font-bold">{nome}</strong> será apagado e não
          poderá ser recuperado.
        </p>
        {erro && (
          <Alerta intencao="erro" titulo="A exclusão não foi concluída">
            {erro}
          </Alerta>
        )}
      </div>
    </Dialogo>
  );
}
