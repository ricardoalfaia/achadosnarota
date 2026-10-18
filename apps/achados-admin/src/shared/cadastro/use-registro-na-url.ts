"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { lerSituacao, TODAS } from "./filtro";

/** O que está aberto na tela de cadastro, lido da URL (ADR-0021). */
export type RegistroAberto = { tipo: "novo" } | { tipo: "edicao"; id: string };

function registroDaUrl(parametros: URLSearchParams): RegistroAberto | null {
  const id = parametros.get("id");
  if (id) return { tipo: "edicao", id };
  if (parametros.get("novo") === "1") return { tipo: "novo" };
  return null;
}

function chaveDoRegistro(registro: RegistroAberto): string {
  return registro.tipo === "novo" ? "novo" : registro.id;
}

/**
 * A tela de cadastro com o estado na URL: `?status=` filtra a lista, `?id=`
 * abre um registro e `?novo=1` a inclusão. O voltar do navegador e um link
 * para o registro funcionam. A navegação é uma transição: a lista continua
 * utilizável enquanto o servidor prepara o registro.
 *
 * `formulario` é o último registro aberto, que continua montado durante a
 * animação de volta à lista; `abertura` muda a cada vez que um registro é
 * aberto, para o formulário recomeçar do gravado (use como `key`).
 */
export function useRegistroNaUrl<S extends string>(situacoes: readonly S[]) {
  const caminho = usePathname();
  const router = useRouter();
  const parametros = useSearchParams();
  const [navegando, comoTransicao] = useTransition();

  const aberto = registroDaUrl(parametros);
  const situacao = lerSituacao(parametros.get("status"), situacoes);

  const [formulario, setFormulario] = useState(aberto);
  const [abertura, setAbertura] = useState(0);
  const chaveAtual = aberto && chaveDoRegistro(aberto);
  const chaveDoFormulario = formulario && chaveDoRegistro(formulario);
  if (aberto && chaveAtual !== chaveDoFormulario) {
    setFormulario(aberto);
    setAbertura((n) => n + 1);
  }

  function irPara(mudar: (p: URLSearchParams) => void, substituir = false) {
    const novos = new URLSearchParams(parametros);
    mudar(novos);
    const consulta = novos.toString();
    const destino = consulta ? `${caminho}?${consulta}` : caminho;
    comoTransicao(() => {
      if (substituir) router.replace(destino, { scroll: false });
      else router.push(destino, { scroll: false });
    });
  }

  return {
    aberto,
    formulario,
    abertura,
    situacao,
    navegando,
    abrir(registro: RegistroAberto) {
      irPara((p) => {
        p.delete("id");
        p.delete("novo");
        if (registro.tipo === "novo") p.set("novo", "1");
        else p.set("id", registro.id);
      });
    },
    fechar() {
      irPara((p) => {
        p.delete("id");
        p.delete("novo");
      });
    },
    mudarSituacao(nova: S | typeof TODAS) {
      irPara((p) => {
        if (nova === TODAS) p.delete("status");
        else p.set("status", nova);
      }, true);
    },
  };
}
