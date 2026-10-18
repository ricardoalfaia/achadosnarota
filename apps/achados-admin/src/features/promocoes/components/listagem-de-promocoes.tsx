"use client";

import {
  AcoesDaGrade,
  BarraDaGrade,
  Botao,
  BuscaDaGrade,
  ChipDeFiltro,
  ChipsDeFiltro,
  GradeDeCadastro,
  IconeMais,
  RodapeDaGrade,
  SeloDeStatus,
  Tabela,
  TextoDaLinha,
  type ColunaDaTabela,
} from "@achados/ui";

import { TODAS } from "@/shared/cadastro/filtro";
import { usePodeEscrever } from "@/shared/sessao/equipe-provider";
import {
  regraDeUso,
  STATUS_DA_PROMOCAO,
  TIPO_DA_PROMOCAO,
  vigenciaEmPalavras,
} from "../domain/apresentacao";
import type { PromocaoDaLista, StatusDaPromocao } from "../domain/tipos";
import {
  SITUACOES_DA_PROMOCAO,
  useListaDePromocoes,
} from "../hooks/use-lista-de-promocoes";

type Situacao = StatusDaPromocao | typeof TODAS;

const hoje = () => new Date().toISOString().slice(0, 10);

/** As colunas, fora do componente: a mesma referência a cada desenho. */
const COLUNAS: ColunaDaTabela<PromocaoDaLista>[] = [
  {
    id: "titulo",
    titulo: "Promoção",
    valor: (p) => p.titulo,
    celula: (p) => <TextoDaLinha principal={p.titulo} secundario={p.casa} />,
    largura: 320,
    fixa: true,
  },
  {
    id: "tipo",
    titulo: "Tipo",
    valor: (p) => TIPO_DA_PROMOCAO[p.tipo],
    largura: 160,
  },
  {
    id: "status",
    titulo: "Situação",
    valor: (p) => STATUS_DA_PROMOCAO[p.status].rotulo,
    celula: (p) => (
      <SeloDeStatus intencao={STATUS_DA_PROMOCAO[p.status].intencao}>
        {STATUS_DA_PROMOCAO[p.status].rotulo}
      </SeloDeStatus>
    ),
    largura: 160,
  },
  {
    id: "uso",
    titulo: "Regra de uso",
    valor: (p) => regraDeUso(p.limitePorAssinante, p.periodoDeUso),
    largura: 170,
  },
  {
    id: "vigencia",
    titulo: "Vigência",
    tipo: "data",
    valor: (p) => p.validaAte,
    celula: (p) => (
      <span className="text-foreground-muted">
        {vigenciaEmPalavras(p.validaDe, p.validaAte, hoje())}
      </span>
    ),
    largura: 190,
  },
];

/** A listagem de promoções: busca, chips de situação, Tabela e rodapé. */
export function ListagemDePromocoes({
  situacao,
  aoMudarSituacao,
  aoAbrir,
  aoIncluir,
}: {
  situacao: Situacao;
  aoMudarSituacao: (situacao: Situacao) => void;
  aoAbrir: (promocao: PromocaoDaLista) => void;
  aoIncluir: () => void;
}) {
  const podeIncluir = usePodeEscrever("promocoes");
  const lista = useListaDePromocoes(situacao);

  return (
    <GradeDeCadastro
      barra={
        <BarraDaGrade>
          <BuscaDaGrade
            valor={lista.busca}
            aoMudar={lista.mudarBusca}
            placeholder="Buscar por promoção ou casa..."
            rotulo="Buscar promoções"
            className="max-md:w-full"
          />
          <ChipsDeFiltro rotulo="Situação das promoções" className="flex-wrap">
            <ChipDeFiltro
              ativo={situacao === TODAS}
              aoEscolher={() => aoMudarSituacao(TODAS)}
            >
              Todas ({lista.contagem[TODAS]})
            </ChipDeFiltro>
            {SITUACOES_DA_PROMOCAO.map((s) => (
              <ChipDeFiltro
                key={s}
                ativo={situacao === s}
                aoEscolher={() => aoMudarSituacao(s)}
              >
                {STATUS_DA_PROMOCAO[s].plural} ({lista.contagem[s]})
              </ChipDeFiltro>
            ))}
          </ChipsDeFiltro>
          <AcoesDaGrade>
            {podeIncluir && (
              <Botao tamanho="xs" icone={<IconeMais />} onClick={aoIncluir}>
                Nova promoção
              </Botao>
            )}
          </AcoesDaGrade>
        </BarraDaGrade>
      }
      rodape={
        <RodapeDaGrade
          resumo={
            <span aria-live="polite">
              {lista.linhas.length === lista.total
                ? `${lista.total} promoções`
                : `Mostrando ${lista.linhas.length} de ${lista.total} promoções`}
              {lista.atualizando && " · atualizando…"}
            </span>
          }
        />
      }
    >
      <Tabela
        rotulo="Promoções"
        colunas={COLUNAS}
        linhas={lista.linhas}
        idDaLinha={idDaPromocao}
        aoAbrirLinha={aoAbrir}
        alturaDaLinha={64}
        semRodape
        vazio="Nenhuma promoção com esses filtros."
        className={lista.atualizando ? "flex-1 opacity-70" : "flex-1"}
      />
    </GradeDeCadastro>
  );
}

const idDaPromocao = (promocao: PromocaoDaLista) => promocao.id;
