import { Etapas } from "@meuproduto/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

const FLUXO = [
  { id: "rascunho", rotulo: "Rascunho", descricao: "Preenchimento" },
  { id: "revisao", rotulo: "Revisão", descricao: "Conferência" },
  { id: "aprovado", rotulo: "Aprovado", descricao: "Pronto para gerar" },
  { id: "gerado", rotulo: "Gerado", descricao: "PDF disponível" },
] as const;

const meta = {
  title: "Painel/Etapas",
  component: Etapas,
  args: {
    etapas: FLUXO,
    atual: "revisao",
    rotulo: "Etapas do documento",
    className: "max-w-3xl",
  },
  argTypes: {
    atual: {
      control: "inline-radio",
      options: FLUXO.map((etapa) => etapa.id),
    },
  },
} satisfies Meta<typeof Etapas>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  name: "Padrão",
  play: async ({ canvasElement }) => {
    const lista = within(canvasElement).getByRole("list", {
      name: "Etapas do documento",
    });
    const itens = within(lista).getAllByRole("listitem");
    await expect(itens[1]).toHaveAttribute("aria-current", "step");
    await expect(itens[0]).toHaveTextContent("concluída");
    await expect(itens[2]).toHaveTextContent("pendente");
  },
};

export const NoInicio: Story = {
  name: "No início",
  args: { atual: "rascunho" },
};
export const Concluido: Story = { name: "No fim", args: { atual: "gerado" } };

export const SemDescricao: Story = {
  name: "Sem descrição",
  args: {
    etapas: FLUXO.map(({ id, rotulo }) => ({ id, rotulo })),
    atual: "aprovado",
  },
};
