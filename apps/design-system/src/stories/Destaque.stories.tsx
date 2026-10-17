import { Botao, Destaque } from "@meuproduto/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PenLine, Plus } from "lucide-react";
import { expect, within } from "storybook/test";

import { IlustracaoDeDocumento } from "./ilustracao";

const meta = {
  title: "Painel/Destaque",
  component: Destaque,
  args: {
    saudacao: "Olá, Marina 👋",
    titulo: (
      <>
        Seus documentos{" "}
        <span className="text-brand-gradient">ganham vida.</span>
      </>
    ),
    descricao:
      "Crie, gerencie e envie para assinatura de forma simples, rápida e segura.",
    acoes: (
      <>
        <Botao tamanho="md" icone={<Plus />}>
          Gerar documento
        </Botao>
        <Botao tamanho="md" variante="contorno" icone={<PenLine />}>
          Enviar para assinatura
        </Botao>
      </>
    ),
    ilustracao: <IlustracaoDeDocumento />,
  },
  argTypes: {
    titulo: { control: false },
    acoes: { control: false },
    ilustracao: { control: false },
  },
} satisfies Meta<typeof Destaque>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  name: "Padrão",
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(
      tela.getByRole("region", { name: "Seus documentos ganham vida." })
    ).toBeInTheDocument();
    // O botão principal leva o degradê de ação.
    const principal = tela.getByRole("button", { name: "Gerar documento" });
    await expect(getComputedStyle(principal).backgroundImage).toContain(
      "linear-gradient"
    );
  },
};

export const SemIlustracao: Story = {
  name: "Sem ilustração",
  args: { ilustracao: undefined },
};

export const SoTitulo: Story = {
  name: "Só o título",
  args: {
    saudacao: undefined,
    descricao: undefined,
    acoes: undefined,
    ilustracao: undefined,
    titulo: "Modelos",
  },
};
