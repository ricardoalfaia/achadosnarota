import { useState } from "react";
import { Pilula } from "@achados/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Beer, Coffee, House, Mountain, Utensils } from "lucide-react";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Navegação/Pilula",
  component: Pilula,
  args: { children: "Restaurantes", ativa: false, icone: <Utensils /> },
  argTypes: { icone: { control: false } },
} satisfies Meta<typeof Pilula>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Padrao: Story = { name: "Padrão" };
export const Ativa: Story = { args: { ativa: true } };

const CATEGORIAS = [
  ["todas", "Todas", <Mountain key="m" />],
  ["restaurantes", "Restaurantes", <Utensils key="u" />],
  ["cafes", "Cafés", <Coffee key="c" />],
  ["bares", "Bares", <Beer key="b" />],
  ["pousadas", "Pousadas", <House key="h" />],
] as const;

function Carrossel() {
  const [ativa, setAtiva] = useState("todas");
  return (
    <div className="scrollbar-none flex max-w-sm gap-2 overflow-x-auto py-1">
      {CATEGORIAS.map(([chave, rotulo, icone]) => (
        <Pilula
          key={chave}
          ativa={ativa === chave}
          icone={icone}
          onClick={() => setAtiva(chave)}
        >
          {rotulo}
        </Pilula>
      ))}
    </div>
  );
}

/** O carrossel de categorias da exploração: uma escolhida por vez. */
export const CarrosselDeCategorias: Story = {
  name: "Carrossel de categorias",
  render: () => <Carrossel />,
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await userEvent.click(tela.getByRole("button", { name: "Cafés" }));
    await expect(tela.getByRole("button", { name: "Cafés" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    await expect(tela.getByRole("button", { name: "Todas" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  },
};
