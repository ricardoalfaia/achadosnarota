"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { hrefDoFiltro, normalizarBusca } from "../domain/filtro";

/**
 * A busca do cabeçalho, de qualquer tela: o texto é local e, ao enviar, leva
 * à exploração já filtrada, na altura da lista. Começa do zero (sem cidade
 * nem categoria), porque fora da exploração não há filtro na URL.
 */
export function useBuscaRapida() {
  const router = useRouter();
  const [termo, setTermo] = useState("");
  return {
    termo,
    aoDigitar: setTermo,
    aoEnviar: (evento: FormEvent<HTMLFormElement>) => {
      evento.preventDefault();
      const busca = normalizarBusca(termo);
      router.push(`${hrefDoFiltro({}, { busca })}#destaques`);
    },
  };
}
