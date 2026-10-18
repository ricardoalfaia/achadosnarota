"use client";

import {
  Avatar,
  BarraDaGrade,
  BuscaDaGrade,
  ChipDeFiltro,
  ChipsDeFiltro,
  Dialogo,
  GradeDeCadastro,
  RodapeDaGrade,
  SeloDeStatus,
  Tabela,
  TextoDaLinha,
  type ColunaDaTabela,
} from "@achados/ui";
import { ChevronRight, Store } from "lucide-react";

import { TODAS } from "@/shared/cadastro/filtro";
import {
  nomesDosOperadores,
  ROTULO_DA_SITUACAO,
  SITUACOES_DO_BALCAO,
  type CasaComOperadores,
  type CasaDaLista,
  type SituacaoDoBalcao,
} from "../domain/balcao";
import { useBalcaoDasCasas } from "../hooks/use-balcao-das-casas";
import { BalcaoDaCasa } from "./balcao-da-casa";

/** Até quantos rostos aparecem na linha antes do "+N". */
const ROSTOS = 3;

/** As colunas, fora do componente: a mesma referência a cada desenho (ADR-0015). */
const COLUNAS: ColunaDaTabela<CasaDaLista>[] = [
  {
    id: "casa",
    titulo: "Casa",
    valor: (casa) => casa.nome,
    celula: (casa) => (
      <TextoDaLinha principal={casa.nome} secundario={casa.cidade} />
    ),
    largura: 280,
    fixa: true,
  },
  {
    id: "operadores",
    titulo: "No balcão",
    valor: (casa) => nomesDosOperadores(casa.operadores) || "Ninguém",
    celula: (casa) =>
      casa.operadores.length === 0 ? (
        <span className="text-foreground-muted">Ninguém vinculado</span>
      ) : (
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex shrink-0 -space-x-2">
            {casa.operadores.slice(0, ROSTOS).map((o) => (
              <Avatar
                key={o.usuarioId}
                nome={o.nome}
                tamanho="sm"
                className="ring-2 ring-surface"
              />
            ))}
            {casa.operadores.length > ROSTOS && (
              <span className="flex size-7 items-center justify-center rounded-full bg-surface-hover text-2xs font-bold text-foreground-muted ring-2 ring-surface">
                +{casa.operadores.length - ROSTOS}
              </span>
            )}
          </span>
          <span className="truncate text-foreground">
            {nomesDosOperadores(casa.operadores)}
          </span>
        </span>
      ),
    largura: 360,
  },
  {
    id: "situacao",
    titulo: "Situação",
    valor: (casa) => ROTULO_DA_SITUACAO[casa.status],
    celula: (casa) => (
      <SeloDeStatus intencao={casa.status === "com" ? "sucesso" : "atencao"}>
        {ROTULO_DA_SITUACAO[casa.status]}
      </SeloDeStatus>
    ),
    largura: 160,
  },
  {
    id: "abrir",
    titulo: "",
    valor: () => "",
    celula: (casa) => (
      <span className="flex items-center justify-end gap-1 text-xs font-bold text-primary">
        {casa.status === "sem" ? "Vincular" : "Gerenciar"}
        <ChevronRight aria-hidden="true" className="size-4" />
      </span>
    ),
    largura: 130,
  },
];

const idDaCasa = (casa: CasaDaLista) => casa.id;

/**
 * Os operadores do balcão de todas as casas, para muitas casas: busca por
 * casa, cidade ou pessoa, filtro pela situação (as sem operador primeiro na
 * atenção), a Tabela do design system e o balcão de cada casa numa janela,
 * onde se vincula e desvincula quem opera.
 */
export function BalcaoDasCasas({
  casas,
  situacaoInicial,
}: {
  casas: readonly CasaComOperadores[];
  situacaoInicial: SituacaoDoBalcao | typeof TODAS;
}) {
  const tela = useBalcaoDasCasas(casas, situacaoInicial);

  return (
    <>
      <GradeDeCadastro
        className="min-h-120"
        barra={
          <BarraDaGrade>
            <BuscaDaGrade
              valor={tela.busca}
              aoMudar={tela.mudarBusca}
              placeholder="Buscar por casa, cidade, operador ou e-mail..."
              rotulo="Buscar casas e operadores"
              className="max-md:w-full"
            />
            <ChipsDeFiltro rotulo="Situação do balcão" className="flex-wrap">
              <ChipDeFiltro
                ativo={tela.situacao === TODAS}
                aoEscolher={() => tela.mudarSituacao(TODAS)}
              >
                Todas ({tela.contagem[TODAS]})
              </ChipDeFiltro>
              {SITUACOES_DO_BALCAO.map((s) => (
                <ChipDeFiltro
                  key={s}
                  ativo={tela.situacao === s}
                  aoEscolher={() => tela.mudarSituacao(s)}
                >
                  {ROTULO_DA_SITUACAO[s]} ({tela.contagem[s]})
                </ChipDeFiltro>
              ))}
            </ChipsDeFiltro>
          </BarraDaGrade>
        }
        rodape={
          <RodapeDaGrade
            resumo={
              <span aria-live="polite">
                {tela.linhas.length === tela.total
                  ? `${tela.total} casas`
                  : `Mostrando ${tela.linhas.length} de ${tela.total} casas`}
                {tela.atualizando && " · atualizando…"}
              </span>
            }
          />
        }
      >
        <Tabela
          rotulo="Operadores do balcão por casa"
          colunas={COLUNAS}
          linhas={tela.linhas}
          idDaLinha={idDaCasa}
          aoAbrirLinha={tela.abrirCasa}
          alturaDaLinha={64}
          semRodape
          vazio={
            tela.total === 0
              ? "Nenhuma casa cadastrada."
              : "Nenhuma casa com esses filtros."
          }
          className={tela.atualizando ? "flex-1 opacity-70" : "flex-1"}
        />
      </GradeDeCadastro>

      <Dialogo
        aberto={Boolean(tela.casaAberta)}
        aoFechar={tela.fecharCasa}
        titulo={tela.casaAberta?.nome ?? ""}
        descricao={
          tela.casaAberta &&
          `${tela.casaAberta.cidade} · quem valida o código de resgate no balcão.`
        }
        variante="destaque"
        icone={<Store />}
      >
        {tela.casaAberta && <BalcaoDaCasa casa={tela.casaAberta} />}
      </Dialogo>
    </>
  );
}
