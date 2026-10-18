"use client";

import {
  Aba,
  Abas,
  Alerta,
  AreaDeTexto,
  BarraDoFormulario,
  Botao,
  CaixaDeIcone,
  CampoDeTexto,
  CorpoDoFormulario,
  DialogoDeConfirmacao,
  GradeDeCampos,
  ListaDeAbas,
  PainelDaAba,
  RodapeDoFormulario,
  Select,
  SeletorDePeriodo,
  SeloDeStatus,
  Tecla,
} from "@achados/ui";
import { BadgePercent, Gift, ListChecks, Send, Tag } from "lucide-react";

import { usePodeEscrever } from "@/shared/sessao/equipe-provider";
import {
  PERIODO_DE_USO,
  regraDeUso,
  STATUS_DA_PROMOCAO,
  TIPO_DA_PROMOCAO,
} from "../domain/apresentacao";
import type {
  PeriodoDeUso,
  Promocao,
  StatusDaPromocao,
  TipoDaPromocao,
} from "../domain/tipos";
import { SITUACOES_EDITAVEIS, type SecaoDaPromocao } from "../domain/validacao";
import { useFormularioDaPromocao } from "../hooks/use-formulario-da-promocao";

const TIPOS = Object.entries(TIPO_DA_PROMOCAO).map(([valor, label]) => ({
  valor: valor as TipoDaPromocao,
  label,
}));
const PERIODOS = Object.entries(PERIODO_DE_USO).map(([valor, label]) => ({
  valor: valor as PeriodoDeUso,
  label,
}));
const DESCRICAO_DA_SITUACAO: Record<StatusDaPromocao, string> = {
  draft: "Só a equipe vê.",
  pending_review: "Aguardando a conferência das condições.",
  active: "Aparece para os assinantes e pode ser resgatada.",
  paused: "Some do app sem perder as condições.",
  expired: "Terminou a vigência.",
  archived: "Fora do app; fica no histórico.",
};

/**
 * O formulário da promoção em seções: a oferta, as regras de uso e a
 * publicação. Ao lado, a prévia do cartão como o assinante vai ver. Só
 * marcação: o estado e as regras estão no hook.
 */
export function FormularioDaPromocao({
  promocao,
  ativo,
  aoConcluir,
}: {
  promocao: Promocao | null;
  ativo: boolean;
  aoConcluir: () => void;
}) {
  const podeSalvar = usePodeEscrever("promocoes");
  const f = useFormularioDaPromocao({ promocao, ativo, aoConcluir });
  const status = STATUS_DA_PROMOCAO[f.dados.status];
  const casa = f.casas.find((c) => c.id === f.dados.casaId);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <BarraDoFormulario
        aoVoltar={f.voltar}
        rotuloDeVoltar="Voltar para as promoções"
        titulo={f.novo ? "Nova promoção" : `Editando: ${f.titulo}`}
      >
        <SeloDeStatus intencao={status.intencao}>{status.rotulo}</SeloDeStatus>
      </BarraDoFormulario>

      <div className="flex min-h-0 flex-1 max-xl:flex-col">
        <Abas<SecaoDaPromocao>
          valor={f.secao}
          aoMudar={f.mudarSecao}
          variante="formulario"
          manterEstado
          className="flex min-h-0 min-w-0 flex-1 flex-col"
        >
          <ListaDeAbas rotulo="Seções da promoção" className="overflow-x-auto">
            <Aba
              valor="oferta"
              icone={<Tag className="size-4" />}
              contador={f.contagem.oferta}
            >
              Oferta
            </Aba>
            <Aba
              valor="regras"
              icone={<ListChecks className="size-4" />}
              contador={f.contagem.regras}
            >
              Regras de uso
            </Aba>
            <Aba
              valor="publicacao"
              icone={<Send className="size-4" />}
              contador={f.contagem.publicacao}
            >
              Publicação
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

            <PainelDaAba valor="oferta">
              <GradeDeCampos className="max-md:grid-cols-1">
                <Select
                  label="Casa"
                  opcoes={f.casas.map((c) => ({
                    valor: c.id,
                    label: c.nome,
                    descricao: c.publicada ? "Publicada" : "Rascunho",
                  }))}
                  valor={f.dados.casaId || null}
                  aoMudar={(id) => f.mudar("casaId", id)}
                  erro={f.erroDe("casaId")}
                  pesquisavel
                  required
                />
                <Select
                  label="Tipo"
                  opcoes={TIPOS}
                  valor={f.dados.tipo}
                  aoMudar={f.mudarTipo}
                />
                <CampoDeTexto
                  label="Título"
                  valor={f.dados.titulo}
                  aoMudar={(v) => f.mudar("titulo", v)}
                  erro={f.erroDe("titulo")}
                  placeholder="Sobremesa da casa no almoço"
                  tamanhoMaximo={80}
                  className="col-span-full"
                  required
                />
              </GradeDeCampos>
            </PainelDaAba>

            <PainelDaAba valor="regras">
              <GradeDeCampos className="max-md:grid-cols-1">
                <Select
                  label="Período do limite"
                  opcoes={PERIODOS}
                  valor={f.dados.periodoDeUso}
                  aoMudar={(p) => f.mudar("periodoDeUso", p)}
                />
                <CampoDeTexto
                  label="Usos por assinante no período"
                  modoDeEntrada="numeric"
                  valor={String(f.dados.limitePorAssinante)}
                  aoMudar={(v) =>
                    f.mudar(
                      "limitePorAssinante",
                      Number(v.replace(/\D/g, "")) || 0
                    )
                  }
                  erro={f.erroDe("limitePorAssinante")}
                  desabilitado={f.dados.periodoDeUso === "unlimited"}
                  ajuda={regraDeUso(
                    f.dados.limitePorAssinante,
                    f.dados.periodoDeUso
                  )}
                  tamanhoMaximo={2}
                />
                <SeletorDePeriodo
                  labelInicio="Vale a partir de"
                  labelFim="Vale até"
                  valor={f.dados.vigencia}
                  aoMudar={(periodo) => f.mudar("vigencia", periodo)}
                  erro={f.erroDe("vigencia")}
                  ajuda="Sem datas, vale enquanto estiver ativa."
                  className="col-span-full"
                />
                <AreaDeTexto
                  label="Condições de uso"
                  valor={f.dados.termos}
                  aoMudar={(v) => f.mudar("termos", v)}
                  erro={f.erroDe("termos")}
                  tamanhoMaximo={600}
                  linhas={5}
                  ajuda="Mostradas antes do resgate: dias, horários, o que não vale."
                  className="col-span-full"
                  required
                />
              </GradeDeCampos>
            </PainelDaAba>

            <PainelDaAba valor="publicacao">
              <div className="flex flex-col gap-5 px-7 py-6">
                <fieldset className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                  <legend className="mb-3 text-sm font-bold text-foreground">
                    Situação da promoção
                  </legend>
                  {SITUACOES_EDITAVEIS.map((s) => (
                    <label
                      key={s}
                      className="flex cursor-pointer flex-col gap-1 rounded-card border border-border bg-surface p-4 transition-colors hover:border-border-strong has-checked:border-primary has-checked:bg-primary-subtle has-focus-visible:ring-2 has-focus-visible:ring-ring"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="situacao-da-promocao"
                          value={s}
                          checked={f.dados.status === s}
                          onChange={() => f.mudar("status", s)}
                          className="size-4 accent-(--ar-primary-solid)"
                        />
                        <span className="font-bold text-foreground">
                          {STATUS_DA_PROMOCAO[s].rotulo}
                        </span>
                      </span>
                      <span className="text-sm text-foreground-muted">
                        {DESCRICAO_DA_SITUACAO[s]}
                      </span>
                    </label>
                  ))}
                </fieldset>
                {f.erroDe("status") && (
                  <Alerta intencao="atencao">{f.erroDe("status")}</Alerta>
                )}
                {!f.casaPublicada && (
                  <Alerta intencao="info">
                    A casa escolhida ainda é rascunho: a promoção só pode ficar
                    ativa depois que a casa for publicada.
                  </Alerta>
                )}
              </div>
            </PainelDaAba>
          </CorpoDoFormulario>
        </Abas>

        <aside
          aria-label="Prévia do cartão no app"
          className="w-88 shrink-0 border-l border-border bg-surface-hover p-6 max-xl:w-full max-xl:border-t max-xl:border-l-0"
        >
          <p className="mb-3 text-xs font-bold tracking-[0.12em] text-foreground-subtle uppercase">
            Como o assinante vê
          </p>
          <div className="flex items-start gap-3 rounded-card border border-border bg-surface p-4 shadow-sm">
            <CaixaDeIcone tamanho="md">
              {f.dados.tipo === "discount" ? <BadgePercent /> : <Gift />}
            </CaixaDeIcone>
            <div className="min-w-0">
              <p className="font-bold text-foreground">
                {f.dados.titulo || "Título da promoção"}
              </p>
              <p className="text-sm text-foreground-muted">
                {casa?.nome ?? "Casa"}
              </p>
              <p className="mt-2 text-xs font-semibold text-primary">
                {regraDeUso(f.dados.limitePorAssinante, f.dados.periodoDeUso)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-foreground-muted">
            Prévia aproximada. Promoção não altera nota, selo nem posição da
            casa no catálogo.
          </p>
        </aside>
      </div>

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
            {f.novo ? "Incluir promoção" : "Salvar alterações"}
          </Botao>
        ) : (
          <span className="text-xs font-semibold text-foreground-muted">
            Só leitura: o seu papel não altera promoções.
          </span>
        )}
      </RodapeDoFormulario>

      <DialogoDeConfirmacao
        aberto={f.confirmandoSaida}
        aoCancelar={f.cancelarSaida}
        aoConfirmar={f.descartar}
        titulo="Descartar as alterações?"
        descricao="O que foi digitado nesta promoção ainda não foi salvo."
        rotuloDeConfirmar="Descartar"
        rotuloDeCancelar="Continuar editando"
        perigo
      />
    </div>
  );
}
