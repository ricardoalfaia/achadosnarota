import { Botao, Destaque } from "@achados/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Compass, Crown } from "lucide-react";
import { expect, within } from "storybook/test";

import { IlustracaoDaRota } from "./ilustracao";

const meta = {
  title: "Painel/Destaque",
  component: Destaque,
  args: {
    saudacao: "Olá, Ana 👋",
    titulo: (
      <>
        Descubra lugares{" "}
        <span className="text-brand-gradient">que valem a pena.</span>
      </>
    ),
    descricao:
      "Comida boa, experiências reais e benefícios para quem está na rota.",
    acoes: (
      <>
        <Botao tamanho="md" icone={<Compass />}>
          Explorar lugares
        </Botao>
        <Botao tamanho="md" variante="contorno" icone={<Crown />}>
          Conhecer o passaporte
        </Botao>
      </>
    ),
    ilustracao: <IlustracaoDaRota />,
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
      tela.getByRole("region", {
        name: "Descubra lugares que valem a pena.",
      })
    ).toBeInTheDocument();
    // O botão principal leva o degradê de ação.
    const principal = tela.getByRole("button", { name: "Explorar lugares" });
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
    titulo: "Favoritos",
  },
};
