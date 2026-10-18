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
  RodapeDaGrade,
  SeloDeStatus,
  Tabela,
  TextoDaLinha,
  type ColunaDaTabela,
} from "@achados/ui";
import { ImageOff } from "lucide-react";

import { TODAS } from "@/shared/cadastro/filtro";
import { usePodeEscrever } from "@/shared/sessao/equipe-provider";
import { STATUS_DA_CASA, tempoDesde } from "../domain/apresentacao";
import type { CasaDaLista, StatusDaCasa } from "../domain/tipos";
import {
  SITUACOES_DA_CASA,
  useListaDeCasas,
} from "../hooks/use-lista-de-casas";

type Situacao = StatusDaCasa | typeof TODAS;

/**
 * As colunas da listagem, fora do componente: a mesma referência a cada
 * desenho (ADR-0015, ADR-0016). Clique ou Enter na linha abre a casa.
 */
const COLUNAS: ColunaDaTabela<CasaDaLista>[] = [
  {
    id: "nome",
    titulo: "Casa",
    valor: (casa) => casa.nome,
    celula: (casa) => (
      <TextoDaLinha principal={casa.nome} secundario={casa.especialidade} />
    ),
    largura: 300,
    fixa: true,
  },
  { id: "cidade", titulo: "Cidade", valor: (c) => c.cidade, largura: 220 },
  {
    id: "categoria",
    titulo: "Categoria",
    valor: (c) => c.categoria,
    largura: 150,
  },
  {
    id: "status",
    titulo: "Situação",
    valor: (c) => STATUS_DA_CASA[c.status].rotulo,
    celula: (c) => (
      <SeloDeStatus intencao={STATUS_DA_CASA[c.status].intencao}>
        {STATUS_DA_CASA[c.status].rotulo}
      </SeloDeStatus>
    ),
    largura: 150,
  },
  {
    id: "curadoria",
    titulo: "Curadoria",
    valor: (c) => (c.avaliada ? "Avaliada" : "Sem avaliação"),
    celula: (c) =>
      c.avaliada ? (
        <Etiqueta tom="sucessoSuave">Avaliada</Etiqueta>
      ) : (
        <Etiqueta tom="neutro">Sem avaliação</Etiqueta>
      ),
    largura: 150,
  },
  {
    id: "fotos",
    titulo: "Fotos",
    tipo: "numero",
    valor: (c) => c.fotos,
    celula: (c) =>
      c.fotos === 0 ? (
        <span className="inline-flex items-center gap-1 text-warning">
          <ImageOff aria-hidden="true" className="size-3.5" />0
        </span>
      ) : (
        c.fotos
      ),
    largura: 90,
  },
  {
    id: "promocoes",
    titulo: "Promoções ativas",
    tipo: "numero",
    valor: (c) => c.promocoesAtivas,
    largura: 150,
  },
  {
    id: "atualizada",
    titulo: "Atualizada",
    tipo: "data",
    valor: (c) => c.atualizadaEm.slice(0, 10),
    celula: (c) => (
      <span className="text-foreground-muted">
        {tempoDesde(c.atualizadaEm)}
      </span>
    ),
    largura: 130,
  },
];

/**
 * A listagem de casas: barra com busca, chips de situação e "Nova casa"; a
 * Tabela do design system; o rodapé com a contagem. Os dados vêm do hook; a
 * situação e a abertura de registro vêm de quem compõe (a URL).
 */
export function ListagemDeCasas({
  situacao,
  aoMudarSituacao,
  aoAbrir,
  aoIncluir,
}: {
  situacao: Situacao;
  aoMudarSituacao: (situacao: Situacao) => void;
  aoAbrir: (casa: CasaDaLista) => void;
  aoIncluir: () => void;
}) {
  const podeIncluir = usePodeEscrever("casas");
  const lista = useListaDeCasas(situacao);

  return (
    <GradeDeCadastro
      barra={
        <BarraDaGrade>
          <BuscaDaGrade
            valor={lista.busca}
            aoMudar={lista.mudarBusca}
            placeholder="Buscar por nome, cidade ou especialidade..."
            rotulo="Buscar casas"
            className="max-md:w-full"
          />
          <ChipsDeFiltro rotulo="Situação das casas" className="flex-wrap">
            <ChipDeFiltro
              ativo={situacao === TODAS}
              aoEscolher={() => aoMudarSituacao(TODAS)}
            >
              Todas ({lista.contagem[TODAS]})
            </ChipDeFiltro>
            {SITUACOES_DA_CASA.map((s) => (
              <ChipDeFiltro
                key={s}
                ativo={situacao === s}
                aoEscolher={() => aoMudarSituacao(s)}
              >
                {STATUS_DA_CASA[s].plural} ({lista.contagem[s]})
              </ChipDeFiltro>
            ))}
          </ChipsDeFiltro>
          <AcoesDaGrade>
            {podeIncluir && (
              <Botao tamanho="xs" icone={<IconeMais />} onClick={aoIncluir}>
                Nova casa
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
                ? `${lista.total} casas cadastradas`
                : `Mostrando ${lista.linhas.length} de ${lista.total} casas`}
              {lista.atualizando && " · atualizando…"}
            </span>
          }
        />
      }
    >
      <Tabela
        rotulo="Casas cadastradas"
        colunas={COLUNAS}
        linhas={lista.linhas}
        idDaLinha={idDaCasa}
        aoAbrirLinha={aoAbrir}
        alturaDaLinha={64}
        semRodape
        vazio="Nenhuma casa com esses filtros."
        className={lista.atualizando ? "flex-1 opacity-70" : "flex-1"}
      />
    </GradeDeCadastro>
  );
}

const idDaCasa = (casa: CasaDaLista) => casa.id;
