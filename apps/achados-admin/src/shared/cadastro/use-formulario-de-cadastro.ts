"use client";

import { useState } from "react";
import { AppError } from "@achados/core";
import { useKeyboardShortcut } from "@achados/ui/hooks";
import type { UseMutationResult } from "@tanstack/react-query";

import {
  contagemPorSecao,
  erroDoCampo,
  primeiraSecaoComPendencia,
  type Pendencia,
} from "./pendencias";

type Opcoes<D, R, C extends string, S extends string> = {
  /** O registro gravado (edição) ou os padrões da inclusão. */
  inicial: D;
  secoes: readonly S[];
  /** As regras da feature, as mesmas que o servidor aplica. */
  validar: (dados: D) => Pendencia<C, S>[];
  /** O `useMutation` da feature: o coordenador da gravação. */
  gravacao: UseMutationResult<R, Error, D>;
  aoGravar?: (resultado: R) => void;
  /** Só o formulário na frente responde ao Ctrl+S. */
  ativo: boolean;
};

/**
 * O comportamento comum dos formulários de cadastro (ADR-0021), sem saber de
 * nenhum domínio: nada é gravado até salvar (Ctrl+S); as pendências aparecem
 * depois da primeira tentativa, com contador por seção e salto para a primeira
 * seção com problema; a recusa do servidor volta para os campos.
 */
export function useFormularioDeCadastro<
  D,
  R,
  C extends string,
  S extends string,
>({ inicial, secoes, validar, gravacao, aoGravar, ativo }: Opcoes<D, R, C, S>) {
  const [dados, setDados] = useState(inicial);
  const [tentou, setTentou] = useState(false);
  const [secao, setSecao] = useState<S>(secoes[0] as S);
  const [doServidor, setDoServidor] = useState<Pendencia<C, S>[]>([]);
  const [falha, setFalha] = useState<string | null>(null);

  const locais = tentou ? validar(dados) : [];
  const pendencias = locais.length > 0 ? locais : doServidor;

  function mudar<K extends keyof D>(campo: K, valor: D[K]) {
    setDados((atuais) => ({ ...atuais, [campo]: valor }));
    setDoServidor([]);
    setFalha(null);
  }

  function salvar() {
    if (gravacao.isPending) return;
    setTentou(true);
    const problemas = validar(dados);
    const primeira = primeiraSecaoComPendencia(problemas, secoes);
    if (primeira) {
      setSecao(primeira);
      return;
    }
    gravacao.mutate(dados, {
      onSuccess: (resultado) => {
        setTentou(false);
        aoGravar?.(resultado);
      },
      onError: (erro) => {
        const doServidor = pendenciasDoErro<C, S>(erro);
        if (doServidor.length > 0) {
          setDoServidor(doServidor);
          const primeira = primeiraSecaoComPendencia(doServidor, secoes);
          if (primeira) setSecao(primeira);
        } else {
          setFalha(erro.message || "Não foi possível salvar agora.");
        }
      },
    });
  }

  useKeyboardShortcut({ key: "s", ctrl: true }, salvar, {
    preventDefault: true,
    enabled: ativo,
  });

  return {
    dados,
    mudar,
    salvar,
    salvando: gravacao.isPending,
    alterado: alterado(dados, inicial),
    pendencias,
    erroDe: (campo: C) => erroDoCampo(pendencias, campo),
    contagem: contagemPorSecao(pendencias),
    secao,
    mudarSecao: setSecao,
    falha,
  };
}

/** Os dados mudaram desde o que foi carregado? Formulários pequenos: JSON basta. */
function alterado<D>(dados: D, inicial: D): boolean {
  return JSON.stringify(dados) !== JSON.stringify(inicial);
}

/** As pendências que a Action devolveu em `details.pendencias`, se houver. */
function pendenciasDoErro<C extends string, S extends string>(
  erro: Error
): Pendencia<C, S>[] {
  if (!(erro instanceof AppError)) return [];
  const lista = erro.details?.pendencias;
  return Array.isArray(lista) ? (lista as Pendencia<C, S>[]) : [];
}
