import { CaixaDeIcone } from "@achados/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CakeSlice, CircleCheck, History, Percent } from "lucide-react";

const meta = {
  title: "Conteúdo/CaixaDeIcone",
  component: CaixaDeIcone,
  args: { tom: "marca", tamanho: "sm", children: <Percent /> },
  argTypes: {
    tom: {
      control: "inline-radio",
      options: ["marca", "suave", "sucesso", "neutro"],
    },
    tamanho: { control: "inline-radio", options: ["sm", "md", "lg"] },
    children: { control: false },
  },
} satisfies Meta<typeof CaixaDeIcone>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Padrao: Story = { name: "Padrão" };

/** Cupom disponível, benefício em destaque, cupom usado e expirado. */
export const Tons: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <CaixaDeIcone tom="marca">
        <Percent />
      </CaixaDeIcone>
      <CaixaDeIcone tom="suave" tamanho="md">
        <CakeSlice />
      </CaixaDeIcone>
      <CaixaDeIcone tom="sucesso">
        <CircleCheck />
      </CaixaDeIcone>
      <CaixaDeIcone tom="neutro" tamanho="lg">
        <History />
      </CaixaDeIcone>
    </div>
  ),
};
