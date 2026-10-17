import { useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";

const MARGEM = 8;

/**
 * Painel que flutua acima de tudo, ancorado a um elemento. Usa a Popover API do
 * navegador: fica na camada superior, então não é cortado pela rolagem da
 * tabela, e fecha sozinho com Esc ou clique fora. Ao fechar, o foco volta para
 * a âncora.
 */
export function Flutuante({
  ancora,
  aoFechar,
  children,
}: {
  ancora: RefObject<HTMLElement | null>;
  aoFechar: () => void;
  children: ReactNode;
}) {
  const painel = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const elemento = painel.current;
    const origem = ancora.current;
    if (!elemento || !origem) return;

    elemento.showPopover();

    // Abaixo da âncora; se não couber, acima. Nunca para fora da janela.
    const alvo = origem.getBoundingClientRect();
    const { width, height } = elemento.getBoundingClientRect();
    const cabeAbaixo = alvo.bottom + height + MARGEM <= window.innerHeight;
    const topo = cabeAbaixo
      ? alvo.bottom + 4
      : Math.max(MARGEM, alvo.top - height - 4);
    const esquerda = Math.min(
      Math.max(MARGEM, alvo.left),
      window.innerWidth - width - MARGEM
    );
    elemento.style.top = `${topo}px`;
    elemento.style.left = `${esquerda}px`;
    elemento.querySelector<HTMLElement>("[data-foco-inicial]")?.focus();

    return () => {
      if (elemento.matches(":popover-open")) elemento.hidePopover();
      origem.focus();
    };
  }, [ancora]);

  return (
    <div
      ref={painel}
      popover="auto"
      onToggle={(evento) => {
        if (evento.newState === "closed") aoFechar();
      }}
      className="fixed m-0 animate-popover-in overflow-visible rounded-overlay border border-border-strong bg-surface p-0 text-foreground shadow-xl"
      style={{ inset: "auto" }}
    >
      {children}
    </div>
  );
}
