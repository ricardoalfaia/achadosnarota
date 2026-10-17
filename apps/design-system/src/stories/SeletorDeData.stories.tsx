import { SeletorDeData } from "@meuproduto/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Campos/SeletorDeData",
  component: SeletorDeData,
  args: { label: "Data de assinatura" },
  decorators: [
    (Story) => (
      <div className="max-w-sm pb-112">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SeletorDeData>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Padrao: Story = { name: "Padrão" };
export const ComValor: Story = {
  name: "Com valor",
  args: { valorInicial: "2026-10-05" },
};
export const ComErro: Story = {
  name: "Com erro",
  args: { erro: "Informe a data" },
};
export const Desabilitado: Story = {
  args: { desabilitado: true, valorInicial: "2026-10-05" },
};

export const Tamanhos: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-4">
      {(["sm", "md", "lg"] as const).map((tamanho) => (
        <div key={tamanho} className="contents">
          <SeletorDeData
            {...args}
            tamanho={tamanho}
            label={`Assinatura (${tamanho})`}
          />
          <SeletorDeData
            {...args}
            tamanho={tamanho}
            label={`Assinatura (${tamanho})`}
            valorInicial="2026-10-05"
          />
        </div>
      ))}
    </div>
  ),
};
