import { useState } from "react";
import { Checkbox } from "@achados/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Campos/Checkbox",
  component: Checkbox,
  args: { label: "Enviar lembretes de assinatura" },
} satisfies Meta<typeof Checkbox>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  name: "Padrão",
  play: async ({ canvasElement }) => {
    const caixa = within(canvasElement).getByRole("checkbox", {
      name: "Enviar lembretes de assinatura",
    });
    await expect(caixa).not.toBeChecked();
    await userEvent.click(caixa);
    await expect(caixa).toBeChecked();
    await userEvent.keyboard(" ");
    await expect(caixa).not.toBeChecked();
  },
};
export const Marcado: Story = { args: { marcadoInicial: true } };
export const ComDescricao: Story = {
  name: "Com descrição",
  args: {
    marcadoInicial: true,
    descricao: "Os signatários recebem um e-mail a cada 3 dias até assinar.",
  },
};
export const Indeterminado: Story = { args: { indeterminado: true } };
export const ComErro: Story = {
  name: "Com erro",
  args: { erro: "Confirme para continuar", required: true },
};
export const Desabilitado: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Checkbox {...args} desabilitado />
      <Checkbox {...args} desabilitado marcadoInicial />
    </div>
  ),
};

const DOCUMENTOS = [
  "Procuração",
  "Contrato de Prestação de Serviços",
  "Termo de Confidencialidade",
] as const;

function GrupoComTodos() {
  const [marcados, setMarcados] = useState<readonly string[]>([DOCUMENTOS[0]]);
  const todos = marcados.length === DOCUMENTOS.length;

  return (
    <div className="flex w-72 flex-col gap-3 rounded-card border border-border bg-surface p-4">
      <Checkbox
        label="Todos os documentos"
        marcado={todos}
        indeterminado={marcados.length > 0 && !todos}
        aoMudar={(marcar) => setMarcados(marcar ? DOCUMENTOS : [])}
      />
      <div className="flex flex-col gap-3 border-t border-border pt-3 pl-7">
        {DOCUMENTOS.map((documento) => (
          <Checkbox
            key={documento}
            label={documento}
            marcado={marcados.includes(documento)}
            aoMudar={(marcar) =>
              setMarcados(
                marcar
                  ? [...marcados, documento]
                  : marcados.filter((item) => item !== documento)
              )
            }
          />
        ))}
      </div>
    </div>
  );
}

/** "Todos" fica indeterminado enquanto só parte do grupo está marcada. */
export const Grupo: Story = {
  render: () => <GrupoComTodos />,
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    const todos = tela.getByRole<HTMLInputElement>("checkbox", {
      name: "Todos os documentos",
    });
    await expect(todos.indeterminate).toBe(true);
    await userEvent.click(todos);
    await expect(todos.indeterminate).toBe(false);
    for (const caixa of tela.getAllByRole("checkbox")) {
      await expect(caixa).toBeChecked();
    }
  },
};
