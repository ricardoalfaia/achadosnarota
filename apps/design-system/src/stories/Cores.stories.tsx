import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

// As classes aparecem por extenso para o Tailwind detectá-las no build.
const GRUPOS: {
  titulo: string;
  nota?: string;
  tokens: [nome: string, classe: string][];
}[] = [
  {
    titulo: "Superfícies",
    tokens: [
      ["background", "bg-background"],
      ["surface", "bg-surface"],
      ["surface-raised", "bg-surface-raised"],
      ["surface-hover", "bg-surface-hover"],
      ["surface-active", "bg-surface-active"],
      ["surface-header", "bg-surface-header"],
      ["surface-sidebar", "bg-surface-sidebar"],
      ["overlay", "bg-overlay"],
    ],
  },
  {
    titulo: "Texto",
    nota: "foreground-subtle só em texto grande ou decorativo.",
    tokens: [
      ["foreground", "bg-foreground"],
      ["foreground-muted", "bg-foreground-muted"],
      ["foreground-subtle", "bg-foreground-subtle"],
      ["foreground-inverse", "bg-foreground-inverse"],
      ["sidebar-foreground", "bg-sidebar-foreground"],
    ],
  },
  {
    titulo: "Linhas e foco",
    tokens: [
      ["border", "bg-border"],
      ["border-strong", "bg-border-strong"],
      ["ring", "bg-ring"],
    ],
  },
  {
    titulo: "Marca",
    nota: "primary é texto, ícone e contorno; primary-solid é preenchimento.",
    tokens: [
      ["primary", "bg-primary"],
      ["primary-hover", "bg-primary-hover"],
      ["primary-subtle", "bg-primary-subtle"],
      ["primary-solid", "bg-primary-solid"],
      ["primary-solid-hover", "bg-primary-solid-hover"],
      ["primary-solid-foreground", "bg-primary-solid-foreground"],
      ["primary-solid-border", "bg-primary-solid-border"],
      ["primary-solid-start", "bg-primary-solid-start"],
      ["primary-solid-end", "bg-primary-solid-end"],
    ],
  },
  {
    titulo: "Acento e destaque",
    nota: "accent é o verde água; highlight é o roxo. Ícones e fundos suaves dos cartões.",
    tokens: [
      ["accent", "bg-accent"],
      ["accent-subtle", "bg-accent-subtle"],
      ["accent-border", "bg-accent-border"],
      ["highlight", "bg-highlight"],
      ["highlight-subtle", "bg-highlight-subtle"],
      ["highlight-border", "bg-highlight-border"],
    ],
  },
  {
    titulo: "Feedback",
    tokens: [
      ["success", "bg-success"],
      ["success-subtle", "bg-success-subtle"],
      ["success-border", "bg-success-border"],
      ["warning", "bg-warning"],
      ["warning-subtle", "bg-warning-subtle"],
      ["warning-border", "bg-warning-border"],
      ["danger", "bg-danger"],
      ["danger-subtle", "bg-danger-subtle"],
      ["danger-border", "bg-danger-border"],
      ["info", "bg-info"],
      ["info-subtle", "bg-info-subtle"],
      ["info-border", "bg-info-border"],
    ],
  },
];

// A paleta da marca (camada 1), lida direto das variáveis: ela não gera classes.
const MARCA = [
  ["Azul Escuro", "Confiança", "--pl-azul-escuro-900", "#0B2D6B"],
  ["Verde Água", "Inovação", "--pl-verde-agua-500", "#00C2A8"],
  ["Azul Principal", "Tecnologia", "--pl-azul-500", "#3B82F6"],
  ["Roxo", "Criatividade", "--pl-roxo-500", "#8B5CF6"],
  ["Fundo Claro", "Leveza", "--pl-fundo-claro", "#F4F7FB"],
] as const;

const DEGRADES = [
  ["bg-brand-gradient", "Decorativo: verde água → azul → roxo"],
  ["bg-brand-gradient-action", "Botão principal: verde água → azul"],
] as const;

const ESTADOS = [
  ["Sucesso", "border-success-border bg-success-subtle text-success"],
  ["Atenção", "border-warning-border bg-warning-subtle text-warning"],
  ["Erro", "border-danger-border bg-danger-subtle text-danger"],
  ["Informação", "border-info-border bg-info-subtle text-info"],
] as const;

const SOMBRAS = ["shadow-sm", "shadow-md", "shadow-lg", "shadow-xl"] as const;

function Paleta() {
  return (
    <div className="flex flex-col gap-10">
      {GRUPOS.map((grupo) => (
        <div key={grupo.titulo}>
          <h2 className="text-lg font-bold">{grupo.titulo}</h2>
          {grupo.nota && (
            <p className="mt-1 text-sm text-foreground-muted">{grupo.nota}</p>
          )}
          <ul className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-4">
            {grupo.tokens.map(([nome, classe]) => (
              <li
                key={nome}
                className="overflow-hidden rounded-card border border-border bg-surface"
              >
                <div className={`h-16 border-b border-border ${classe}`} />
                <code className="block px-3 py-2 font-mono text-xs">
                  {nome}
                </code>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function PaletaDaMarca() {
  return (
    <ul className="flex flex-wrap gap-6">
      {MARCA.map(([nome, valor, variavel, hex]) => (
        <li key={variavel} className="flex w-32 flex-col items-center gap-2">
          <span
            className="size-20 rounded-full border border-border"
            style={{ background: `var(${variavel})` }}
          />
          <code className="font-mono text-sm font-semibold">{hex}</code>
          <span className="text-center text-sm">
            {nome}
            <span className="block text-foreground-muted">{valor}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Degrades() {
  return (
    <div className="flex flex-col gap-6">
      <ul className="grid gap-4 md:grid-cols-2">
        {DEGRADES.map(([classe, uso]) => (
          <li
            key={classe}
            className="overflow-hidden rounded-card border border-border bg-surface"
          >
            <div className={`h-20 ${classe}`} />
            <div className="px-3 py-2">
              <code className="block font-mono text-xs">{classe}</code>
              <span className="text-sm text-foreground-muted">{uso}</span>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-4xl font-bold">
        Seus documentos{" "}
        <span className="text-brand-gradient">ganham vida.</span>
      </p>
      <p className="text-sm text-foreground-muted">
        <code className="font-mono">text-brand-gradient</code>: só em título
        grande (atinge 3:1, não 4,5:1).
      </p>
    </div>
  );
}

function Feedback() {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-card border border-border bg-surface p-6">
      {ESTADOS.map(([rotulo, classes]) => (
        <span
          key={rotulo}
          className={`rounded-full border px-3 py-1 text-sm font-semibold ${classes}`}
        >
          {rotulo}
        </span>
      ))}
      <button
        type="button"
        className="rounded-full border border-primary-solid-border bg-primary-solid px-5 py-2 text-sm font-semibold text-primary-solid-foreground hover:bg-primary-solid-hover"
      >
        Ação principal
      </button>
    </div>
  );
}

function Sombras() {
  return (
    <div className="flex flex-wrap gap-8">
      {SOMBRAS.map((classe) => (
        <div
          key={classe}
          className={`flex size-32 items-center justify-center rounded-card bg-surface ${classe}`}
        >
          <code className="font-mono text-xs">{classe}</code>
        </div>
      ))}
    </div>
  );
}

const meta = { title: "Fundamentos/Cores" } satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Marca: Story = {
  name: "Paleta da marca",
  render: () => <PaletaDaMarca />,
};
export const Tokens: Story = { render: () => <Paleta /> };
export const DegradesDaMarca: Story = {
  name: "Degradês",
  render: () => <Degrades />,
  play: async ({ canvasElement }) => {
    const acao = canvasElement.querySelector(".bg-brand-gradient-action");
    await expect(getComputedStyle(acao as Element).backgroundImage).toContain(
      "linear-gradient"
    );
  },
};
export const FeedbackEAcao: Story = {
  name: "Feedback e ação",
  render: () => <Feedback />,
};
export const Elevacao: Story = { name: "Sombras", render: () => <Sombras /> };

function ClaroEEscuro() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {(["light", "dark"] as const).map((tema) => (
        <section
          key={tema}
          data-theme={tema}
          aria-label={tema === "light" ? "Tema claro" : "Tema escuro"}
          className="rounded-card border border-border bg-background p-6 text-foreground"
        >
          <h2 className="mb-6 text-2xl font-bold">
            {tema === "light" ? "Claro" : "Escuro"}
          </h2>
          <Paleta />
        </section>
      ))}
    </div>
  );
}

/** Os dois temas na mesma tela: `data-theme` em qualquer elemento força o tema dali para dentro. */
export const LadoALado: Story = {
  name: "Claro e escuro",
  render: () => <ClaroEEscuro />,
  play: async ({ canvasElement }) => {
    const fundo = (tema: string) =>
      getComputedStyle(
        canvasElement.querySelector(`[data-theme="${tema}"]`) as HTMLElement
      ).backgroundColor;
    await expect(fundo("light")).toBe("rgb(244, 247, 251)");
    await expect(fundo("dark")).toBe("rgb(7, 19, 48)");
  },
};
