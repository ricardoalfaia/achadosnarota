"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { estiloDoBotao } from "@achados/ui/estilos";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import { ROTAS } from "@/shared/rotas";

const TELAS_DE_ACESSO = [ROTAS.entrar, ROTAS.criarConta];

/**
 * Sair das telas de acesso sem entrar nem criar conta. Quem chegou de uma
 * página do app volta para ela pelo histórico; quem abriu o link direto (ou
 * veio de outra tela de acesso) vai para o início. Sem JavaScript, é só o
 * link para o início.
 */
export function BotaoDeVoltar() {
  const t = useTranslations("Acesso.casca");
  const router = useRouter();

  function voltar(evento: MouseEvent<HTMLAnchorElement>) {
    if (!veioDoProprioApp()) return;
    evento.preventDefault();
    router.back();
  }

  return (
    <Link
      href={ROTAS.explorar}
      onClick={voltar}
      className={estiloDoBotao({
        variante: "suave",
        tamanho: "sm",
        className: "gap-1 pr-4 pl-2.5 [&_svg]:size-4",
      })}
    >
      <ChevronLeft aria-hidden="true" />
      {t("voltar")}
    </Link>
  );
}

/** A página anterior, se for do app e não for outra tela de acesso. */
function veioDoProprioApp(): boolean {
  const anterior = enderecoAnterior();
  if (!anterior) return false;
  try {
    const url = new URL(anterior);
    return (
      url.origin === window.location.origin &&
      !TELAS_DE_ACESSO.some((tela) => url.pathname.startsWith(tela))
    );
  } catch {
    return false;
  }
}

type Navegacao = {
  currentEntry: { index: number } | null;
  entries(): { url: string | null }[];
};

/**
 * A Navigation API conhece as entradas da mesma origem, inclusive as das
 * navegações internas do Next; sem ela, sobra o `referrer`, que só vale para
 * quem chegou carregando a página.
 */
function enderecoAnterior(): string | null {
  const navegacao = (window as { navigation?: Navegacao }).navigation;
  if (navegacao?.currentEntry) {
    const indice = navegacao.currentEntry.index;
    return indice > 0 ? (navegacao.entries()[indice - 1]?.url ?? null) : null;
  }
  return window.history.length > 1 && document.referrer
    ? document.referrer
    : null;
}
