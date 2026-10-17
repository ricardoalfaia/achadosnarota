import { useState } from "react";

import {
  formatarDataBr,
  hojeNoNavegador,
  lerDataBr,
  mascararDataBr,
  type DataIso,
} from "../lib/datas";
import {
  useCalendario,
  type EstadoDoDia,
  type LimitesDeData,
} from "./use-calendario";
import { useValorControlavel } from "./use-valor-controlavel";

export type UseSeletorDeDataOpcoes = LimitesDeData & {
  /** Modo controlado (react-hook-form). `null` = sem data. */
  valor?: DataIso | null;
  /** Modo não controlado (`<form action>`). */
  valorInicial?: DataIso | null;
  aoMudar?: (valor: DataIso | null) => void;
  /** Dia de hoje vindo do servidor (`dataIsoDoInstante`). Sem ele, lê do navegador ao abrir. */
  hoje?: DataIso;
};

/**
 * Estado de um seletor de data única: caixa aberta, dia em rascunho até
 * "Aplicar", e digitação em DD/MM/AAAA que grava assim que a data fica
 * completa e permitida.
 */
export function useSeletorDeData({
  valor,
  valorInicial = null,
  aoMudar,
  hoje,
  ...limites
}: UseSeletorDeDataOpcoes) {
  const [atual, mudar] = useValorControlavel(valor, valorInicial, aoMudar);
  const calendario = useCalendario(limites);
  const [aberto, setAberto] = useState(false);
  const [rascunho, setRascunho] = useState<DataIso | null>(null);
  const [hojeVisto, setHojeVisto] = useState<DataIso | null>(hoje ?? null);
  const [texto, setTexto] = useState<string | null>(null);

  function abrir() {
    if (aberto) return;
    const referencia = hoje ?? hojeNoNavegador();
    setHojeVisto(referencia);
    setRascunho(atual);
    calendario.mostrar(atual ?? referencia);
    setAberto(true);
  }

  function fechar() {
    setAberto(false);
  }

  function escolher(dia: DataIso) {
    if (!calendario.estaDesabilitada(dia)) setRascunho(dia);
  }

  function aplicar() {
    mudar(rascunho);
    fechar();
  }

  function limpar() {
    setRascunho(null);
    mudar(null);
  }

  function digitar(bruto: string) {
    const mascarado = mascararDataBr(bruto);
    setTexto(mascarado);
    if (mascarado === "") return mudar(null);

    const data = lerDataBr(mascarado);
    if (data && !calendario.estaDesabilitada(data)) {
      mudar(data);
      setRascunho(data);
      calendario.mostrar(data);
    }
  }

  function estadoDoDia(dia: DataIso): EstadoDoDia {
    return dia === rascunho ? "selecionado" : "normal";
  }

  return {
    valor: atual,
    aberto,
    abrir,
    fechar,
    alternar: () => (aberto ? fechar() : abrir()),
    rascunho,
    escolher,
    aplicar,
    limpar,
    podeAplicar: rascunho !== null && rascunho !== atual,
    podeLimpar: rascunho !== null || atual !== null,
    /** O que o campo mostra: o digitado enquanto edita, a data gravada fora disso. */
    texto: texto ?? (atual ? formatarDataBr(atual) : ""),
    digitar,
    /** Ao sair do campo, digitação incompleta volta para a data gravada. */
    sairDoTexto: () => setTexto(null),
    hoje: hojeVisto,
    calendario,
    estadoDoDia,
  };
}

export type SeletorDeDataEstado = ReturnType<typeof useSeletorDeData>;
