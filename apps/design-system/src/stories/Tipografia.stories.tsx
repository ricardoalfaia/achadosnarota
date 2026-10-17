import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

// As classes aparecem por extenso para o Tailwind detectá-las no build.
const ESCALA = [
  ["text-4xl", 28, "Números de destaque"],
  ["text-3xl", 22, "Título de página"],
  ["text-2xl", 18, "Título de seção"],
  ["text-xl", 16, "Título de card"],
  ["text-lg", 14, "Texto em destaque"],
  ["text-base", 13, "Corpo (padrão do body)"],
  ["text-sm", 12, "Texto secundário"],
  ["text-xs", 11, "Rótulos de seção e label flutuante"],
  ["text-2xs", 10, "Selos e etiquetas em maiúsculas"],
] as const;

// Os pesos da identidade visual: Bold títulos, Semibold destaques, Medium
// navegação, Regular texto.
const PESOS = [
  ["font-bold", "700", "Bold · títulos"],
  ["font-semibold", "600", "Semibold · destaques"],
  ["font-medium", "500", "Medium · navegação"],
  ["font-normal", "400", "Regular · texto"],
] as const;

const RAIOS = [
  ["rounded-control", "8px", "Campos e botões"],
  ["rounded-card", "12px", "Cards e painéis"],
  ["rounded-overlay", "16px", "Menus, popovers e modais"],
  ["rounded-full", "total", "Selos, avatares e pílulas"],
] as const;

function Escala() {
  return (
    <table className="w-full border-collapse">
      <tbody>
        {ESCALA.map(([classe, px, uso]) => (
          <tr key={classe} className="border-b border-border">
            <td className="w-32 py-3 pr-4 align-baseline">
              <code className="font-mono text-sm text-foreground-muted">
                {classe}
              </code>
            </td>
            <td className="w-16 py-3 pr-4 align-baseline font-mono text-sm text-foreground-muted">
              {px}px
            </td>
            <td className="py-3 align-baseline">
              <span className={classe} data-px={px}>
                {uso}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Pesos() {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-4xl font-bold">Inter</p>
      <div className="flex flex-col gap-3">
        {PESOS.map(([classe, peso, uso]) => (
          <p key={classe} className={`text-xl ${classe}`}>
            Seus documentos ganham vida.{" "}
            <span className="text-sm font-normal text-foreground-muted">
              {peso} · {uso}
            </span>
          </p>
        ))}
      </div>
      <p className="font-mono text-base">
        font-mono para códigos, datas e valores: DOC-04291 · 16/10/2026 ·
        1.284,55
      </p>
      <p className="text-2xs font-bold tracking-wider text-foreground-muted uppercase">
        Rótulo de seção em text-2xs
      </p>
    </div>
  );
}

function Raios() {
  return (
    <div className="flex flex-wrap gap-6">
      {RAIOS.map(([classe, valor, uso]) => (
        <div key={classe} className="flex w-44 flex-col gap-2">
          <div
            className={`h-20 border border-border-strong bg-surface ${classe}`}
          />
          <code className="font-mono text-sm">{classe}</code>
          <span className="text-sm text-foreground-muted">
            {valor} · {uso}
          </span>
        </div>
      ))}
    </div>
  );
}

const meta = { title: "Fundamentos/Tipografia" } satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const EscalaDeTamanhos: Story = {
  name: "Escala",
  render: () => <Escala />,
  play: async ({ canvasElement }) => {
    for (const amostra of canvasElement.querySelectorAll<HTMLElement>(
      "[data-px]"
    )) {
      await expect(getComputedStyle(amostra).fontSize).toBe(
        `${amostra.dataset.px}px`
      );
    }
    await expect(getComputedStyle(document.body).fontSize).toBe("13px");
  },
};
export const PesosEMono: Story = {
  name: "Pesos e mono",
  render: () => <Pesos />,
  play: async () => {
    await expect(getComputedStyle(document.body).fontFamily).toContain(
      "Inter Variable"
    );
  },
};
export const RaiosPorPapel: Story = { name: "Raios", render: () => <Raios /> };
