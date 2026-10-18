"use client";

import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useFormularioDeCadastro } from "@/shared/cadastro/use-formulario-de-cadastro";
import { useSaidaDoFormulario } from "@/shared/cadastro/use-saida-do-formulario";
import { opcoesDaCasa, opcoesDoCatalogo } from "../consultas/casas";
import { slugDoNome } from "../domain/apresentacao";
import type { Casa, DadosDaCasa } from "../domain/tipos";
import {
  novaCasa,
  pendenciasDaCasa,
  SECOES_DA_CASA,
} from "../domain/validacao";
import { useSalvarCasa } from "./use-salvar-casa";

/** A casa gravada, pelo Query com Suspense (o DataBoundary mostra a espera). */
export function useCasa(id: string): Casa {
  return useSuspenseQuery(opcoesDaCasa(id)).data;
}

/** Cidades e categorias para os campos de escolha. */
export function useOpcoesDoCatalogo() {
  return useSuspenseQuery(opcoesDoCatalogo()).data;
}

function dadosDaCasa(casa: Casa): DadosDaCasa {
  return {
    nome: casa.nome,
    slug: casa.slug,
    categoriaId: casa.categoriaId,
    cidadeId: casa.cidadeId,
    especialidade: casa.especialidade,
    resumo: casa.resumo,
    descricao: casa.descricao,
    tags: casa.tags,
    endereco: casa.endereco,
    telefone: casa.telefone,
    site: casa.site,
    horarios: casa.horarios,
    observacaoDoHorario: casa.observacaoDoHorario,
    status: casa.status,
  };
}

/**
 * Tudo o que o formulário da casa decide; o componente só desenha. O endereço
 * da ficha acompanha o nome enquanto ninguém o editou à mão. Voltar com
 * alterações pede confirmação.
 */
export function useFormularioDaCasa({
  casa,
  ativo,
  aoConcluir,
}: {
  /** `null` na inclusão. */
  casa: Casa | null;
  ativo: boolean;
  aoConcluir: () => void;
}) {
  const opcoes = useOpcoesDoCatalogo();
  const fotos = casa?.fotos ?? [];
  const gravacao = useSalvarCasa(casa?.id ?? null);
  const formulario = useFormularioDeCadastro({
    inicial: casa ? dadosDaCasa(casa) : novaCasa(),
    secoes: SECOES_DA_CASA,
    validar: (dados) => pendenciasDaCasa(dados, fotos.length),
    gravacao,
    aoGravar: aoConcluir,
    ativo,
  });
  const { dados, mudar } = formulario;
  const saida = useSaidaDoFormulario(formulario.alterado, aoConcluir);
  // O texto do campo de tags é guardado como digitado ("Família, "), e a
  // lista é derivada dele a cada mudança.
  const [textoDasTags, setTextoDasTags] = useState(dados.tags.join(", "));
  // PROVISÓRIO: o envio ao armazenamento (R2) entra na próxima fase; por ora
  // a tela só mostra o que foi escolhido, sem gravar.
  const [fotosEscolhidas, setFotosEscolhidas] = useState<readonly string[]>([]);

  function mudarNome(nome: string) {
    if (!dados.slug || dados.slug === slugDoNome(dados.nome))
      mudar("slug", slugDoNome(nome));
    mudar("nome", nome);
  }

  function mudarTags(texto: string) {
    setTextoDasTags(texto);
    mudar(
      "tags",
      texto
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 12)
    );
  }

  /** Aplica uma edição pura do horário (domain/horario) aos dados. */
  const editarHorario = (
    edicao: (turnos: DadosDaCasa["horarios"]) => DadosDaCasa["horarios"]
  ) => mudar("horarios", edicao(dados.horarios));

  return {
    ...formulario,
    editarHorario,
    opcoes,
    fotos,
    novo: casa === null,
    titulo: casa ? casa.nome : "Nova casa",
    mudarNome,
    textoDasTags,
    mudarTags,
    fotosEscolhidas,
    escolherFotos: (arquivos: File[]) =>
      setFotosEscolhidas((atuais) => [
        ...atuais,
        ...arquivos.map((arquivo) => arquivo.name),
      ]),
    ...saida,
  };
}
