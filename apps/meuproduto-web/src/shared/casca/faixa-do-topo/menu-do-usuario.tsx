"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  Avatar,
  CaixaSuspensa,
  SeletorDeIdioma,
  SeletorDeTema,
} from "@meuproduto/ui";
import { cn } from "@meuproduto/ui/estilos";
import { useFecharAoSair, usePresenca } from "@meuproduto/ui/hooks";
import { ChevronDown, LogOut, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  NotasDeVersao,
  notasDeVersaoProvisorias,
} from "@/features/notas-de-versao";
import { CODIGO_DO_IDIOMA, IDIOMAS } from "@/shared/preferencias/preferencias";
import { usePreferencias } from "@/shared/preferencias/preferencias-provider";
import { sair } from "@/shared/sessao/sair";
import type { Sessao } from "@/shared/sessao/sessao";

const ITEM =
  "flex w-full cursor-pointer items-center justify-between gap-2 rounded-control px-2.5 py-2 text-left text-sm font-semibold text-foreground transition-colors duration-150 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-ring [&_svg]:size-4 [&_svg]:shrink-0";

const TITULO_DA_SECAO =
  "mb-1.5 text-xs font-bold tracking-wide text-foreground-muted uppercase";

/**
 * O avatar da faixa do topo e o menu que ele abre: quem está logado, as
 * preferências (tema e idioma) e as ações da conta (notas de versão e sair).
 * Fecha com clique fora ou Esc, e o foco volta ao avatar.
 */
export function MenuDoUsuario({ sessao }: { sessao: Sessao }) {
  const t = useTranslations("MenuDoUsuario");
  const tTema = useTranslations("Tema");
  const tIdiomas = useTranslations("Idiomas");
  const { preferencias, mudar, trocandoDeIdioma } = usePreferencias();
  const [aberto, setAberto] = useState(false);
  const [notasAbertas, setNotasAbertas] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const gatilho = useRef<HTMLButtonElement>(null);
  const presenca = usePresenca(aberto);

  useFecharAoSair(raiz, aberto, () => setAberto(false), gatilho);

  function abrirNotas() {
    setAberto(false);
    setNotasAbertas(true);
  }

  return (
    <div ref={raiz} className="relative">
      <button
        ref={gatilho}
        type="button"
        aria-expanded={aberto}
        aria-haspopup="dialog"
        aria-label={t("abrir", { nome: sessao.nome })}
        onClick={() => setAberto((v) => !v)}
        className="flex cursor-pointer items-center gap-1.5 rounded-full p-0.5 pr-1.5 text-foreground-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        <Avatar nome={sessao.nome} fotoUrl={sessao.fotoUrl} />
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-4 transition-transform duration-200",
            aberto && "rotate-180"
          )}
        />
      </button>

      {presenca.montado && (
        <CaixaSuspensa
          saindo={presenca.saindo}
          role="dialog"
          aria-label={t("rotulo")}
          className="right-0 left-auto flex w-72 flex-col gap-3 p-3"
        >
          <div className="flex items-center gap-3 border-b border-border px-1 pb-3">
            <Avatar nome={sessao.nome} fotoUrl={sessao.fotoUrl} tamanho="lg" />
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-base font-bold text-foreground">
                {sessao.nome}
              </span>
              <span className="truncate text-sm text-foreground-muted">
                {sessao.email}
              </span>
              {sessao.organizacao.nome && (
                <span className="mt-0.5 w-fit max-w-full truncate rounded bg-primary-subtle px-1.5 py-px text-xs font-semibold text-primary">
                  {sessao.organizacao.nome}
                </span>
              )}
            </div>
          </div>

          <div className="px-1">
            <div className={TITULO_DA_SECAO}>{t("tema")}</div>
            <SeletorDeTema
              valor={preferencias.tema}
              aoMudar={(tema) => mudar("tema", tema)}
              rotulo={t("tema")}
              rotulos={{
                light: tTema("light"),
                dark: tTema("dark"),
                auto: tTema("auto"),
              }}
            />
          </div>

          <div className="px-1">
            <div className={TITULO_DA_SECAO}>{t("idioma")}</div>
            <SeletorDeIdioma
              opcoes={IDIOMAS.map((idioma) => ({
                valor: idioma,
                nome: tIdiomas(idioma),
                codigo: CODIGO_DO_IDIOMA[idioma],
              }))}
              valor={preferencias.idioma}
              aoMudar={(idioma) => mudar("idioma", idioma)}
              rotulo={t("idioma")}
              ocupado={trocandoDeIdioma}
            />
          </div>

          <div className="flex flex-col gap-0.5 border-t border-border pt-2">
            <button type="button" onClick={abrirNotas} className={ITEM}>
              <Lado icone={<Sparkles aria-hidden="true" />}>
                {t("notasDeVersao")}
              </Lado>
              <span className="rounded bg-primary-subtle px-1.5 py-px font-mono text-xs font-bold text-primary">
                {t("versao", { versao: notasDeVersaoProvisorias.versaoCurta })}
              </span>
            </button>
            <form action={sair}>
              <button
                type="submit"
                className={cn(ITEM, "text-danger hover:bg-danger-subtle")}
              >
                <Lado icone={<LogOut aria-hidden="true" />}>{t("sair")}</Lado>
              </button>
            </form>
          </div>
        </CaixaSuspensa>
      )}

      <NotasDeVersao
        aberto={notasAbertas}
        aoFechar={() => setNotasAbertas(false)}
      />
    </div>
  );
}

function Lado({ icone, children }: { icone: ReactNode; children: ReactNode }) {
  return (
    <span className="flex items-center gap-2.5">
      {icone}
      <span>{children}</span>
    </span>
  );
}
