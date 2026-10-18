"use client";

import {
  AcoesDaGrade,
  BarraDaGrade,
  Botao,
  BuscaDaGrade,
  ChipDeFiltro,
  ChipsDeFiltro,
  Etiqueta,
  GradeDeCadastro,
  IconeMais,
  Nota,
  RodapeDaGrade,
  SeloDeStatus,
  Tabela,
  TextoDaLinha,
  type ColunaDaTabela,
} from "@achados/ui";

import { TODAS } from "@/shared/cadastro/filtro";
import { SELO_EDITORIAL, STATUS_DA_AVALIACAO } from "../domain/apresentacao";
import type { AvaliacaoDaLista, StatusDaAvaliacao } from "../domain/tipos";
import {
  SITUACOES_DA_AVALIACAO,
  useListaDeAvaliacoes,
} from "../hooks/use-lista-de-avaliacoes";

type Situacao = StatusDaAvaliacao | typeof TODAS;

const dataCurta = (iso: string) => iso.split("-").reverse().join("/");

/** As colunas, fora do componente: a mesma referência a cada desenho. */
const COLUNAS: ColunaDaTabela<AvaliacaoDaLista>[] = [
  {
    id: "casa",
    titulo: "Casa",
    valor: (a) => a.casa,
    celula: (a) => (
      <TextoDaLinha
        principal={a.casa}
        secundario={`${a.criterios} critérios avaliados`}
      />
    ),
    largura: 300,
    fixa: true,
  },
  {
    id: "nota",
    titulo: "Nota",
    tipo: "numero",
    valor: (a) => a.nota,
    celula: (a) => <Nota valor={a.nota} tamanho="md" />,
    largura: 110,
  },
  {
    id: "status",
    titulo: "Situação",
    valor: (a) => STATUS_DA_AVALIACAO[a.status].rotulo,
    celula: (a) => (
      <SeloDeStatus intencao={STATUS_DA_AVALIACAO[a.status].intencao}>
        {STATUS_DA_AVALIACAO[a.status].rotulo}
      </SeloDeStatus>
    ),
    largura: 160,
  },
  {
    id: "selo",
    titulo: "Selo",
    valor: (a) => (a.selo ? SELO_EDITORIAL[a.selo].rotulo : "Sem selo"),
    celula: (a) =>
      a.selo ? (
        <Etiqueta tom={SELO_EDITORIAL[a.selo].tom}>
          {SELO_EDITORIAL[a.selo].rotulo}
        </Etiqueta>
      ) : (
        <span className="text-foreground-subtle">—</span>
      ),
    largura: 150,
  },
  {
    id: "visita",
    titulo: "Visita",
    tipo: "data",
    valor: (a) => a.visitadaEm,
    formatar: (valor) => (typeof valor === "string" ? dataCurta(valor) : ""),
    largura: 130,
  },
];

/** A listagem das avaliações: busca, chips de situação, Tabela e rodapé. */
export function ListagemDeAvaliacoes({
  situacao,
  aoMudarSituacao,
  aoAbrir,
  aoIncluir,
}: {
  situacao: Situacao;
  aoMudarSituacao: (situacao: Situacao) => void;
  aoAbrir: (avaliacao: AvaliacaoDaLista) => void;
  aoIncluir: () => void;
}) {
  const lista = useListaDeAvaliacoes(situacao);

  return (
    <GradeDeCadastro
      barra={
        <BarraDaGrade>
          <BuscaDaGrade
            valor={lista.busca}
            aoMudar={lista.mudarBusca}
            placeholder="Buscar pela casa..."
            rotulo="Buscar avaliações"
            className="max-md:w-full"
          />
          <ChipsDeFiltro rotulo="Situação das avaliações" className="flex-wrap">
            <ChipDeFiltro
              ativo={situacao === TODAS}
              aoEscolher={() => aoMudarSituacao(TODAS)}
            >
              Todas ({lista.contagem[TODAS]})
            </ChipDeFiltro>
            {SITUACOES_DA_AVALIACAO.map((s) => (
              <ChipDeFiltro
                key={s}
                ativo={situacao === s}
                aoEscolher={() => aoMudarSituacao(s)}
              >
                {STATUS_DA_AVALIACAO[s].plural} ({lista.contagem[s]})
              </ChipDeFiltro>
            ))}
          </ChipsDeFiltro>
          <AcoesDaGrade>
            <Botao tamanho="xs" icone={<IconeMais />} onClick={aoIncluir}>
              Nova avaliação
            </Botao>
          </AcoesDaGrade>
        </BarraDaGrade>
      }
      rodape={
        <RodapeDaGrade
          resumo={
            <span aria-live="polite">
              {lista.linhas.length === lista.total
                ? `${lista.total} avaliações`
                : `Mostrando ${lista.linhas.length} de ${lista.total} avaliações`}
              {lista.atualizando && " · atualizando…"}
            </span>
          }
        />
      }
    >
      <Tabela
        rotulo="Avaliações da curadoria"
        colunas={COLUNAS}
        linhas={lista.linhas}
        idDaLinha={idDaAvaliacao}
        aoAbrirLinha={aoAbrir}
        alturaDaLinha={64}
        semRodape
        vazio="Nenhuma avaliação com esses filtros."
        className={lista.atualizando ? "flex-1 opacity-70" : "flex-1"}
      />
    </GradeDeCadastro>
  );
}

const idDaAvaliacao = (avaliacao: AvaliacaoDaLista) => avaliacao.id;
