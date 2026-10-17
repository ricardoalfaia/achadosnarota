import { useState } from "react";
import {
  BotaoDeIcone,
  CampoDeTexto,
  IconeBusca,
  IconeCopiar,
  IconeFechar,
} from "@meuproduto/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Campos/CampoDeTexto",
  component: CampoDeTexto,
  args: { label: "Título do documento" },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CampoDeTexto>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  name: "Padrão",
  play: async ({ canvasElement }) => {
    const campo = within(canvasElement).getByLabelText("Título do documento");
    await userEvent.type(campo, "Contrato de Prestação de Serviços");
    await expect(campo).toHaveValue("Contrato de Prestação de Serviços");
  },
};
export const ComValor: Story = {
  name: "Com valor",
  args: { valorInicial: "Contrato de Prestação de Serviços" },
};
export const ComAjuda: Story = {
  name: "Com ajuda",
  args: { ajuda: "Como aparece para o cliente.", valorInicial: "Procuração" },
};
export const ComErro: Story = {
  name: "Com erro",
  args: { erro: "Informe o título do documento", required: true },
};
export const Desabilitado: Story = {
  args: {
    desabilitado: true,
    valorInicial: "Contrato de Prestação de Serviços",
  },
};

export const Tamanhos: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((tamanho) => (
        <CampoDeTexto
          key={tamanho}
          {...args}
          tamanho={tamanho}
          label={`Título do documento (${tamanho})`}
          valorInicial="Contrato de Prestação de Serviços"
        />
      ))}
    </div>
  ),
};

function Busca() {
  const [busca, setBusca] = useState("Procuração");
  return (
    <CampoDeTexto
      label="Buscar cadastro"
      tipo="search"
      tamanho="md"
      valor={busca}
      aoMudar={setBusca}
      prefixo={<IconeBusca />}
      sufixo={
        busca && (
          <BotaoDeIcone
            rotulo="Limpar busca"
            icone={<IconeFechar />}
            variante="fantasma"
            tamanho="xs"
            onClick={() => setBusca("")}
          />
        )
      }
    />
  );
}

/** Prefixo e sufixo formam os grupos de entrada: unidade, ícone ou ação no fim. */
export const GruposDeEntrada: Story = {
  name: "Grupos de entrada",
  render: () => (
    <div className="flex flex-col gap-4">
      <CampoDeTexto
        label="Valor do contrato"
        prefixo="R$"
        modoDeEntrada="decimal"
        valorInicial="12.500,00"
      />
      <CampoDeTexto
        label="Multa por rescisão"
        sufixo="%"
        modoDeEntrada="decimal"
        valorInicial="10,00"
        tamanho="md"
      />
      <Busca />
      <CampoDeTexto
        label="Código do documento"
        valorInicial="DOC-04291"
        somenteLeitura
        tamanho="sm"
        sufixo={
          <BotaoDeIcone
            rotulo="Copiar código"
            icone={<IconeCopiar />}
            variante="fantasma"
            tamanho="xs"
          />
        }
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await userEvent.click(tela.getByRole("button", { name: "Limpar busca" }));
    await expect(tela.getByLabelText("Buscar cadastro")).toHaveValue("");
  },
};
