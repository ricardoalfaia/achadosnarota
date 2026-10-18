"use client";

import { AppError } from "@achados/core";
import { Botao, EstadoVazio } from "@achados/ui";
import { CloudOff, SearchX } from "lucide-react";

/**
 * O `errorFallback` do DataBoundary nas telas do painel: registro inexistente
 * (ou de outro escopo) diz "não encontrado" sem tentar de novo; o resto
 * oferece tentar de novo. A mensagem nunca traz a causa (ADR-0004, ADR-0005).
 */
export function FalhaDaRegiao({
  erro,
  tentarDeNovo,
  aoVoltar,
}: {
  erro: Error;
  tentarDeNovo: () => void;
  /** Com ele, "não encontrado" mostra o caminho de volta. */
  aoVoltar?: () => void;
}) {
  if (erro instanceof AppError && erro.category === "not_found") {
    return (
      <EstadoVazio
        icone={<SearchX />}
        titulo="Registro não encontrado"
        descricao="Ele pode ter sido removido, ou o endereço está incompleto."
        acao={
          aoVoltar && (
            <Botao variante="contorno" tamanho="xs" onClick={aoVoltar}>
              Voltar para a lista
            </Botao>
          )
        }
        className="m-6 flex-1"
      />
    );
  }
  return (
    <EstadoVazio
      icone={<CloudOff />}
      titulo="Não foi possível carregar"
      descricao={
        erro instanceof AppError
          ? erro.message
          : "Algo deu errado ao buscar os dados."
      }
      acao={
        <Botao variante="contorno" tamanho="xs" onClick={tentarDeNovo}>
          Tentar de novo
        </Botao>
      }
      className="m-6 flex-1"
    />
  );
}
