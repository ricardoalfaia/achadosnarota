"use client";

import { useRef, useState, type ReactNode, type Ref } from "react";
import { CaixaSuspensa } from "@meuproduto/ui";
import { cn } from "@meuproduto/ui/estilos";
import { useFecharAoSair, usePresenca } from "@meuproduto/ui/hooks";
import {
  CircleCheck,
  Info,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import {
  agruparNotificacoes,
  filtrarNotificacoes,
  marcarComoLida,
  marcarTodasComoLidas,
  naoLidas,
  NOTIFICACOES_PROVISORIAS,
  type FiltroDeNotificacoes,
  type Notificacao,
  type TipoDeNotificacao,
} from "../domain/notificacoes";

const FILTROS: readonly FiltroDeNotificacoes[] = [
  "todas",
  "naoLidas",
  "assinaturas",
];

const TIPO: Record<TipoDeNotificacao, { icone: LucideIcon; cor: string }> = {
  sucesso: { icone: CircleCheck, cor: "bg-success-subtle text-success" },
  aviso: { icone: TriangleAlert, cor: "bg-warning-subtle text-warning" },
  info: { icone: Info, cor: "bg-primary-subtle text-primary" },
};

/** O que o botão que abre o painel precisa saber e fazer. */
export type GatilhoDasNotificacoes = {
  ref: Ref<HTMLButtonElement>;
  aberto: boolean;
  /** Notificações não lidas, para o contador. */
  pendentes: number;
  aoAlternar: () => void;
};

/**
 * O painel de notificações, com abas e grupos. O botão que o abre (o sino da
 * faixa) é da casca e entra por `gatilho`, com o estado que precisa mostrar.
 */
export function PainelDeNotificacoes({
  gatilho,
}: {
  gatilho: (estado: GatilhoDasNotificacoes) => ReactNode;
}) {
  const t = useTranslations("Notificacoes");
  const [notificacoes, setNotificacoes] = useState(NOTIFICACOES_PROVISORIAS);
  const [filtro, setFiltro] = useState<FiltroDeNotificacoes>("todas");
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);
  const presenca = usePresenca(aberto);

  useFecharAoSair(raiz, aberto, () => setAberto(false), botao);

  const pendentes = naoLidas(notificacoes);
  const grupos = agruparNotificacoes(filtrarNotificacoes(notificacoes, filtro));
  const contagem: Record<FiltroDeNotificacoes, number | null> = {
    todas: notificacoes.length,
    naoLidas: pendentes,
    assinaturas: null,
  };

  return (
    <div ref={raiz} className="relative">
      {gatilho({
        ref: botao,
        aberto,
        pendentes,
        aoAlternar: () => setAberto((v) => !v),
      })}

      {presenca.montado && (
        <CaixaSuspensa
          saindo={presenca.saindo}
          role="dialog"
          aria-label={t("titulo")}
          className="right-0 left-auto flex max-h-[min(560px,calc(100vh-90px))] w-95 flex-col overflow-hidden p-0"
        >
          <div className="flex items-center justify-between px-4 pt-3.5">
            <h2 className="text-base font-bold text-foreground">
              {t("titulo")}
            </h2>
            <button
              type="button"
              onClick={() =>
                setNotificacoes((lista) => marcarTodasComoLidas(lista))
              }
              className="cursor-pointer text-sm font-semibold text-primary hover:underline"
            >
              {t("marcarTodas")}
            </button>
          </div>

          <div className="flex gap-1 border-b border-border px-3 pt-2.5">
            {FILTROS.map((opcao) => {
              const ativa = opcao === filtro;
              return (
                <button
                  key={opcao}
                  type="button"
                  aria-pressed={ativa}
                  onClick={() => setFiltro(opcao)}
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 border-b-2 border-transparent px-2 pt-1.5 pb-2 text-sm font-medium text-foreground-muted",
                    ativa && "border-primary font-bold text-foreground"
                  )}
                >
                  {t(`abas.${opcao}`)}
                  {contagem[opcao] !== null && (
                    <span
                      className={cn(
                        "rounded-full bg-surface-hover px-1.5 text-xs leading-4 font-bold text-foreground-muted",
                        ativa && "bg-primary-subtle text-primary"
                      )}
                    >
                      {contagem[opcao]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto py-1">
            {grupos.length === 0 ? (
              <div className="px-4 py-9 text-center text-sm text-foreground-muted">
                {t("vazio")}
              </div>
            ) : (
              grupos.map(({ grupo, itens }) => (
                <div key={grupo}>
                  <div className="px-4 pt-3 pb-1 text-xs font-bold tracking-wide text-foreground-muted uppercase">
                    {t(`grupos.${grupo}`)}
                  </div>
                  {itens.map((notificacao) => (
                    <Item
                      key={notificacao.id}
                      notificacao={notificacao}
                      aoAbrir={() =>
                        setNotificacoes((lista) =>
                          marcarComoLida(lista, notificacao.id)
                        )
                      }
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </CaixaSuspensa>
      )}
    </div>
  );
}

function Item({
  notificacao,
  aoAbrir,
}: {
  notificacao: Notificacao;
  aoAbrir: () => void;
}) {
  const t = useTranslations("Notificacoes");
  const { icone: Icone, cor } = TIPO[notificacao.tipo];

  return (
    <button
      type="button"
      onClick={aoAbrir}
      className={cn(
        "relative flex w-full cursor-pointer gap-3 px-4 py-2.5 text-left transition-colors duration-150 hover:bg-surface-hover",
        !notificacao.lida && "bg-primary-subtle/40"
      )}
    >
      <span
        className={cn(
          "flex size-8.5 shrink-0 items-center justify-center rounded-control",
          cor
        )}
      >
        <Icone aria-hidden="true" className="size-4.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block pr-3.5 text-sm leading-snug font-bold text-foreground">
          {t(`itens.${notificacao.id}.titulo`)}
        </span>
        <span className="mt-0.5 block text-sm leading-snug text-foreground-muted">
          {t(`itens.${notificacao.id}.texto`)}
        </span>
        <span className="mt-1 flex items-center gap-1.5 text-xs text-foreground-muted">
          <span className="font-semibold text-primary">
            {t(`modulos.${notificacao.modulo}`)}
          </span>
          <span aria-hidden="true">•</span>
          <span>{t(`itens.${notificacao.id}.quando`)}</span>
        </span>
      </span>
      {!notificacao.lida && (
        <span
          title={t("naoLida")}
          className="absolute top-3.5 right-4 size-2 rounded-full bg-primary"
        >
          <span className="sr-only">{t("naoLida")}</span>
        </span>
      )}
    </button>
  );
}
