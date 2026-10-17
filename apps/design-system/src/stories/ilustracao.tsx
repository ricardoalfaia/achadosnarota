import { useId } from "react";

/**
 * Ilustração decorativa para as histórias: uma folha com linhas sobre uma
 * moldura no degradê da marca. Desenho próprio, não é o logo (o logo é ativo do app).
 */
export function IlustracaoDeDocumento({ tamanho = 180 }: { tamanho?: number }) {
  const id = useId();
  const degrade = `${id}-degrade`;
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={degrade} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--pl-brand-gradient-start)" />
          <stop offset="0.5" stopColor="var(--pl-brand-gradient-mid)" />
          <stop offset="1" stopColor="var(--pl-brand-gradient-end)" />
        </linearGradient>
      </defs>
      <rect
        x="38"
        y="22"
        width="140"
        height="156"
        rx="34"
        fill={`url(#${degrade})`}
        transform="rotate(8 108 100)"
      />
      <rect x="62" y="44" width="92" height="116" rx="14" fill="#ffffff" />
      <rect
        x="78"
        y="74"
        width="60"
        height="9"
        rx="4.5"
        fill="var(--pl-azul-500)"
      />
      <rect
        x="78"
        y="94"
        width="52"
        height="9"
        rx="4.5"
        fill="var(--pl-azul-500)"
      />
      <rect
        x="78"
        y="114"
        width="44"
        height="9"
        rx="4.5"
        fill="var(--pl-roxo-500)"
      />
      <rect
        x="10"
        y="80"
        width="40"
        height="10"
        rx="5"
        fill="var(--pl-verde-agua-500)"
      />
      <rect
        x="20"
        y="100"
        width="30"
        height="10"
        rx="5"
        fill="var(--pl-verde-agua-500)"
      />
    </svg>
  );
}
