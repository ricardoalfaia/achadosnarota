"use client";

import { useState, type FormEvent } from "react";
import { useDebouncedCallback } from "@achados/ui/hooks";

import { normalizarBusca } from "../domain/filtro";
import { useFiltroDoCatalogo } from "./use-filtro-do-catalogo";

const PAUSA_EM_MS = 300;

/**
 * O campo de busca: o texto digitado é estado local; depois de uma pausa
 * curta, vira o filtro da URL (ADR-0006: o texto ainda não aplicado não é
 * dono do filtro). Enviar o formulário aplica na hora.
 */
export function useBuscaDeLugares() {
  const { filtro, mudar } = useFiltroDoCatalogo();
  const [termo, setTermo] = useState(filtro.busca ?? "");
  // A busca mudou por fora (voltar do navegador, "Ver todos"): o campo
  // acompanha, ajustado durante o desenho, sem efeito.
  const [buscaAplicada, setBuscaAplicada] = useState(filtro.busca);
  if (filtro.busca !== buscaAplicada) {
    setBuscaAplicada(filtro.busca);
    if (normalizarBusca(termo) !== filtro.busca) setTermo(filtro.busca ?? "");
  }

  const aplicar = (valor: string) =>
    mudar({ busca: normalizarBusca(valor) }, "substituir");
  const aplicarDepoisDaPausa = useDebouncedCallback(aplicar, PAUSA_EM_MS);

  return {
    termo,
    aoDigitar: (valor: string) => {
      setTermo(valor);
      aplicarDepoisDaPausa(valor);
    },
    aoEnviar: (evento: FormEvent<HTMLFormElement>) => {
      evento.preventDefault();
      aplicar(termo);
    },
  };
}
