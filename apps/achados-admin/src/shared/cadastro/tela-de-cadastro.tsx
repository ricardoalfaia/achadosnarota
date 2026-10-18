"use client";

import type { ReactNode } from "react";
import { DataBoundary } from "@achados/data-boundary";
import { Visoes } from "@achados/ui";

import { EsqueletoDaListagem, EsqueletoDoFormulario } from "./esqueletos";
import { FalhaDaRegiao } from "./falha-da-regiao";
import type { TODAS } from "./filtro";
import { useRegistroNaUrl, type RegistroAberto } from "./use-registro-na-url";

export type ControleDaLista<S extends string> = {
  situacao: S | typeof TODAS;
  mudarSituacao: (situacao: S | typeof TODAS) => void;
  abrir: (id: string) => void;
  incluir: () => void;
};

export type ControleDoFormulario = {
  /** O formulário está na frente (atalhos valem só nele). */
  ativo: boolean;
  fechar: () => void;
};

/**
 * A tela de cadastro do painel (ADR-0021): lista e formulário na mesma
 * página, com o registro aberto na URL e a transição do design system
 * (`Visoes`). Cada região tem o seu DataBoundary, com esqueleto na moldura
 * final e recuperação própria (ADR-0005): a falha da lista não derruba o
 * formulário, e vice-versa. A feature fornece as duas regiões.
 */
export function TelaDeCadastro<S extends string>({
  situacoes,
  colunasDoEsqueleto,
  lista,
  formulario,
}: {
  situacoes: readonly S[];
  colunasDoEsqueleto?: number;
  lista: (controle: ControleDaLista<S>) => ReactNode;
  formulario: (
    registro: RegistroAberto,
    controle: ControleDoFormulario
  ) => ReactNode;
}) {
  const registro = useRegistroNaUrl(situacoes);
  const aberto = registro.formulario;

  return (
    <Visoes
      visao={registro.aberto ? "formulario" : "lista"}
      className="min-h-120 rounded-card"
      lista={
        <DataBoundary
          fallback={<EsqueletoDaListagem colunas={colunasDoEsqueleto} />}
          errorFallback={(erro, reset) => (
            <FalhaDaRegiao erro={erro} tentarDeNovo={reset} />
          )}
        >
          {lista({
            situacao: registro.situacao,
            mudarSituacao: registro.mudarSituacao,
            abrir: (id) => registro.abrir({ tipo: "edicao", id }),
            incluir: () => registro.abrir({ tipo: "novo" }),
          })}
        </DataBoundary>
      }
      formulario={
        aberto && (
          <DataBoundary
            key={registro.abertura}
            fallback={<EsqueletoDoFormulario />}
            errorFallback={(erro, reset) => (
              <FalhaDaRegiao
                erro={erro}
                tentarDeNovo={reset}
                aoVoltar={registro.fechar}
              />
            )}
          >
            {formulario(aberto, {
              ativo: registro.aberto !== null,
              fechar: registro.fechar,
            })}
          </DataBoundary>
        )
      }
    />
  );
}
