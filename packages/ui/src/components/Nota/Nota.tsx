import { Star } from "lucide-react";

import { cn } from "../../lib/cn";
import { formatarNota } from "./formatar";

/**
 * Estrela âmbar e a nota com uma casa ("★ 4,8"), opcionalmente seguida de um
 * complemento em cinza ("(avaliação editorial)"). O nome acessível diz a
 * escala ("Nota 4,8 de 5"); a estrela é decorativa. Sem `"use client"`.
 */
export function Nota({
  valor,
  complemento,
  tamanho = "sm",
  className,
}: {
  /** De 0 a 5. */
  valor: number;
  complemento?: string;
  /** `xs` para listas compactas, `sm` para cartões, `md` para o topo da ficha. */
  tamanho?: "xs" | "sm" | "md";
  className?: string;
}) {
  const nota = formatarNota(valor);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-bold text-rating",
        tamanho === "xs" && "text-2xs [&_svg]:size-3",
        tamanho === "sm" && "text-xs [&_svg]:size-3.5",
        tamanho === "md" && "text-sm [&_svg]:size-4",
        className
      )}
    >
      <Star aria-hidden="true" className="fill-star text-star" />
      <span aria-label={`Nota ${nota} de 5`}>{nota}</span>
      {complemento && (
        <span className="font-normal text-foreground-muted">{complemento}</span>
      )}
    </span>
  );
}
