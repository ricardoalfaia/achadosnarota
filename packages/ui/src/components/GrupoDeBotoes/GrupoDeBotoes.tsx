import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

/**
 * Junta botões em um bloco só: bordas compartilhadas e cantos arredondados
 * apenas nas pontas. Aceita `Botao`, `BotaoDeIcone` e `BotaoDeMenu`; um botão
 * seguido de um `BotaoDeMenu` só com a seta forma o botão dividido.
 */
export function GrupoDeBotoes({
  rotulo,
  className,
  children,
}: {
  /** Nome acessível do grupo, quando os botões formam um conjunto com sentido próprio. */
  rotulo?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      role="group"
      aria-label={rotulo}
      className={cn(
        "inline-flex",
        // Os botões são encontrados por data-botao, direto no grupo ou dentro do BotaoDeMenu.
        "[&_[data-botao]]:relative [&_[data-botao]]:rounded-none",
        "[&_[data-botao]:focus-visible]:z-10 [&_[data-botao]:hover]:z-10",
        "[&>:not(:first-child)]:-ml-px",
        "[&>:first-child>[data-botao]]:rounded-l-control [&>[data-botao]:first-child]:rounded-l-control",
        "[&>:last-child>[data-botao]]:rounded-r-control [&>[data-botao]:last-child]:rounded-r-control",
        className
      )}
    >
      {children}
    </div>
  );
}
