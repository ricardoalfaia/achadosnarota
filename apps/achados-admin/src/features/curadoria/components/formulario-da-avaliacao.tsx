"use client";

import {
  Aba,
  Abas,
  Alerta,
  AreaDeTexto,
  BarraDoFormulario,
  Botao,
  CampoDeTexto,
  CorpoDoFormulario,
  DialogoDeConfirmacao,
  Etiqueta,
  GradeDeCampos,
  ListaDeAbas,
  PainelDaAba,
  RodapeDoFormulario,
  Select,
  SeletorDeData,
  SeloDeStatus,
  Tecla,
} from "@achados/ui";
import { cn } from "@achados/ui/estilos";
import { Award, ClipboardList, NotebookPen, Star } from "lucide-react";

import { usePodeEscrever } from "@/shared/sessao/equipe-provider";
import { SELO_EDITORIAL, STATUS_DA_AVALIACAO } from "../domain/apresentacao";
import { CRITERIOS_DA_CURADORIA, lerNota } from "../domain/criterios";
import type { Avaliacao, SeloEditorial } from "../domain/tipos";
import {
  SITUACOES_DA_EQUIPE,
  type SecaoDaAvaliacao,
} from "../domain/validacao";
import { useFormularioDaAvaliacao } from "../hooks/use-formulario-da-avaliacao";

const SEM_SELO = "sem-selo";
const OPCOES_DE_SELO = [
  { valor: SEM_SELO, label: "Sem selo" },
  ...Object.entries(SELO_EDITORIAL).map(([valor, selo]) => ({
    valor,
    label: selo.rotulo,
    descricao: selo.descricao,
  })),
];

/**
 * O formulário da avaliação editorial em seções: a visita, as notas por
 * critério (com a média e o selo calculados ao vivo) e o parecer. Só
 * marcação: o estado e as regras estão no hook.
 */
export function FormularioDaAvaliacao({
  avaliacao,
  ativo,
  aoConcluir,
}: {
  avaliacao: Avaliacao | null;
  ativo: boolean;
  aoConcluir: () => void;
}) {
  const podeSalvar = usePodeEscrever("curadoria");
  const f = useFormularioDaAvaliacao({ avaliacao, ativo, aoConcluir });
  const status = STATUS_DA_AVALIACAO[f.dados.status];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <BarraDoFormulario
        aoVoltar={f.voltar}
        rotuloDeVoltar="Voltar para a curadoria"
        titulo={f.novo ? "Nova avaliação" : `Avaliação: ${f.titulo}`}
      >
        <SeloDeStatus intencao={status.intencao}>{status.rotulo}</SeloDeStatus>
      </BarraDoFormulario>

      <Abas<SecaoDaAvaliacao>
        valor={f.secao}
        aoMudar={f.mudarSecao}
        variante="formulario"
        manterEstado
        className="flex min-h-0 flex-1 flex-col"
      >
        <ListaDeAbas rotulo="Seções da avaliação" className="overflow-x-auto">
          <Aba
            valor="visita"
            icone={<ClipboardList className="size-4" />}
            contador={f.contagem.visita}
          >
            Visita
          </Aba>
          <Aba
            valor="notas"
            icone={<Star className="size-4" />}
            contador={f.contagem.notas}
          >
            Notas
          </Aba>
          <Aba
            valor="parecer"
            icone={<NotebookPen className="size-4" />}
            contador={f.contagem.parecer}
          >
            Parecer
          </Aba>
        </ListaDeAbas>

        <CorpoDoFormulario>
          {f.falha && (
            <Alerta
              intencao="erro"
              titulo="Não foi possível salvar"
              className="mx-7 mt-5"
            >
              {f.falha}
            </Alerta>
          )}

          <PainelDaAba valor="visita">
            <GradeDeCampos className="max-md:grid-cols-1">
              <Select
                label="Casa visitada"
                opcoes={f.casas.map((c) => ({ valor: c.id, label: c.nome }))}
                valor={f.dados.casaId || null}
                aoMudar={(id) => f.mudar("casaId", id)}
                erro={f.erroDe("casaId")}
                pesquisavel
                required
              />
              <SeletorDeData
                label="Data da visita"
                valor={f.dados.visitadaEm || null}
                aoMudar={(data) => f.mudar("visitadaEm", data ?? "")}
                erro={f.erroDe("visitadaEm")}
                max={f.hoje}
                hoje={f.hoje}
                required
              />
              <Select
                label="Situação"
                opcoes={SITUACOES_DA_EQUIPE.map((s) => ({
                  valor: s,
                  label: STATUS_DA_AVALIACAO[s].rotulo,
                }))}
                valor={f.dados.status}
                aoMudar={(s) => f.mudar("status", s)}
                erro={f.erroDe("status")}
                ajuda="Publicar substitui a avaliação publicada antes nesta casa."
              />
            </GradeDeCampos>
          </PainelDaAba>

          <PainelDaAba valor="notas">
            <div className="grid gap-6 px-7 py-6 xl:grid-cols-[1fr_20rem]">
              <div className="flex flex-col gap-3">
                {f.erroDe("notas") && (
                  <Alerta intencao="atencao">{f.erroDe("notas")}</Alerta>
                )}
                <ul className="grid gap-3 md:grid-cols-2">
                  {CRITERIOS_DA_CURADORIA.map(({ chave, rotulo }) => {
                    const nota = lerNota(f.dados.notas[chave]);
                    return (
                      <li key={chave} className="flex flex-col gap-2">
                        <CampoDeTexto
                          label={rotulo}
                          modoDeEntrada="decimal"
                          valor={f.dados.notas[chave]}
                          aoMudar={(texto) => f.mudarNota(chave, texto)}
                          erro={f.erroDe(`nota.${chave}`)}
                          placeholder="Não se aplica"
                          sufixo="/ 5"
                          tamanhoMaximo={3}
                          tamanho="md"
                        />
                        <span
                          aria-hidden="true"
                          className="h-1.5 overflow-hidden rounded-full bg-surface-hover"
                        >
                          <span
                            className="block h-full rounded-full bg-brand-gradient transition-[width] duration-300 ease-smooth"
                            style={{ width: `${((nota ?? 0) / 5) * 100}%` }}
                          />
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <p className="text-sm text-foreground-muted">
                  Deixe em branco o que não se aplica à casa (pousada sem
                  apresentação do prato): o critério sai da média.
                </p>
              </div>

              <aside
                aria-label="Resultado da avaliação"
                className="flex flex-col gap-4 self-start rounded-card border border-border bg-surface-hover p-5"
              >
                <div>
                  <p className="text-xs font-bold tracking-[0.12em] text-foreground-subtle uppercase">
                    Nota da casa
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold tracking-tight text-foreground tabular-nums">
                      {f.media === undefined
                        ? "—"
                        : f.media.toFixed(1).replace(".", ",")}
                    </span>
                  </div>
                  <p className="text-sm text-foreground-muted">
                    Média de {f.criteriosAvaliados} critérios avaliados
                  </p>
                </div>
                <div
                  className={cn(
                    "flex items-start gap-3 rounded-control border p-3",
                    f.ganhaOSelo
                      ? "border-success-border bg-success-subtle text-success"
                      : "border-border bg-surface text-foreground-muted"
                  )}
                >
                  <Award
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0"
                  />
                  <p className="text-sm">
                    <strong className="block font-bold">
                      {f.ganhaOSelo
                        ? "Ganha o Selo Achados na Rota"
                        : "Ainda sem o Selo Achados na Rota"}
                    </strong>
                    Média 4,5 ou mais, nenhum critério abaixo de 4 e pelo menos
                    quatro critérios avaliados.
                  </p>
                </div>
                <Select
                  label="Selo sobre a foto"
                  opcoes={OPCOES_DE_SELO}
                  valor={f.dados.selo ?? SEM_SELO}
                  aoMudar={(valor) =>
                    f.mudar(
                      "selo",
                      valor === SEM_SELO ? null : (valor as SeloEditorial)
                    )
                  }
                  tamanho="md"
                />
                {f.dados.selo && (
                  <Etiqueta
                    tom={SELO_EDITORIAL[f.dados.selo].tom}
                    className="self-start"
                  >
                    {SELO_EDITORIAL[f.dados.selo].rotulo}
                  </Etiqueta>
                )}
              </aside>
            </div>
          </PainelDaAba>

          <PainelDaAba valor="parecer">
            <GradeDeCampos className="grid-cols-1">
              <AreaDeTexto
                label="Parecer"
                valor={f.dados.parecer}
                aoMudar={(v) => f.mudar("parecer", v)}
                erro={f.erroDe("parecer")}
                tamanhoMaximo={1200}
                linhas={6}
                ajuda="Em linguagem de leitor: o que a casa tem de bom e para quem."
                required
              />
              <CampoDeTexto
                label="Achado imperdível"
                valor={f.dados.achado}
                aoMudar={(v) => f.mudar("achado", v)}
                placeholder="O prato ou a experiência que não pode faltar"
                tamanhoMaximo={120}
              />
              <AreaDeTexto
                label="Ressalvas"
                valor={f.dados.ressalvas}
                aoMudar={(v) => f.mudar("ressalvas", v)}
                linhas={3}
                ajuda="O que o leitor deve saber antes de ir."
              />
              <AreaDeTexto
                label="Dicas da curadoria"
                valor={f.dados.dicas}
                aoMudar={(v) => f.mudar("dicas", v)}
                linhas={4}
                ajuda="Uma dica por linha, na ordem em que aparecem na ficha."
              />
            </GradeDeCampos>
          </PainelDaAba>
        </CorpoDoFormulario>
      </Abas>

      <RodapeDoFormulario
        dica={
          <>
            Use <Tecla>Ctrl</Tecla> + <Tecla>S</Tecla> para salvar
          </>
        }
      >
        <Botao
          variante="fantasma"
          tamanho="xs"
          onClick={f.voltar}
          desabilitado={f.salvando}
        >
          Cancelar
        </Botao>
        {podeSalvar ? (
          <Botao tamanho="xs" onClick={f.salvar} carregando={f.salvando}>
            {f.novo ? "Incluir avaliação" : "Salvar alterações"}
          </Botao>
        ) : (
          <span className="text-xs font-semibold text-foreground-muted">
            Só leitura: o seu papel não altera a curadoria.
          </span>
        )}
      </RodapeDoFormulario>

      <DialogoDeConfirmacao
        aberto={f.confirmandoSaida}
        aoCancelar={f.cancelarSaida}
        aoConfirmar={f.descartar}
        titulo="Descartar as alterações?"
        descricao="O que foi digitado nesta avaliação ainda não foi salvo."
        rotuloDeConfirmar="Descartar"
        rotuloDeCancelar="Continuar editando"
        perigo
      />
    </div>
  );
}
