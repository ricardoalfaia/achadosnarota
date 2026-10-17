import { cn } from "../../lib/cn";

// Ícones duotone próprios do design system: traço em currentColor e um
// detalhe em verde água. Complementam os ícones de traço simples de
// `Icones.tsx` em pontos de destaque da casca (busca global, notificações,
// notas de versão, documentação e suporte).

const BASE = {
  viewBox: "0 0 24 24",
  fill: "none",
  "aria-hidden": true,
} as const;

/** O detalhe usa o verde água da paleta; não muda com o tema. */
const DETALHE = "var(--ar-laranja-500)";

type Props = { className?: string };

/** Lupa com arco em verde água: a busca global. */
export function IconeBuscaGlobal({ className }: Props) {
  return (
    <svg {...BASE} className={cn("size-5 shrink-0", className)}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M20 20L16 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M11 7C8.79086 7 7 8.79086 7 11"
        stroke={DETALHE}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Sino com onda em verde água: notificações. */
export function IconeSino({ className }: Props) {
  return (
    <svg {...BASE} className={cn("size-5 shrink-0", className)}>
      <path
        d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21S18 15 18 8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M10.3 21A1.94 1.94 0 0 0 13.7 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M19 4A10 10 0 0 1 22 10"
        stroke={DETALHE}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Etiqueta com nó em verde água: notas de versão. */
export function IconeChangeLog({ className }: Props) {
  return (
    <svg {...BASE} className={cn("size-5 shrink-0", className)}>
      <path
        d="M4.5 16.5C4.5 16.5 4 19 2 22C5 20 7.5 19.5 7.5 19.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14.5 4.5C13.2 3.2 11 3 9.5 4.5L4.5 9.5C3 11 3.2 13.2 4.5 14.5L9.5 19.5C10.8 20.8 13 21 14.5 19.5L19.5 14.5C21 13 20.8 10.8 19.5 9.5L14.5 4.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="2" fill={DETALHE} />
    </svg>
  );
}

/** Livro com linhas em verde água: documentação e APIs. */
export function IconeDocumentacao({ className }: Props) {
  return (
    <svg {...BASE} className={cn("size-5 shrink-0", className)}>
      <path
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.5 2H20V22H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 7H16M8 11H13"
        stroke={DETALHE}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Fone de atendimento: suporte. */
export function IconeSuporte({ className }: Props) {
  return (
    <svg {...BASE} className={cn("size-5 shrink-0", className)}>
      <path
        d="M3 18V12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12V18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect
        x="2"
        y="14"
        width="4"
        height="6"
        rx="2"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <rect
        x="18"
        y="14"
        width="4"
        height="6"
        rx="2"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M18 19C18 20.6569 16.6569 22 15 22H13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
