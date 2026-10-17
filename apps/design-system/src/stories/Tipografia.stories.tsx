import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

// As classes aparecem por extenso para o Tailwind detectá-las no build.
const ESCALA = [
  ["text-4xl", 36, "Números de destaque"],
  ["text-3xl", 30, "Título grande"],
  ["text-2xl", 24, "Nome do lugar na ficha"],
  ["text-xl", 20, "Título do passaporte"],
  ["text-lg", 18, "Título de diálogo"],
  ["text-base", 16, "Corpo (padrão do body e dos campos)"],
  ["text-sm", 14, "Título de cartão e de seção"],
  ["text-xs", 12, "Texto de cartão, regras e etiquetas"],
  ["text-2xs", 10, "Selos e legendas pequenas"],
] as const;

// Os pesos do protótipo: ExtraBold títulos, Bold nomes e ações, Semibold
// destaques, Medium etiquetas, Regular texto.
const PESOS = [
  ["font-extrabold", "800", "ExtraBold · títulos"],
  ["font-bold", "700", "Bold · nomes e ações"],
  ["font-semibold", "600", "Semibold · destaques"],
  ["font-medium", "500", "Medium · etiquetas"],
  ["font-normal", "400", "Regular · texto"],
] as const;

const RAIOS = [
  ["rounded-control", "12px", "Campos"],
  ["rounded-card", "16px", "Cartões"],
  ["rounded-overlay", "24px", "Diálogos e cartões de destaque"],
  ["rounded-full", "total", "Botões, selos, avatares e pílulas"],
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
      <p className="text-4xl font-extrabold">Plus Jakarta Sans</p>
      <div className="flex flex-col gap-3">
        {PESOS.map(([classe, peso, uso]) => (
          <p key={classe} className={`text-xl ${classe}`}>
            Descubra lugares que valem a pena.{" "}
            <span className="text-sm font-normal text-foreground-muted">
              {peso} · {uso}
            </span>
          </p>
        ))}
      </div>
      <p className="font-mono text-base">
        font-mono para códigos e valores: AR-9F4JW3 · 16/10/2026 · R$ 129,00
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
    await expect(getComputedStyle(document.body).fontSize).toBe("16px");
  },
};
export const PesosEMono: Story = {
  name: "Pesos e mono",
  render: () => <Pesos />,
  play: async () => {
    await expect(getComputedStyle(document.body).fontFamily).toContain(
      "Plus Jakarta Sans Variable"
    );
  },
};
export const RaiosPorPapel: Story = { name: "Raios", render: () => <Raios /> };
