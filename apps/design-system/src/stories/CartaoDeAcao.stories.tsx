import { CartaoDeAcao } from "@achados/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FilePlus, LayoutGrid, PenLine, UserPlus } from "lucide-react";
import { expect, within } from "storybook/test";

const meta = {
  title: "Painel/CartaoDeAcao",
  component: CartaoDeAcao,
  args: {
    icone: <FilePlus />,
    titulo: "Criar documento",
    descricao: "A partir de um modelo",
    className: "w-80",
  },
  argTypes: {
    tom: {
      control: "inline-radio",
      options: ["primario", "sucesso", "destaque", "aviso"],
    },
    icone: { control: false },
  },
} satisfies Meta<typeof CartaoDeAcao>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Padrao: Story = { name: "Padrão" };

export const SemDescricao: Story = {
  name: "Sem descrição",
  args: { descricao: undefined },
};

/** As ações rápidas do painel, cada uma dentro de um link. */
export const AcoesRapidas: Story = {
  name: "Ações rápidas",
  render: () => (
    <nav aria-label="Ações rápidas" className="flex w-80 flex-col gap-2.5">
      {[
        {
          icone: <FilePlus />,
          titulo: "Criar documento",
          descricao: "A partir de um modelo",
          tom: "primario",
        },
        {
          icone: <PenLine />,
          titulo: "Enviar para assinatura",
          descricao: "Com poucos cliques",
          tom: "sucesso",
        },
        {
          icone: <LayoutGrid />,
          titulo: "Usar modelo",
          descricao: "Modelos prontos",
          tom: "primario",
        },
        {
          icone: <UserPlus />,
          titulo: "Adicionar cliente",
          descricao: "Cadastrar novo cliente",
          tom: "destaque",
        },
      ].map((acao) => (
        <a
          key={acao.titulo}
          href={`#${acao.titulo}`}
          className="block rounded-card outline-none"
        >
          <CartaoDeAcao
            icone={acao.icone}
            titulo={acao.titulo}
            descricao={acao.descricao}
            tom={acao.tom as "primario" | "sucesso" | "destaque"}
          />
        </a>
      ))}
    </nav>
  ),
  play: async ({ canvasElement }) => {
    const links = within(canvasElement).getAllByRole("link");
    await expect(links).toHaveLength(4);
    await expect(links[0]).toHaveAccessibleName(
      "Criar documento A partir de um modelo"
    );
  },
};
