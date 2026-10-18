"use client";

import {
  TelaDeCadastro,
  type ControleDoFormulario,
} from "@/shared/cadastro/tela-de-cadastro";
import { useAvaliacao } from "../hooks/use-formulario-da-avaliacao";
import { SITUACOES_DA_AVALIACAO } from "../hooks/use-lista-de-avaliacoes";
import { FormularioDaAvaliacao } from "./formulario-da-avaliacao";
import { ListagemDeAvaliacoes } from "./listagem-de-avaliacoes";

/** A tela da curadoria: a listagem e o formulário, compostos pela tela comum. */
export function CadastroDeAvaliacoes() {
  return (
    <TelaDeCadastro
      situacoes={SITUACOES_DA_AVALIACAO}
      colunasDoEsqueleto={5}
      lista={(controle) => (
        <ListagemDeAvaliacoes
          situacao={controle.situacao}
          aoMudarSituacao={controle.mudarSituacao}
          aoAbrir={(avaliacao) => controle.abrir(avaliacao.id)}
          aoIncluir={controle.incluir}
        />
      )}
      formulario={(registro, controle) =>
        registro.tipo === "novo" ? (
          <FormularioDaAvaliacao
            avaliacao={null}
            ativo={controle.ativo}
            aoConcluir={controle.fechar}
          />
        ) : (
          <EdicaoDaAvaliacao id={registro.id} {...controle} />
        )
      }
    />
  );
}

/** Lê a avaliação (suspende até chegar) e abre o formulário com ela. */
function EdicaoDaAvaliacao({
  id,
  ativo,
  fechar,
}: { id: string } & ControleDoFormulario) {
  const avaliacao = useAvaliacao(id);
  return (
    <FormularioDaAvaliacao
      avaliacao={avaliacao}
      ativo={ativo}
      aoConcluir={fechar}
    />
  );
}
