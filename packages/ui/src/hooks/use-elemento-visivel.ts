import { useMemo, useSyncExternalStore } from "react";

function observarElemento(id: string | null, margem: string, inicial: boolean) {
  let visivel = inicial;
  return {
    ler: () => visivel,
    assinar(notificar: () => void) {
      const elemento = id ? document.getElementById(id) : null;
      if (!elemento) {
        visivel = false;
        notificar();
        return () => {};
      }
      // O observador avisa logo ao começar, com a situação atual.
      const observador = new IntersectionObserver(
        ([entrada]) => {
          visivel = entrada?.isIntersecting ?? false;
          notificar();
        },
        { rootMargin: margem }
      );
      observador.observe(elemento);
      return () => observador.disconnect();
    },
  };
}

/**
 * Se o elemento com esse `id` está na tela (IntersectionObserver). Sem `id`,
 * ou sem o elemento na página, responde `false`. O servidor e a hidratação
 * presumem `inicial`.
 */
export function useElementoVisivel(
  id: string | null,
  {
    inicial = true,
    margem = "0px",
  }: { inicial?: boolean; margem?: string } = {}
): boolean {
  const elemento = useMemo(
    () => observarElemento(id, margem, inicial),
    [id, margem, inicial]
  );
  return useSyncExternalStore(elemento.assinar, elemento.ler, () => inicial);
}
