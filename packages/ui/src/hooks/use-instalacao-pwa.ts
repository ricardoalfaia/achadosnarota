import { useCallback, useSyncExternalStore } from "react";

import { useMediaQuery } from "./use-media-query";

/** O evento `beforeinstallprompt` (Chrome e Android), que não está no DOM padrão. */
type EventoDeInstalacao = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type SituacaoDaInstalacao =
  /** Já roda como app instalado. */
  | "instalado"
  /** O navegador oferece o pedido de instalação: `instalar()` o abre. */
  | "disponivel"
  /** iPhone e iPad: sem pedido; instala pelo "Adicionar à Tela de Início". */
  | "ios"
  /** Sem pedido do navegador (ainda não oferecido ou não suportado). */
  | "indisponivel";

// O pedido chega uma vez, a qualquer momento depois da carga, e precisa ser
// guardado para ser usado num clique. Fica num armazenamento do módulo, lido
// pelo React por assinatura externa: quem montar depois também o encontra.
let pedidoGuardado: EventoDeInstalacao | null = null;
let instaladoAgora = false;
const ouvintes = new Set<() => void>();
const avisar = () => ouvintes.forEach((ouvinte) => ouvinte());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (evento) => {
    evento.preventDefault();
    pedidoGuardado = evento as EventoDeInstalacao;
    avisar();
  });
  window.addEventListener("appinstalled", () => {
    pedidoGuardado = null;
    instaladoAgora = true;
    avisar();
  });
}

function assinar(notificar: () => void) {
  ouvintes.add(notificar);
  return () => ouvintes.delete(notificar);
}

const lerPedido = () => pedidoGuardado;
const lerInstaladoAgora = () => instaladoAgora;
const ehIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

/**
 * Se o app pode ser instalado na tela inicial e como. No servidor e na
 * hidratação vale `indisponivel`; o valor real chega logo depois, sem
 * `setState` em efeito.
 */
export function useInstalacaoPwa(): {
  situacao: SituacaoDaInstalacao;
  instalar: () => Promise<void>;
} {
  const modoApp = useMediaQuery("(display-mode: standalone)");
  const pedido = useSyncExternalStore(assinar, lerPedido, () => null);
  const acabouDeInstalar = useSyncExternalStore(
    assinar,
    lerInstaladoAgora,
    () => false
  );
  const naoServidor = useSyncExternalStore(
    assinar,
    () => true,
    () => false
  );

  const situacao: SituacaoDaInstalacao =
    modoApp || acabouDeInstalar
      ? "instalado"
      : pedido
        ? "disponivel"
        : naoServidor && ehIos()
          ? "ios"
          : "indisponivel";

  const instalar = useCallback(async () => {
    if (!pedidoGuardado) return;
    const atual = pedidoGuardado;
    await atual.prompt();
    const escolha = await atual.userChoice;
    // O pedido só pode ser usado uma vez, aceito ou não.
    pedidoGuardado = null;
    if (escolha.outcome === "accepted") instaladoAgora = true;
    avisar();
  }, []);

  return { situacao, instalar };
}
