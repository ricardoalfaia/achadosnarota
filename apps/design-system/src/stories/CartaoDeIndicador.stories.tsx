import { CartaoDeIndicador } from "@achados/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Clock, FileText, PenLine, Users } from "lucide-react";
import { expect, within } from "storybook/test";

const meta = {
  title: "Painel/CartaoDeIndicador",
  component: CartaoDeIndicador,
  args: {
    icone: <FileText />,
    valor: 24,
    rotulo: "Documentos",
    variacao: { texto: "12%", tendencia: "alta", descricao: "este mês" },
    className: "w-56",
  },
  argTypes: {
    tom: {
      control: "inline-radio",
      options: ["primario", "sucesso", "destaque", "aviso"],
    },
    icone: { control: false },
  },
} satisfies Meta<typeof CartaoDeIndicador>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  name: "Padrão",
  play: async ({ canvasElement }) => {
    // A tendência é lida antes do número por leitores de tela.
    await expect(
      within(canvasElement).getByText("Alta de", { exact: false })
    ).toBeInTheDocument();
  },
};

export const SemVariacao: Story = {
  name: "Sem variação",
  args: { variacao: undefined },
};

/** Os quatro tons e as três tendências, como no painel. */
export const Tons: Story = {
  render: () => (
    <div className="grid max-w-4xl grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4">
      <CartaoDeIndicador
        icone={<FileText />}
        valor={24}
        rotulo="Documentos"
        variacao={{ texto: "12%", tendencia: "alta", descricao: "este mês" }}
      />
      <CartaoDeIndicador
        tom="sucesso"
        icone={<PenLine />}
        valor={18}
        rotulo="Assinaturas"
        variacao={{ texto: "8%", tendencia: "alta", descricao: "este mês" }}
      />
      <CartaoDeIndicador
        tom="destaque"
        icone={<Users />}
        valor={12}
        rotulo="Clientes"
        variacao={{ texto: "0%", tendencia: "estavel", descricao: "este mês" }}
      />
      <CartaoDeIndicador
        tom="aviso"
        icone={<Clock />}
        valor={6}
        rotulo="Pendentes"
        variacao={{ texto: "2%", tendencia: "baixa", descricao: "este mês" }}
      />
    </div>
  ),
};

/** Dentro de um link, o cartão ganha o realce de hover e o anel de foco. */
export const ComoLink: Story = {
  name: "Como link",
  render: (args) => (
    <a href="#documentos" className="block w-56 rounded-card outline-none">
      <CartaoDeIndicador {...args} className="w-full" />
    </a>
  ),
};
