import {
  BotaoDeMenu,
  IconeBaixar,
  IconeCopiar,
  IconeEditar,
  IconeLixeira,
  IconeMais,
  IconeMaisOpcoes,
  ItemDeMenu,
  SeparadorDeMenu,
} from "@achados/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

const aoEscolher = fn();

const meta = {
  title: "Ações/BotaoDeMenu",
  decorators: [
    (Story) => (
      <div className="pb-56">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

/** Botão de contorno que abre as opções de exportação. */
export const Padrao: Story = {
  name: "Padrão",
  render: () => (
    <BotaoDeMenu rotulo="Exportar" icone={<IconeBaixar />}>
      <ItemDeMenu aoEscolher={() => aoEscolher("excel")}>
        Excel (.xlsx)
      </ItemDeMenu>
      <ItemDeMenu aoEscolher={() => aoEscolher("csv")}>CSV</ItemDeMenu>
      <ItemDeMenu aoEscolher={() => aoEscolher("pdf")}>PDF</ItemDeMenu>
      <ItemDeMenu desabilitado>Word (.docx)</ItemDeMenu>
    </BotaoDeMenu>
  ),
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    const gatilho = tela.getByRole("button", { name: "Exportar" });
    aoEscolher.mockClear();

    // Seta para baixo abre e leva o foco ao primeiro item.
    gatilho.focus();
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() =>
      expect(
        tela.getByRole("menuitem", { name: "Excel (.xlsx)" })
      ).toHaveFocus()
    );
    await expect(gatilho).toHaveAttribute("aria-expanded", "true");

    // End pula o item desabilitado; Enter escolhe, fecha e devolve o foco.
    await userEvent.keyboard("{End}");
    await expect(tela.getByRole("menuitem", { name: "PDF" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(aoEscolher).toHaveBeenCalledWith("pdf");
    await expect(gatilho).toHaveFocus();
    await waitFor(() => expect(tela.queryByRole("menu")).toBeNull());

    // Esc fecha sem escolher.
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(tela.getByRole("menu")).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await expect(gatilho).toHaveAttribute("aria-expanded", "false");
    await expect(aoEscolher).toHaveBeenCalledTimes(1);
  },
};

/** A ação principal com alternativas: sólido que abre menu. */
export const Solido: Story = {
  name: "Sólido",
  render: () => (
    <BotaoDeMenu rotulo="Novo" icone={<IconeMais />} variante="solido">
      <ItemDeMenu>Documento</ItemDeMenu>
      <ItemDeMenu>Modelo</ItemDeMenu>
      <ItemDeMenu>Cliente</ItemDeMenu>
    </BotaoDeMenu>
  ),
};

/** Ações de uma linha de tabela: só o ícone, com item de perigo separado. */
export const AcoesDaLinha: Story = {
  name: "Ações da linha",
  render: () => (
    <div className="flex w-96 items-center justify-between rounded-card border border-border bg-surface px-4 py-3">
      <div className="flex flex-col">
        <span className="font-bold">Contrato Exemplo</span>
        <span className="font-mono text-sm text-foreground-muted">#04291</span>
      </div>
      <BotaoDeMenu
        rotulo="Ações do Contrato Exemplo"
        icone={<IconeMaisOpcoes />}
        somenteIcone
        variante="fantasma"
        alinhamento="fim"
      >
        <ItemDeMenu icone={<IconeEditar />}>Editar</ItemDeMenu>
        <ItemDeMenu icone={<IconeCopiar />}>Duplicar</ItemDeMenu>
        <SeparadorDeMenu />
        <ItemDeMenu icone={<IconeLixeira />} perigo>
          Inativar
        </ItemDeMenu>
      </BotaoDeMenu>
    </div>
  ),
};
