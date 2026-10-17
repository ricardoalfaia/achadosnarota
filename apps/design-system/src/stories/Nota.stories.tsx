import { Nota } from "@achados/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

const meta = {
  title: "Conteúdo/Nota",
  component: Nota,
  args: { valor: 4.8, tamanho: "sm" },
  argTypes: {
    valor: { control: { type: "range", min: 0, max: 5, step: 0.1 } },
    tamanho: { control: "inline-radio", options: ["xs", "sm", "md"] },
  },
} satisfies Meta<typeof Nota>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  name: "Padrão",
  play: async ({ canvasElement }) => {
    // O nome acessível diz a escala; o número usa vírgula decimal.
    await expect(
      within(canvasElement).getByLabelText("Nota 4,8 de 5")
    ).toHaveTextContent("4,8");
  },
};

export const ComComplemento: Story = {
  name: "Com complemento",
  args: { valor: 4.9, complemento: "(curadoria)", tamanho: "md" },
};

export const Tamanhos: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      <Nota valor={4.6} tamanho="xs" />
      <Nota valor={4.7} tamanho="sm" />
      <Nota valor={4.9} tamanho="md" />
    </div>
  ),
};
