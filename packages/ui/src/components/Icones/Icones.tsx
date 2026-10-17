import { cn } from "../../lib/cn";

// Ícones SVG usados pelos componentes de referência.

const BASE = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function IconeSeta({
  aberto,
  className,
}: {
  aberto?: boolean;
  className?: string;
}) {
  return (
    <svg
      {...BASE}
      className={cn(
        "size-5 shrink-0 transition-transform",
        aberto && "rotate-180",
        className
      )}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconeLateral({ direcao }: { direcao: "anterior" | "proximo" }) {
  return (
    <svg {...BASE} className="size-4">
      <path d={direcao === "anterior" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
}

export function IconeCalendario() {
  return (
    <svg {...BASE} strokeWidth={1.75} className="size-5 shrink-0">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
    </svg>
  );
}

export function IconeCheck() {
  return (
    <svg {...BASE} className="size-4 shrink-0">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconeBusca({ className }: { className?: string }) {
  return (
    <svg
      {...BASE}
      className={cn("size-4 shrink-0 text-foreground-subtle", className)}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

// Ícones de ação, para botões e menus. O tamanho padrão é 16px; dentro de um
// Botao ou ItemDeMenu, quem define o tamanho é o componente.

function criarIcone(desenho: string) {
  return function Icone({ className }: { className?: string }) {
    return (
      <svg {...BASE} className={cn("size-4 shrink-0", className)}>
        <path d={desenho} />
      </svg>
    );
  };
}

export const IconeMais = criarIcone("M12 5v14M5 12h14");
export const IconeBaixar = criarIcone("M12 4v11m0 0-4-4m4 4 4-4M5 19h14");
export const IconeEnviar = criarIcone("M12 20V9m0 0-4 4m4-4 4 4M5 5h14");
export const IconeEditar = criarIcone("M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4");
export const IconeCopiar = criarIcone("M9 9h10v10H9zM5 15V5h10");
export const IconeLixeira = criarIcone(
  "M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V4h6v3"
);
export const IconeFiltro = criarIcone("M4 5h16l-6 8v5l-4 2v-7L4 5Z");
export const IconeAtualizar = criarIcone(
  "M20 11a8 8 0 0 0-14.9-3M4 5v3h3M4 13a8 8 0 0 0 14.9 3M20 19v-3h-3"
);
export const IconeMaisOpcoes = criarIcone("M12 5.5v.01M12 12v.01M12 18.5v.01");
export const IconeFechar = criarIcone("M6 6l12 12M18 6 6 18");

/** Quatro linhas finas afunilando, para o botão de filtro no cabeçalho da Tabela. */
export function IconeFiltroDeLista({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="currentColor"
      aria-hidden="true"
      className={cn("size-3.5 shrink-0", className)}
    >
      <path d="M1 2a.5.5 0 000 1h12a.5.5 0 000-1H1zM3 5a.5.5 0 000 1h8a.5.5 0 000-1H3zM4.5 8.5A.5.5 0 015 8h4a.5.5 0 010 1H5a.5.5 0 01-.5-.5zM6.5 11a.5.5 0 000 1h1a.5.5 0 000-1h-1z" />
    </svg>
  );
}

/* ── Acesso: usuário, senha, tela cheia ─────────────────────────────────── */

export function IconeUsuario({ className }: { className?: string }) {
  return (
    <svg {...BASE} className={cn("size-4 shrink-0", className)}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function IconeCadeado({ className }: { className?: string }) {
  return (
    <svg {...BASE} className={cn("size-4 shrink-0", className)}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function IconeOlho({ className }: { className?: string }) {
  return (
    <svg {...BASE} className={cn("size-4 shrink-0", className)}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconeOlhoFechado({ className }: { className?: string }) {
  return (
    <svg {...BASE} className={cn("size-4 shrink-0", className)}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
    </svg>
  );
}

export function IconeArroba({ className }: { className?: string }) {
  return (
    <svg {...BASE} className={cn("size-4 shrink-0", className)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
    </svg>
  );
}

export function IconeTelaCheia({ className }: { className?: string }) {
  return (
    <svg {...BASE} className={cn("size-4 shrink-0", className)}>
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

export function IconeGrade({ className }: { className?: string }) {
  return (
    <svg {...BASE} className={cn("size-4 shrink-0", className)}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

/** Seta com haste apontando para a direita: "continuar", "entrar". */
export function IconeSetaLonga({ className }: { className?: string }) {
  return (
    <svg
      {...BASE}
      strokeWidth={2.5}
      className={cn("size-4 shrink-0", className)}
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
