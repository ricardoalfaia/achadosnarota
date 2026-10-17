import { useState } from "react";
import { SeletorDeTema, type Tema } from "@achados/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

function Demonstracao() {
  const [tema, setTema] = useState<Tema>("light");

  // Aqui o tema vale só para este cartão; na aplicação, vale para o <html>.
  return (
    <div
      data-theme={tema === "auto" ? undefined : tema}
      className="flex w-72 flex-col gap-3 rounded-card border border-border bg-surface p-4 text-foreground"
    >
      <span className="text-2xs font-bold tracking-wider text-foreground-muted uppercase">
        Tema do sistema
      </span>
      <SeletorDeTema valor={tema} aoMudar={setTema} />
    </div>
  );
}

const meta = { title: "Navegação/SeletorDeTema" } satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  name: "Padrão",
  render: () => <Demonstracao />,
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    const opcao = (name: string) => tela.getByRole("radio", { name });
    const cartao = canvasElement.querySelector("[data-theme]") as HTMLElement;

    await userEvent.click(opcao("Escuro"));
    await expect(opcao("Escuro")).toBeChecked();
    await expect(cartao).toHaveAttribute("data-theme", "dark");

    // Rádios nativos: a seta leva à próxima opção.
    await userEvent.keyboard("{ArrowRight}");
    await expect(opcao("Auto")).toBeChecked();
    await expect(canvasElement.querySelector("[data-theme]")).toBeNull();
  },
};
