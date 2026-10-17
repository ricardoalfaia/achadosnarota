import { useState } from "react";
import { CampoDeBusca } from "@meuproduto/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Campos/CampoDeBusca",
  component: CampoDeBusca,
  args: {
    rotulo: "Buscar documentos, clientes ou modelos",
    placeholder: "Buscar documentos, clientes ou modelos...",
    className: "max-w-xl",
  },
} satisfies Meta<typeof CampoDeBusca>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  name: "Padrão",
  play: async ({ canvasElement }) => {
    const campo = within(canvasElement).getByRole("searchbox", {
      name: "Buscar documentos, clientes ou modelos",
    });
    await userEvent.type(campo, "contrato");
    await expect(campo).toHaveValue("contrato");
  },
};

export const ComAtalho: Story = {
  name: "Com atalho",
  args: { atalho: "Ctrl K" },
  play: async ({ canvasElement }) => {
    const campo = within(canvasElement).getByRole("searchbox");
    await expect(campo).toHaveAttribute("aria-keyshortcuts", "Control+K");
  },
};

export const Desabilitado: Story = { args: { disabled: true } };

function Controlado() {
  const [termo, setTermo] = useState("procuração");
  return (
    <div className="flex max-w-xl flex-col gap-3">
      <CampoDeBusca
        rotulo="Buscar modelos"
        value={termo}
        onChange={(evento) => setTermo(evento.target.value)}
        atalho="/"
      />
      <p className="text-sm text-foreground-muted">
        Termo: <span className="font-mono">{termo || "(vazio)"}</span>
      </p>
    </div>
  );
}

/** Controlado pelo estado de quem usa, como um input comum. */
export const ModoControlado: Story = {
  name: "Controlado",
  render: () => <Controlado />,
};
