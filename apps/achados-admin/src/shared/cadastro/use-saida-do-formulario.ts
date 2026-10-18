"use client";

import { useState } from "react";

/**
 * Sair do formulário com alterações pede confirmação (ADR-0021); sem
 * alterações, sai direto. O diálogo é do componente; aqui só o estado.
 */
export function useSaidaDoFormulario(alterado: boolean, sair: () => void) {
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);
  return {
    confirmandoSaida,
    voltar() {
      if (alterado) setConfirmandoSaida(true);
      else sair();
    },
    cancelarSaida: () => setConfirmandoSaida(false),
    descartar() {
      setConfirmandoSaida(false);
      sair();
    },
  };
}
