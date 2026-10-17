import { CartaoDeModelo } from "@achados/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileText, Lock } from "lucide-react";

const meta = {
  title: "Painel/CartaoDeModelo",
  component: CartaoDeModelo,
  args: {
    icone: <FileText />,
    nome: "Procuração",
    detalhe: "12 usos",
    tom: "sucesso",
    className: "w-40",
  },
  argTypes: {
    tom: {
      control: "inline-radio",
      options: ["primario", "sucesso", "destaque", "aviso"],
    },
    icone: { control: false },
  },
} satisfies Meta<typeof CartaoDeModelo>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Padrao: Story = { name: "Padrão" };

/** Nome longo quebra em até duas linhas. */
export const NomeLongo: Story = {
  name: "Nome longo",
  args: {
    icone: <Lock />,
    nome: "Termo de Confidencialidade",
    detalhe: "6 usos",
    tom: "destaque",
  },
};

export const Tons: Story = {
  render: () => (
    <div className="grid max-w-3xl grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3">
      <CartaoDeModelo
        icone={<FileText />}
        nome="Procuração"
        detalhe="12 usos"
        tom="sucesso"
      />
      <CartaoDeModelo
        icone={<FileText />}
        nome="Contrato de Serviços"
        detalhe="8 usos"
      />
      <CartaoDeModelo
        icone={<Lock />}
        nome="Termo de Confidencialidade"
        detalhe="6 usos"
        tom="destaque"
      />
      <CartaoDeModelo
        icone={<FileText />}
        nome="Proposta Comercial"
        detalhe="5 usos"
        tom="aviso"
      />
    </div>
  ),
};
