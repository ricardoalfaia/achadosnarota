import type { SVGProps } from "react";

// Os ícones da barra inferior, desenhados no protótipo (pwa.html): casa
// preenchida, coração, bilhete picotado, pessoa e o visor do leitor.

type Props = SVGProps<SVGSVGElement>;

const BASE: Props = { viewBox: "0 0 24 24", "aria-hidden": true };

export function IconeCasa(props: Props) {
  return (
    <svg {...BASE} fill="currentColor" {...props}>
      <path d="M12.7 2.38a1.1 1.1 0 0 0-1.4 0L3.48 8.87a1.2 1.2 0 0 0-.48.96V19a2.5 2.5 0 0 0 2.5 2.5H9a1 1 0 0 0 1-1v-4a2 2 0 0 1 2-2 2 2 0 0 1 2 2v4a1 1 0 0 0 1 1h3.5A2.5 2.5 0 0 0 21 19V9.83c0-.38-.18-.74-.48-.96L12.7 2.38Z" />
    </svg>
  );
}

const CONTORNO: Props = {
  ...BASE,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.3,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function IconeCoracao(props: Props) {
  return (
    <svg {...CONTORNO} {...props}>
      <path d="M19.5 13.57 12 21l-7.5-7.43A5 5 0 0 1 12 6.72a5 5 0 0 1 7.5 6.85Z" />
    </svg>
  );
}

export function IconeBilhete(props: Props) {
  return (
    <svg {...CONTORNO} {...props}>
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2Z" />
      <path d="M8 5v14" strokeDasharray="2 3" />
    </svg>
  );
}

export function IconePessoa(props: Props) {
  return (
    <svg {...CONTORNO} {...props}>
      <circle cx="12" cy="7" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

export function IconeVisor(props: Props) {
  return (
    <svg {...CONTORNO} strokeWidth={2.8} {...props}>
      <path d="M4 8V6a2 2 0 0 1 2-2h2" />
      <path d="M16 4h2a2 2 0 0 1 2 2v2" />
      <path d="M20 16v2a2 2 0 0 1-2 2h-2" />
      <path d="M8 20H6a2 2 0 0 1-2-2v-2" />
      <line x1="9" y1="12" x2="15" y2="12" strokeWidth={3.2} />
    </svg>
  );
}
