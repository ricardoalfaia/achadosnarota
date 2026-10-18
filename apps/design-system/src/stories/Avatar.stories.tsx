import { Avatar } from "@achados/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

// Foto sintética embutida: um círculo no degradê da marca, sem rede externa.
const FOTO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbbf24"/><stop offset="1" stop-color="#d4440f"/></linearGradient></defs><rect width="64" height="64" fill="url(#g)"/><circle cx="32" cy="26" r="11" fill="#fff"/><path d="M12 60c2-12 10-18 20-18s18 6 20 18z" fill="#fff"/></svg>'
)}`;

const meta = {
  title: "Conteúdo/Avatar",
  component: Avatar,
  args: { nome: "Marina Duarte Alves" },
  argTypes: {
    tamanho: {
      control: "inline-radio",
      options: ["sm", "md", "lg", "xl", "2xl"],
    },
  },
} satisfies Meta<typeof Avatar>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Iniciais: Story = {
  play: async ({ canvasElement }) => {
    const avatar = within(canvasElement).getByRole("img", {
      name: "Marina Duarte Alves",
    });
    await expect(avatar).toHaveTextContent("MA");
  },
};

export const ComFoto: Story = { name: "Com foto", args: { fotoUrl: FOTO } };

/** Uma foto que não carrega dá lugar às iniciais. */
export const FotoQueFalha: Story = {
  name: "Foto que falha",
  args: { nome: "Rafael Nunes", fotoUrl: "data:image/png;base64,invalida" },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(
      await tela.findByText("RN", undefined, { timeout: 3000 })
    ).toBeInTheDocument();
  },
};

export const Tamanhos: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <Avatar {...args} tamanho="sm" />
      <Avatar {...args} tamanho="md" />
      <Avatar {...args} tamanho="lg" />
      <Avatar {...args} tamanho="lg" fotoUrl={FOTO} />
    </div>
  ),
};

/** O topo do perfil: anel em degradê da marca e iniciais em âmbar no asfalto. */
export const ComAnel: Story = {
  name: "Com anel (perfil)",
  render: (args) => (
    <div className="flex items-center gap-6">
      <Avatar {...args} tamanho="2xl" anel />
      <Avatar {...args} tamanho="2xl" anel fotoUrl={FOTO} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [iniciais] = within(canvasElement).getAllByRole("img", {
      name: "Marina Duarte Alves",
    });
    await expect(iniciais).toHaveTextContent("MA");
  },
};
