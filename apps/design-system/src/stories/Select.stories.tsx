import { CampoSkeleton, Select, type Opcao } from "@achados/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

const PASTAS: Opcao[] = [
  { valor: "contratos", label: "Contratos comerciais", descricao: "Padrão" },
  { valor: "procuracoes", label: "Procurações" },
  {
    valor: "confidencialidade",
    label: "Confidencialidade",
    descricao: "Acesso restrito",
  },
  { valor: "arquivo", label: "Arquivo morto", desabilitada: true },
];

const meta = {
  title: "Campos/Select",
  component: Select,
  args: { label: "Pasta", opcoes: PASTAS },
  decorators: [
    (Story) => (
      <div className="max-w-sm pb-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Padrao: Story = { name: "Padrão" };
export const ComValor: Story = {
  name: "Com valor",
  args: { valorInicial: "contratos" },
};
export const Pesquisavel: Story = {
  name: "Pesquisável",
  args: { pesquisavel: true, placeholderDaBusca: "Buscar pasta" },
};
export const ComAjuda: Story = {
  name: "Com ajuda",
  args: { ajuda: "Define onde o documento fica guardado." },
};
export const ComErro: Story = {
  name: "Com erro",
  args: { erro: "Escolha uma pasta" },
};
export const Desabilitado: Story = {
  args: { desabilitado: true, valorInicial: "procuracoes" },
};
export const Carregando: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <CampoSkeleton tamanho="sm" />
      <CampoSkeleton tamanho="md" />
      <CampoSkeleton />
    </div>
  ),
};

/** As três alturas, vazias e com valor: em sm e md o label flutua sobre a borda. */
export const Tamanhos: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-4">
      {(["sm", "md", "lg"] as const).map((tamanho) => (
        <div key={tamanho} className="contents" data-tamanho={tamanho}>
          <Select {...args} tamanho={tamanho} label={`Pasta (${tamanho})`} />
          <Select
            {...args}
            tamanho={tamanho}
            label={`Pasta (${tamanho})`}
            valorInicial="contratos"
          />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const alturas = [...canvasElement.querySelectorAll("label")].map(
      (campo) => campo.getBoundingClientRect().height
    );
    await expect(alturas).toEqual([40, 40, 44, 44, 52, 52]);
  },
};

/** Abre e fecha com animação; a lista só sai do DOM depois da animação de saída. */
export const AbrirEFechar: Story = {
  name: "Abrir e fechar",
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    const campo = tela.getByRole("combobox");
    campo.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(tela.getByRole("listbox")).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await expect(campo).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(tela.queryByRole("listbox")).toBeNull());
  },
};
