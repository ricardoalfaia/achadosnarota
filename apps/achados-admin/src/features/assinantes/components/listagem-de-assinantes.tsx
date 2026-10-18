"use client";

import {
  Alerta,
  BarraDaGrade,
  Botao,
  BuscaDaGrade,
  ChipDeFiltro,
  ChipsDeFiltro,
  GradeDeCadastro,
  RodapeDaGrade,
  SeloDeStatus,
  Tabela,
  TextoDaLinha,
  type ColunaDaTabela,
} from "@achados/ui";

import {
  dataCurta,
  SITUACAO,
  SITUACOES_DO_ASSINANTE,
  TODOS,
  type AssinanteDaLista,
  type FiltroDeSituacao,
} from "../domain/assinantes";
import { useListaDeAssinantes } from "../hooks/use-lista-de-assinantes";

/**
 * As colunas, fora do componente (ADR-0015). Sem ordenação nem filtro da
 * Tabela: com a lista paginada no servidor, eles valeriam só para as linhas
 * já carregadas e enganariam. A ordem é a do servidor (mais recentes antes).
 */
const COLUNAS: ColunaDaTabela<AssinanteDaLista>[] = [
  {
    id: "pessoa",
    titulo: "Pessoa",
    valor: (a) => a.nome,
    celula: (a) => (
      <TextoDaLinha principal={a.nome} secundario={a.emailMascarado} />
    ),
    largura: 300,
    fixa: true,
    semOrdenacao: true,
    semFiltro: true,
  },
  {
    id: "situacao",
    titulo: "Passaporte",
    valor: (a) => SITUACAO[a.situacao].rotulo,
    celula: (a) => (
      <SeloDeStatus intencao={SITUACAO[a.situacao].intencao}>
        {SITUACAO[a.situacao].rotulo}
      </SeloDeStatus>
    ),
    largura: 180,
    semOrdenacao: true,
    semFiltro: true,
  },
  {
    id: "validoAte",
    titulo: "Válido até",
    valor: (a) => (a.validoAte ? dataCurta(a.validoAte) : "—"),
    largura: 130,
    semOrdenacao: true,
    semFiltro: true,
  },
  {
    id: "usos",
    titulo: "Benefícios usados",
    tipo: "numero",
    valor: (a) => a.beneficiosUsados,
    largura: 160,
    semOrdenacao: true,
    semFiltro: true,
  },
  {
    id: "desde",
    titulo: "Na rota desde",
    valor: (a) => dataCurta(a.desde),
    celula: (a) => (
      <span className="text-foreground-muted">{dataCurta(a.desde)}</span>
    ),
    largura: 140,
    semOrdenacao: true,
    semFiltro: true,
  },
];

const idDoAssinante = (a: AssinanteDaLista) => a.id;

/**
 * A grade de assinantes para muitas pessoas: busca por nome ou e-mail no
 * servidor, chips de situação com a contagem da busca, a Tabela com rolagem
 * infinita (50 por vez) e o rodapé com o total.
 */
export function ListagemDeAssinantes({
  situacaoInicial,
  aoAbrir,
}: {
  situacaoInicial: FiltroDeSituacao;
  aoAbrir: (assinante: AssinanteDaLista) => void;
}) {
  const lista = useListaDeAssinantes(situacaoInicial);
  const total = lista.contagem?.[lista.situacao] ?? lista.linhas.length;

  return (
    <GradeDeCadastro
      className="min-h-120"
      barra={
        <BarraDaGrade>
          <BuscaDaGrade
            valor={lista.busca}
            aoMudar={lista.mudarBusca}
            placeholder="Buscar por nome ou e-mail..."
            rotulo="Buscar assinantes"
            className="max-md:w-full"
          />
          <ChipsDeFiltro rotulo="Situação do passaporte" className="flex-wrap">
            <ChipDeFiltro
              ativo={lista.situacao === TODOS}
              aoEscolher={() => lista.mudarSituacao(TODOS)}
            >
              Todos{lista.contagem && ` (${lista.contagem[TODOS]})`}
            </ChipDeFiltro>
            {SITUACOES_DO_ASSINANTE.map((s) => (
              <ChipDeFiltro
                key={s}
                ativo={lista.situacao === s}
                aoEscolher={() => lista.mudarSituacao(s)}
              >
                {SITUACAO[s].plural}
                {lista.contagem && ` (${lista.contagem[s]})`}
              </ChipDeFiltro>
            ))}
          </ChipsDeFiltro>
        </BarraDaGrade>
      }
      rodape={
        <RodapeDaGrade
          resumo={
            <span aria-live="polite">
              {lista.carregando
                ? "Carregando…"
                : lista.linhas.length >= total
                  ? `${total} ${total === 1 ? "pessoa" : "pessoas"}`
                  : `Mostrando ${lista.linhas.length} de ${total} pessoas`}
              {lista.atualizando && " · atualizando…"}
            </span>
          }
        />
      }
    >
      {lista.erro && !lista.linhas.length ? (
        <div className="flex flex-1 flex-col items-start gap-3 p-5">
          <Alerta intencao="erro">
            {lista.erro.message || "Não foi possível carregar os assinantes."}
          </Alerta>
          <Botao variante="contorno" tamanho="xs" onClick={lista.tentarDeNovo}>
            Tentar de novo
          </Botao>
        </div>
      ) : (
        <Tabela
          rotulo="Assinantes"
          colunas={COLUNAS}
          linhas={lista.linhas}
          idDaLinha={idDoAssinante}
          aoAbrirLinha={aoAbrir}
          aoChegarAoFim={lista.carregarMais}
          carregandoMais={lista.carregandoMais || lista.carregando}
          total={total}
          alturaDaLinha={64}
          semRodape
          vazio={
            lista.busca
              ? "Ninguém encontrado com essa busca."
              : "Nenhuma pessoa nesta situação."
          }
          className={lista.atualizando ? "flex-1 opacity-70" : "flex-1"}
        />
      )}
    </GradeDeCadastro>
  );
}
