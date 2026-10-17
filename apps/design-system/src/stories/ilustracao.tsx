import { useId } from "react";

/**
 * Ilustração decorativa para as histórias: uma estrada em curva subindo a
 * serra até um pin de localização, no degradê laranja da marca. Desenho
 * próprio, não é o logotipo (o logotipo é ativo do app).
 */
export function IlustracaoDaRota({ tamanho = 180 }: { tamanho?: number }) {
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
        <linearGradient id={degrade} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="var(--ar-brand-gradient-start)" />
          <stop offset="0.6" stopColor="var(--ar-brand-gradient-mid)" />
          <stop offset="1" stopColor="var(--ar-brand-gradient-end)" />
        </linearGradient>
      </defs>
      <path
        d="M10 170 L70 80 L105 120 L140 60 L190 170 Z"
        fill="var(--ar-asfalto-700)"
        opacity="0.9"
      />
      <path d="M60 170 L110 110 L150 170 Z" fill="var(--ar-asfalto-900)" />
      <path
        d="M40 190 C80 150 90 130 120 118 C140 110 150 100 158 86"
        stroke={`url(#${degrade})`}
        strokeWidth="16"
        strokeLinecap="round"
      />
      <path
        d="M44 186 C82 150 92 132 120 120 C138 112 148 102 156 90"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeDasharray="8 9"
        strokeLinecap="round"
      />
      <path
        d="M160 20c-14 0-24 10-24 23 0 17 24 37 24 37s24-20 24-37c0-13-10-23-24-23Z"
        fill={`url(#${degrade})`}
      />
      <circle cx="160" cy="43" r="8" fill="#ffffff" />
    </svg>
  );
}
