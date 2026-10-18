"use client";

import type { Criterio } from "@achados/db";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { useFormularioDeCadastro } from "@/shared/cadastro/use-formulario-de-cadastro";
import { useSaidaDoFormulario } from "@/shared/cadastro/use-saida-do-formulario";
import { executarAcao } from "@/shared/consultas/acao";
import { salvarAvaliacao } from "../actions";
import {
  CHAVE_DA_CURADORIA,
  opcoesDaAvaliacao,
  opcoesDasCasasDaCuradoria,
} from "../consultas/curadoria";
import { ganhaOSelo, media, notasAvaliadas } from "../domain/criterios";
import type { Avaliacao, DadosDaAvaliacao } from "../domain/tipos";
import {
  novaAvaliacao,
  pendenciasDaAvaliacao,
  SECOES_DA_AVALIACAO,
} from "../domain/validacao";

/** A avaliação gravada, pelo Query com Suspense. */
export function useAvaliacao(id: string): Avaliacao {
  return useSuspenseQuery(opcoesDaAvaliacao(id)).data;
}

/**
 * Gravar a avaliação: o único coordenador da operação (ADR-0006). Invalida a
 * curadoria e a lista de casas, que mostra se a casa está avaliada.
 */
function useSalvarAvaliacao(id: string | null) {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (dados: DadosDaAvaliacao) =>
      executarAcao(salvarAvaliacao(id, dados)),
    onSuccess: () =>
      Promise.all([
        cliente.invalidateQueries({ queryKey: CHAVE_DA_CURADORIA }),
        cliente.invalidateQueries({ queryKey: ["admin", "casas", "lista"] }),
        cliente.invalidateQueries({ queryKey: ["admin", "inicio"] }),
      ]),
  });
}

const hoje = () => new Date().toISOString().slice(0, 10);

function dadosDaAvaliacao(a: Avaliacao): DadosDaAvaliacao {
  return {
    casaId: a.casaId,
    visitadaEm: a.visitadaEm,
    notas: a.notas,
    parecer: a.parecer,
    ressalvas: a.ressalvas,
    achado: a.achado,
    dicas: a.dicas,
    selo: a.selo,
    status: a.status,
  };
}

/**
 * Tudo o que o formulário da avaliação decide. A média e o selo Achados na
 * Rota são calculados das notas, a cada mudança, sem estado próprio; o
 * servidor recalcula ao gravar.
 */
export function useFormularioDaAvaliacao({
  avaliacao,
  ativo,
  aoConcluir,
}: {
  avaliacao: Avaliacao | null;
  ativo: boolean;
  aoConcluir: () => void;
}) {
  const { data: casas } = useSuspenseQuery(opcoesDasCasasDaCuradoria());
  const gravacao = useSalvarAvaliacao(avaliacao?.id ?? null);
  const formulario = useFormularioDeCadastro({
    inicial: avaliacao ? dadosDaAvaliacao(avaliacao) : novaAvaliacao(),
    secoes: SECOES_DA_AVALIACAO,
    validar: (dados) => pendenciasDaAvaliacao(dados, hoje()),
    gravacao,
    aoGravar: aoConcluir,
    ativo,
  });
  const saida = useSaidaDoFormulario(formulario.alterado, aoConcluir);
  const { dados, mudar } = formulario;
  const notas = notasAvaliadas(dados.notas);

  return {
    ...formulario,
    ...saida,
    casas,
    hoje: hoje(),
    novo: avaliacao === null,
    titulo:
      casas.find((casa) => casa.id === dados.casaId)?.nome ?? "Nova avaliação",
    media: media(notas),
    criteriosAvaliados: notas.length,
    ganhaOSelo: ganhaOSelo(notas),
    mudarNota(criterio: Criterio, texto: string) {
      mudar("notas", { ...dados.notas, [criterio]: texto });
    },
  };
}
