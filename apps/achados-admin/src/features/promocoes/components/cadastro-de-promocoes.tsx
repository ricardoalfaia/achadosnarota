"use client";

import {
  TelaDeCadastro,
  type ControleDoFormulario,
} from "@/shared/cadastro/tela-de-cadastro";
import { usePromocao } from "../hooks/use-formulario-da-promocao";
import { SITUACOES_DA_PROMOCAO } from "../hooks/use-lista-de-promocoes";
import { FormularioDaPromocao } from "./formulario-da-promocao";
import { ListagemDePromocoes } from "./listagem-de-promocoes";

/** A tela de promoções: a listagem e o formulário, compostos pela tela comum. */
export function CadastroDePromocoes() {
  return (
    <TelaDeCadastro
      situacoes={SITUACOES_DA_PROMOCAO}
      colunasDoEsqueleto={5}
      lista={(controle) => (
        <ListagemDePromocoes
          situacao={controle.situacao}
          aoMudarSituacao={controle.mudarSituacao}
          aoAbrir={(promocao) => controle.abrir(promocao.id)}
          aoIncluir={controle.incluir}
        />
      )}
      formulario={(registro, controle) =>
        registro.tipo === "novo" ? (
          <FormularioDaPromocao
            promocao={null}
            ativo={controle.ativo}
            aoConcluir={controle.fechar}
          />
        ) : (
          <EdicaoDaPromocao id={registro.id} {...controle} />
        )
      }
    />
  );
}

/** Lê a promoção (suspende até chegar) e abre o formulário com ela. */
function EdicaoDaPromocao({
  id,
  ativo,
  fechar,
}: { id: string } & ControleDoFormulario) {
  const promocao = usePromocao(id);
  return (
    <FormularioDaPromocao
      promocao={promocao}
      ativo={ativo}
      aoConcluir={fechar}
    />
  );
}
