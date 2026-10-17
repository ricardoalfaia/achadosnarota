import { Etiqueta } from "@achados/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { BadgeCheck, Crown, Sparkles, Star } from "lucide-react";
import { expect, within } from "storybook/test";

const meta = {
  title: "Conteúdo/Etiqueta",
  component: Etiqueta,
  args: { children: "Culinária Brasileira", tom: "neutro", tamanho: "md" },
  argTypes: {
    tom: {
      control: "select",
      options: [
        "marca",
        "info",
        "sucesso",
        "escuro",
        "claro",
        "neutro",
        "acento",
        "sucessoSuave",
      ],
    },
    tamanho: { control: "inline-radio", options: ["sm", "md"] },
    icone: { control: false },
  },
} satisfies Meta<typeof Etiqueta>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Padrao: Story = { name: "Padrão" };

/** Os selos editoriais e a especialidade, sobre uma superfície escura como a foto. */
export const SobreFoto: Story = {
  name: "Sobre foto",
  render: () => (
    <div className="flex flex-col gap-3 rounded-card bg-passport p-6">
      <div className="flex flex-wrap gap-2">
        <Etiqueta tom="marca" icone={<Star className="fill-current" />}>
          Destaque
        </Etiqueta>
        <Etiqueta tom="info" icone={<Star className="fill-current" />}>
          Mais querido
        </Etiqueta>
        <Etiqueta tom="sucesso" icone={<BadgeCheck />}>
          Verificado
        </Etiqueta>
        <Etiqueta tom="escuro" icone={<Sparkles />}>
          Novo
        </Etiqueta>
      </div>
      <Etiqueta tom="claro" tamanho="sm">
        Café & Confeitaria
      </Etiqueta>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Destaque")).toBeVisible();
  },
};

/** Sobre a superfície: tags do lugar, selo da curadoria e confirmação. */
export const SobreASuperficie: Story = {
  name: "Sobre a superfície",
  render: () => (
    <div className="flex flex-wrap gap-2 rounded-card border border-border bg-surface p-6">
      <Etiqueta tom="neutro">Ambiente Familiar</Etiqueta>
      <Etiqueta tom="neutro">Vista</Etiqueta>
      <Etiqueta tom="acento" icone={<Crown className="text-star" />}>
        Curadoria Achados na Rota
      </Etiqueta>
      <Etiqueta tom="sucessoSuave" tamanho="sm">
        ★ Confirmado pelo parceiro
      </Etiqueta>
    </div>
  ),
};
