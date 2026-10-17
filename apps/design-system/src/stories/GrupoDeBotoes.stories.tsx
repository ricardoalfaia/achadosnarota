import {
  Botao,
  BotaoDeIcone,
  BotaoDeMenu,
  GrupoDeBotoes,
  IconeAtualizar,
  IconeBaixar,
  IconeCheck,
  IconeCopiar,
  IconeEditar,
  IconeSeta,
  ItemDeMenu,
  RotuloDeMenu,
  SeparadorDeMenu,
} from "@achados/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = { title: "Ações/GrupoDeBotoes" } satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  name: "Padrão",
  render: () => (
    <GrupoDeBotoes rotulo="Ações do cadastro">
      <Botao variante="contorno" icone={<IconeEditar />}>
        Editar
      </Botao>
      <Botao variante="contorno" icone={<IconeCopiar />}>
        Duplicar
      </Botao>
      <Botao variante="contorno" icone={<IconeBaixar />}>
        Exportar
      </Botao>
    </GrupoDeBotoes>
  ),
};

export const SoIcones: Story = {
  name: "Só ícones",
  render: () => (
    <GrupoDeBotoes rotulo="Ferramentas da grade">
      <BotaoDeIcone rotulo="Atualizar" icone={<IconeAtualizar />} />
      <BotaoDeIcone rotulo="Copiar" icone={<IconeCopiar />} />
      <BotaoDeIcone rotulo="Exportar" icone={<IconeBaixar />} />
    </GrupoDeBotoes>
  ),
};

/** Botão dividido: a ação mais usada à esquerda e as variações no menu da seta. */
export const Dividido: Story = {
  render: () => (
    <div className="flex gap-6 pt-56">
      <GrupoDeBotoes>
        <Botao variante="contorno">Marcar como lida</Botao>
        <BotaoDeMenu
          rotulo="Mais ações"
          icone={<IconeSeta />}
          somenteIcone
          lado="cima"
          alinhamento="fim"
        >
          <RotuloDeMenu>Ações rápidas</RotuloDeMenu>
          <ItemDeMenu>Silenciar conversa</ItemDeMenu>
          <ItemDeMenu>Marcar como lida</ItemDeMenu>
          <ItemDeMenu>Bloquear usuário</ItemDeMenu>
          <SeparadorDeMenu />
          <ItemDeMenu perigo>Excluir conversa</ItemDeMenu>
        </BotaoDeMenu>
      </GrupoDeBotoes>
      <GrupoDeBotoes>
        <Botao icone={<IconeCheck />}>Salvar</Botao>
        <BotaoDeMenu
          rotulo="Outras formas de salvar"
          icone={<IconeSeta />}
          somenteIcone
          variante="solido"
          lado="cima"
          alinhamento="fim"
        >
          <ItemDeMenu>Salvar e criar outro</ItemDeMenu>
          <ItemDeMenu>Salvar como rascunho</ItemDeMenu>
        </BotaoDeMenu>
      </GrupoDeBotoes>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await userEvent.click(tela.getByRole("button", { name: "Mais ações" }));
    await waitFor(() =>
      expect(
        tela.getByRole("menuitem", { name: "Excluir conversa" })
      ).toBeVisible()
    );
  },
};
