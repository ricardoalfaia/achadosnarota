import { SeletorDePeriodo } from "@achados/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Campos/SeletorDePeriodo",
  component: SeletorDePeriodo,
  decorators: [
    (Story) => (
      <div className="max-w-xl pb-120">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SeletorDePeriodo>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Padrao: Story = { name: "Padrão" };
export const ComValor: Story = {
  name: "Com valor",
  args: { valorInicial: { inicio: "2026-09-28", fim: "2026-10-05" } },
};
export const ComAtalhos: Story = {
  name: "Com atalhos",
  args: {
    atalhos: [
      { label: "7 dias", dias: 7 },
      { label: "30 dias", dias: 30 },
      { label: "90 dias", dias: 90 },
    ],
  },
};
export const ComErro: Story = {
  name: "Com erro",
  args: { erro: "Escolha o período" },
};

export const Tamanhos: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((tamanho) => (
        <SeletorDePeriodo
          key={tamanho}
          {...args}
          tamanho={tamanho}
          valorInicial={
            tamanho === "md"
              ? null
              : { inicio: "2026-09-28", fim: "2026-10-05" }
          }
        />
      ))}
    </div>
  ),
};
