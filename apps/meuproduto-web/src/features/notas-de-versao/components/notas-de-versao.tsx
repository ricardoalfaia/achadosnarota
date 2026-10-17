"use client";

import { Botao, Dialogo } from "@meuproduto/ui";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { notasDeVersaoProvisorias } from "../domain/notas-de-versao";

/** Notas de versão: o que chegou na versão atual. */
export function NotasDeVersao({
  aberto,
  aoFechar,
}: {
  aberto: boolean;
  aoFechar: () => void;
}) {
  const t = useTranslations("NotasDeVersao");
  const { atual } = notasDeVersaoProvisorias;

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={aoFechar}
      tamanho="lg"
      icone={<Sparkles />}
      titulo={t("titulo")}
      descricao={t("subtitulo")}
      rodape={
        <Botao tamanho="sm" onClick={aoFechar}>
          {t("entendido")}
        </Botao>
      }
    >
      <section className="flex flex-col gap-3 rounded-card border border-border bg-surface-hover p-4.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-base font-bold text-primary">
            {t("versao", { versao: atual.versao })}
          </span>
          <span className="font-mono text-sm text-foreground-muted">
            {atual.data}
          </span>
        </div>
        <ul className="flex flex-col gap-2 text-sm text-foreground">
          {atual.destaques.map((destaque) => (
            <li key={destaque} className="flex items-start gap-2">
              <span aria-hidden="true" className="font-bold text-primary">
                ✦
              </span>
              <span>
                <strong>{t(`destaques.${destaque}.titulo`)}</strong>{" "}
                {t(`destaques.${destaque}.texto`)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </Dialogo>
  );
}
