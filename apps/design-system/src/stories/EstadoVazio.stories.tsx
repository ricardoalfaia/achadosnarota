import { Botao, EstadoVazio } from "@achados/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Construction, FileText, Plus } from "lucide-react";
import { expect, within } from "storybook/test";

const meta = {
  title: "Conteúdo/EstadoVazio",
  component: EstadoVazio,
  args: {
    icone: <FileText />,
    titulo: "Nenhum documento ainda",
    descricao: "Crie o primeiro a partir de um modelo pronto.",
    acao: <Botao icone={<Plus />}>Criar documento</Botao>,
    className: "max-w-xl",
  },
  argTypes: { icone: { control: false }, acao: { control: false } },
} satisfies Meta<typeof EstadoVazio>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  name: "Padrão",
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("heading", {
        name: "Nenhum documento ainda",
        level: 3,
      })
    ).toBeInTheDocument();
  },
};

/** Tela ainda não construída. */
export const EmConstrucao: Story = {
  name: "Em construção",
  args: {
    icone: <Construction />,
    titulo: "Relatórios em breve",
    descricao: "Esta área ainda está sendo construída.",
    acao: undefined,
  },
};

export const SoTitulo: Story = {
  name: "Só o título",
  args: { icone: undefined, descricao: undefined, acao: undefined },
};
