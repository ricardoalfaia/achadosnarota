import { useEffect, useEffectEvent, type RefObject } from "react";

/**
 * Fecha a caixa suspensa com clique fora de `raiz` ou com Esc. No Esc o foco
 * volta para `gatilho`, para quem navega por teclado não cair no `<body>`.
 * Sai por `@achados/ui/hooks` para menus da casca das aplicações.
 */
export function useFecharAoSair(
  raiz: RefObject<HTMLElement | null>,
  aberto: boolean,
  fechar: () => void,
  gatilho?: RefObject<HTMLElement | null>
): void {
  const aoFechar = useEffectEvent((devolverFoco: boolean) => {
    fechar();
    if (devolverFoco) gatilho?.current?.focus();
  });

  useEffect(() => {
    if (!aberto) return;

    function aoApertar(evento: PointerEvent) {
      if (!raiz.current?.contains(evento.target as Node)) aoFechar(false);
    }
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") aoFechar(true);
    }

    document.addEventListener("pointerdown", aoApertar);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("pointerdown", aoApertar);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [raiz, aberto]);
}
