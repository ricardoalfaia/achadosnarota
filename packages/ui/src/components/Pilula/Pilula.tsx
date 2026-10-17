import type { ComponentProps, ReactNode } from "react";

import { estiloDaPilula } from "./estilo";

type Nativo = Omit<ComponentProps<"button">, "children">;

/**
 * Pílula de escolha (categoria, filtro). Como botão, informa a escolha com
 * `aria-pressed`; para navegar, use um link com `estiloDaPilula` e
 * `aria-current`.
 */
export function Pilula({
  ativa = false,
  icone,
  type = "button",
  className,
  children,
  ...nativo
}: Nativo & {
  ativa?: boolean;
  icone?: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      {...nativo}
      type={type}
      aria-pressed={ativa}
      className={estiloDaPilula({ ativa, ...(className ? { className } : {}) })}
    >
      {icone && <span aria-hidden="true">{icone}</span>}
      {children}
    </button>
  );
}
