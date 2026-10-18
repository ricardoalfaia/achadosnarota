"use client";

import {
  TelaDeCadastro,
  type ControleDoFormulario,
} from "@/shared/cadastro/tela-de-cadastro";
import { useCasa } from "../hooks/use-formulario-da-casa";
import { SITUACOES_DA_CASA } from "../hooks/use-lista-de-casas";
import { FormularioDaCasa } from "./formulario-da-casa";
import { ListagemDeCasas } from "./listagem-de-casas";

/** A tela de casas: a listagem e o formulário, compostos pela tela comum. */
export function CadastroDeCasas() {
  return (
    <TelaDeCadastro
      situacoes={SITUACOES_DA_CASA}
      colunasDoEsqueleto={7}
      lista={(controle) => (
        <ListagemDeCasas
          situacao={controle.situacao}
          aoMudarSituacao={controle.mudarSituacao}
          aoAbrir={(casa) => controle.abrir(casa.id)}
          aoIncluir={controle.incluir}
        />
      )}
      formulario={(registro, controle) =>
        registro.tipo === "novo" ? (
          <FormularioDaCasa
            casa={null}
            ativo={controle.ativo}
            aoConcluir={controle.fechar}
          />
        ) : (
          <EdicaoDaCasa id={registro.id} {...controle} />
        )
      }
    />
  );
}

/** Lê a casa (suspende até chegar) e abre o formulário com ela. */
function EdicaoDaCasa({
  id,
  ativo,
  fechar,
}: { id: string } & ControleDoFormulario) {
  const casa = useCasa(id);
  return <FormularioDaCasa casa={casa} ativo={ativo} aoConcluir={fechar} />;
}
