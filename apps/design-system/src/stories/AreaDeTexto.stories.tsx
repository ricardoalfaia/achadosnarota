import { AreaDeTexto } from "@achados/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Campos/AreaDeTexto",
  component: AreaDeTexto,
  args: { label: "Resumo do cartão" },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AreaDeTexto>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  name: "Padrão",
  play: async ({ canvasElement }) => {
    const campo = within(canvasElement).getByLabelText("Resumo do cartão");
    await userEvent.type(campo, "Fogão a lenha e quintal com vista.");
    await expect(campo).toHaveValue("Fogão a lenha e quintal com vista.");
  },
};
export const ComContador: Story = {
  name: "Com contador",
  args: {
    tamanhoMaximo: 200,
    valorInicial: "Fogão a lenha, panelas de barro e quintal com vista.",
  },
};
export const ComErro: Story = {
  name: "Com erro",
  args: { erro: "Escreva o resumo do cartão", required: true },
};
export const Desabilitado: Story = {
  args: { desabilitado: true, valorInicial: "Texto travado." },
};
