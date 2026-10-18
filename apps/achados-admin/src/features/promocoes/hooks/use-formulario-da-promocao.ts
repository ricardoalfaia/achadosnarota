"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { useFormularioDeCadastro } from "@/shared/cadastro/use-formulario-de-cadastro";
import { useSaidaDoFormulario } from "@/shared/cadastro/use-saida-do-formulario";
import {
  opcoesDaPromocao,
  opcoesDasCasasDaPromocao,
} from "../consultas/promocoes";
import type { DadosDaPromocao, Promocao } from "../domain/tipos";
import {
  novaPromocao,
  pendenciasDaPromocao,
  SECOES_DA_PROMOCAO,
} from "../domain/validacao";
import { useSalvarPromocao } from "./use-salvar-promocao";

/** A promoção gravada, pelo Query com Suspense. */
export function usePromocao(id: string): Promocao {
  return useSuspenseQuery(opcoesDaPromocao(id)).data;
}

function dadosDaPromocao(p: Promocao): DadosDaPromocao {
  return {
    casaId: p.casaId,
    titulo: p.titulo,
    termos: p.termos,
    tipo: p.tipo,
    icone: p.icone,
    limitePorAssinante: p.limitePorAssinante,
    periodoDeUso: p.periodoDeUso,
    vigencia: p.vigencia,
    status: p.status,
  };
}

/** O ícone padrão de cada tipo, para o cartão do app. */
const ICONE_DO_TIPO: Record<DadosDaPromocao["tipo"], string> = {
  discount: "percent",
  courtesy: "gift",
  two_for_one: "two-for-one",
};

/**
 * Tudo o que o formulário da promoção decide. A regra "casa publicada" do
 * formulário usa a lista do Query; a Action confere de novo pela fonte.
 */
export function useFormularioDaPromocao({
  promocao,
  ativo,
  aoConcluir,
}: {
  promocao: Promocao | null;
  ativo: boolean;
  aoConcluir: () => void;
}) {
  const { data: casas } = useSuspenseQuery(opcoesDasCasasDaPromocao());
  const gravacao = useSalvarPromocao(promocao?.id ?? null);
  const publicada = (casaId: string) =>
    casas.some((casa) => casa.id === casaId && casa.publicada);
  const formulario = useFormularioDeCadastro({
    inicial: promocao ? dadosDaPromocao(promocao) : novaPromocao(),
    secoes: SECOES_DA_PROMOCAO,
    validar: (dados) =>
      pendenciasDaPromocao(dados, { casaPublicada: publicada(dados.casaId) }),
    gravacao,
    aoGravar: aoConcluir,
    ativo,
  });
  const { dados, mudar } = formulario;
  const saida = useSaidaDoFormulario(formulario.alterado, aoConcluir);

  return {
    ...formulario,
    casas,
    casaPublicada: !dados.casaId || publicada(dados.casaId),
    novo: promocao === null,
    titulo: promocao?.titulo ?? "Nova promoção",
    mudarTipo(tipo: DadosDaPromocao["tipo"]) {
      mudar("tipo", tipo);
      mudar("icone", ICONE_DO_TIPO[tipo]);
    },
    ...saida,
  };
}
