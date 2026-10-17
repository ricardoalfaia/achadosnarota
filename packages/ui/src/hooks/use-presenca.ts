import { useEffect, useState } from "react";

/** Duração da animação de saída (`animate-popover-out` em tokens.css). */
export const DURACAO_DE_SAIDA = 140;

/**
 * Mantém um elemento montado enquanto a animação de saída roda. `montado` decide
 * se renderiza; `saindo` troca a animação de entrada pela de saída.
 * Sai por `@achados/ui/hooks` para menus da casca das aplicações.
 */
export function usePresenca(aberto: boolean): {
  montado: boolean;
  saindo: boolean;
} {
  const [montado, setMontado] = useState(aberto);
  if (aberto && !montado) setMontado(true);

  useEffect(() => {
    if (aberto || !montado) return;
    const espera = setTimeout(() => setMontado(false), DURACAO_DE_SAIDA);
    return () => clearTimeout(espera);
  }, [aberto, montado]);

  return { montado: aberto || montado, saindo: !aberto && montado };
}
