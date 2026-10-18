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
  GradeDeCampos,
  ListaDeAbas,
  PainelDaAba,
  RodapeDoFormulario,
  Select,
  SeloDeStatus,
  Tecla,
  ZonaDeArquivo,
} from "@achados/ui";
import { Camera, ImageIcon, Info, MapPin, Send, Store } from "lucide-react";

import { usePodeEscrever } from "@/shared/sessao/equipe-provider";
import { STATUS_DA_CASA } from "../domain/apresentacao";
import type { Casa, StatusDaCasa } from "../domain/tipos";
import type { SecaoDaCasa } from "../domain/validacao";
import { useFormularioDaCasa } from "../hooks/use-formulario-da-casa";

const SITUACOES: { valor: StatusDaCasa; label: string; descricao: string }[] = [
  {
    valor: "draft",
    label: "Rascunho",
    descricao: "Só a equipe vê. Bom para preparar antes da visita.",
  },
  {
    valor: "published",
    label: "Publicada",
    descricao: "Aparece no app e no site, com a ficha pública.",
  },
  {
    valor: "archived",
    label: "Arquivada",
    descricao: "Sai do app; o histórico continua no painel.",
  },
];

/**
 * O formulário da casa em seções (ADR-0021): dados, endereço e contato, fotos
 * e publicação. Só marcação: o estado e as regras estão no hook. As abas
 * mantêm o estado com `Activity` (ADR-0016): voltar a uma seção encontra o
 * que foi digitado.
 */
export function FormularioDaCasa({
  casa,
  ativo,
  aoConcluir,
}: {
  casa: Casa | null;
  ativo: boolean;
  aoConcluir: () => void;
}) {
  const podeSalvar = usePodeEscrever("casas");
  const f = useFormularioDaCasa({ casa, ativo, aoConcluir });
  const status = STATUS_DA_CASA[f.dados.status];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <BarraDoFormulario
        aoVoltar={f.voltar}
        rotuloDeVoltar="Voltar para as casas"
        titulo={f.novo ? "Nova casa" : `Editando: ${f.titulo}`}
      >
        <SeloDeStatus intencao={status.intencao}>{status.rotulo}</SeloDeStatus>
      </BarraDoFormulario>

      <Abas<SecaoDaCasa>
        valor={f.secao}
        aoMudar={f.mudarSecao}
        variante="formulario"
        manterEstado
        className="flex min-h-0 flex-1 flex-col"
      >
        <ListaDeAbas rotulo="Seções da casa" className="overflow-x-auto">
          <Aba
            valor="dados"
            icone={<Store className="size-4" />}
            contador={f.contagem.dados}
          >
            Dados
          </Aba>
          <Aba
            valor="local"
            icone={<MapPin className="size-4" />}
            contador={f.contagem.local}
          >
            Endereço e contato
          </Aba>
          <Aba
            valor="fotos"
            icone={<Camera className="size-4" />}
            contador={f.contagem.fotos}
          >
            Fotos
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

          <PainelDaAba valor="dados">
            <GradeDeCampos className="max-md:grid-cols-1">
              <CampoDeTexto
                label="Nome da casa"
                valor={f.dados.nome}
                aoMudar={f.mudarNome}
                erro={f.erroDe("nome")}
                tamanhoMaximo={80}
                required
              />
              <CampoDeTexto
                label="Endereço da ficha"
                valor={f.dados.slug}
                aoMudar={(slug) => f.mudar("slug", slug)}
                erro={f.erroDe("slug")}
                prefixo="/lugar/"
                ajuda="Gerado pelo nome; muda o link público."
                required
              />
              <Select
                label="Categoria"
                opcoes={f.opcoes.categorias.map((c) => ({
                  valor: c.id,
                  label: c.nome,
                }))}
                valor={f.dados.categoriaId || null}
                aoMudar={(id) => f.mudar("categoriaId", id)}
                erro={f.erroDe("categoriaId")}
                required
              />
              <CampoDeTexto
                label="Especialidade"
                valor={f.dados.especialidade}
                aoMudar={(v) => f.mudar("especialidade", v)}
                erro={f.erroDe("especialidade")}
                placeholder="Culinária Caipira"
                tamanhoMaximo={60}
                required
              />
              <AreaDeTexto
                label="Resumo do cartão"
                valor={f.dados.resumo}
                aoMudar={(v) => f.mudar("resumo", v)}
                erro={f.erroDe("resumo")}
                tamanhoMaximo={200}
                linhas={3}
                ajuda="Uma ou duas frases: aparecem no cartão e no topo da ficha."
                className="col-span-full"
                required
              />
              <AreaDeTexto
                label="Sobre a casa"
                valor={f.dados.descricao}
                aoMudar={(v) => f.mudar("descricao", v)}
                linhas={6}
                ajuda="Texto da aba Sobre da ficha."
                className="col-span-full"
              />
              <CampoDeTexto
                label="Tags"
                valor={f.textoDasTags}
                aoMudar={f.mudarTags}
                placeholder="Fogão a lenha, Família, Almoço"
                ajuda="Separadas por vírgula, até 12."
                className="col-span-full"
              />
            </GradeDeCampos>
          </PainelDaAba>

          <PainelDaAba valor="local">
            <GradeDeCampos className="max-md:grid-cols-1">
              <Select
                label="Cidade"
                opcoes={f.opcoes.cidades.map((c) => ({
                  valor: c.id,
                  label: `${c.nome} · ${c.uf}`,
                }))}
                valor={f.dados.cidadeId || null}
                aoMudar={(id) => f.mudar("cidadeId", id)}
                erro={f.erroDe("cidadeId")}
                pesquisavel
                required
              />
              <CampoDeTexto
                label="Endereço"
                valor={f.dados.endereco}
                aoMudar={(v) => f.mudar("endereco", v)}
                placeholder="Rua, número, bairro"
              />
              <CampoDeTexto
                label="Telefone"
                tipo="tel"
                modoDeEntrada="tel"
                valor={f.dados.telefone}
                aoMudar={(v) => f.mudar("telefone", v.replace(/\D/g, ""))}
                erro={f.erroDe("telefone")}
                ajuda="Com DDD, só números."
                tamanhoMaximo={13}
              />
              <CampoDeTexto
                label="Site ou Instagram"
                tipo="url"
                valor={f.dados.site}
                aoMudar={(v) => f.mudar("site", v)}
                erro={f.erroDe("site")}
                placeholder="https://"
              />
            </GradeDeCampos>
          </PainelDaAba>

          <PainelDaAba valor="fotos">
            <div className="flex flex-col gap-5 px-7 py-6">
              {f.erroDe("fotos") && (
                <Alerta intencao="atencao">{f.erroDe("fotos")}</Alerta>
              )}
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {f.fotos.map((foto, indice) => (
                  <li
                    key={foto.id}
                    className="group relative flex aspect-4/3 flex-col justify-end overflow-hidden rounded-card border border-border bg-linear-to-br from-primary-subtle via-surface-hover to-accent-subtle p-3"
                  >
                    <ImageIcon
                      aria-hidden="true"
                      className="absolute top-1/2 left-1/2 size-8 -translate-1/2 text-foreground-subtle"
                    />
                    {indice === 0 && (
                      <span className="absolute top-2 left-2 rounded-full bg-surface/90 px-2 py-0.5 text-2xs font-bold text-foreground">
                        Capa
                      </span>
                    )}
                    <span className="relative truncate text-xs font-semibold text-foreground">
                      {foto.alt}
                    </span>
                    <span className="relative truncate text-2xs text-foreground-muted">
                      {foto.origem}
                    </span>
                  </li>
                ))}
                {f.fotosEscolhidas.map((nome) => (
                  <li
                    key={nome}
                    className="flex aspect-4/3 flex-col items-center justify-center gap-1 rounded-card border border-dashed border-border-strong bg-surface p-3 text-center"
                  >
                    <ImageIcon
                      aria-hidden="true"
                      className="size-6 text-foreground-subtle"
                    />
                    <span className="w-full truncate text-xs font-semibold text-foreground">
                      {nome}
                    </span>
                    <span className="text-2xs text-warning">
                      Aguardando envio
                    </span>
                  </li>
                ))}
              </ul>
              <ZonaDeArquivo
                rotulo="Adicionar fotos da casa"
                descricao="JPG, PNG ou WebP de até 8 MB. A primeira foto é a capa."
                aceitar={["image/jpeg", "image/png", "image/webp"]}
                tamanhoMaximoEmBytes={8 * 1024 * 1024}
                multiplo
                aoEscolher={f.escolherFotos}
              />
              <p className="flex items-start gap-2 text-sm text-foreground-muted">
                <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />O
                envio para o armazenamento, com origem e licença de cada foto,
                entra na próxima fase. Por enquanto as fotos escolhidas não são
                gravadas.
              </p>
            </div>
          </PainelDaAba>

          <PainelDaAba valor="publicacao">
            <div className="flex flex-col gap-5 px-7 py-6">
              <fieldset className="grid gap-3 md:grid-cols-3">
                <legend className="mb-3 text-sm font-bold text-foreground">
                  Situação da casa
                </legend>
                {SITUACOES.map((s) => (
                  <label
                    key={s.valor}
                    className="flex cursor-pointer flex-col gap-1 rounded-card border border-border bg-surface p-4 transition-colors hover:border-border-strong has-checked:border-primary has-checked:bg-primary-subtle has-focus-visible:ring-2 has-focus-visible:ring-ring"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="situacao-da-casa"
                        value={s.valor}
                        checked={f.dados.status === s.valor}
                        onChange={() => f.mudar("status", s.valor)}
                        className="size-4 accent-(--ar-primary-solid)"
                      />
                      <span className="font-bold text-foreground">
                        {s.label}
                      </span>
                    </span>
                    <span className="text-sm text-foreground-muted">
                      {s.descricao}
                    </span>
                  </label>
                ))}
              </fieldset>
              <Alerta intencao="info" titulo="Nota e selo são da curadoria">
                A avaliação, as notas por critério e o selo são decididos na
                Curadoria, nunca aqui nem pelo parceiro (ADR-004).
              </Alerta>
            </div>
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
            {f.novo ? "Incluir casa" : "Salvar alterações"}
          </Botao>
        ) : (
          <span className="text-xs font-semibold text-foreground-muted">
            Só leitura: o seu papel não altera casas.
          </span>
        )}
      </RodapeDoFormulario>

      <DialogoDeConfirmacao
        aberto={f.confirmandoSaida}
        aoCancelar={f.cancelarSaida}
        aoConfirmar={f.descartar}
        titulo="Descartar as alterações?"
        descricao="O que foi digitado nesta casa ainda não foi salvo."
        rotuloDeConfirmar="Descartar"
        rotuloDeCancelar="Continuar editando"
        perigo
      />
    </div>
  );
}
