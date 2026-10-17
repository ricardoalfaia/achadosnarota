import { useState } from "react";
import { SeletorDeIdioma, type OpcaoDeIdioma } from "@meuproduto/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

type Idioma = "pt-BR" | "en" | "es";

const OPCOES: readonly OpcaoDeIdioma<Idioma>[] = [
  { valor: "pt-BR", nome: "Português", codigo: "PT" },
  { valor: "en", nome: "English", codigo: "EN" },
  { valor: "es", nome: "Español", codigo: "ES" },
];

function Demonstracao({
  opcoes = OPCOES.slice(0, 2),
  ocupado = false,
}: {
  opcoes?: readonly OpcaoDeIdioma<Idioma>[];
  ocupado?: boolean;
}) {
  const [idioma, setIdioma] = useState<Idioma>("pt-BR");

  return (
    <div className="flex w-72 flex-col gap-3 rounded-card border border-border bg-surface p-4 text-foreground">
      <span className="text-2xs font-bold tracking-wider text-foreground-muted uppercase">
        Idioma
      </span>
      <SeletorDeIdioma
        opcoes={opcoes}
        valor={idioma}
        aoMudar={setIdioma}
        ocupado={ocupado}
      />
    </div>
  );
}

const meta = { title: "Navegação/SeletorDeIdioma" } satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  name: "Padrão",
  render: () => <Demonstracao />,
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    const opcao = (name: string) => tela.getByRole("radio", { name });

    await expect(opcao("Português")).toBeChecked();
    await userEvent.click(opcao("English"));
    await expect(opcao("English")).toBeChecked();

    // Rádios nativos: a seta volta à opção anterior.
    await userEvent.keyboard("{ArrowLeft}");
    await expect(opcao("Português")).toBeChecked();
  },
};

export const TresIdiomas: Story = {
  name: "Três idiomas",
  render: () => <Demonstracao opcoes={OPCOES} />,
};

export const Ocupado: Story = {
  name: "Trocando de idioma",
  render: () => <Demonstracao ocupado />,
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByRole("radiogroup")).toHaveAttribute(
      "aria-busy",
      "true"
    );
    await expect(tela.getByRole("radio", { name: "English" })).toBeDisabled();
  },
};
