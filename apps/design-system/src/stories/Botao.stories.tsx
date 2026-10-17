import type { ReactNode } from "react";
import {
  Botao,
  BotaoDeIcone,
  IconeAtualizar,
  IconeBaixar,
  IconeCheck,
  IconeEditar,
  IconeFiltro,
  IconeLixeira,
  IconeMais,
  IconeSeta,
} from "@achados/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

const meta = {
  title: "Ações/Botao",
  component: Botao,
  args: { children: "Novo cadastro", onClick: fn() },
  argTypes: {
    variante: {
      control: "inline-radio",
      options: ["solido", "contorno", "suave", "flutuante", "fantasma"],
    },
    intencao: { control: "inline-radio", options: ["padrao", "perigo"] },
    tamanho: { control: "inline-radio", options: ["xs", "sm", "md", "lg"] },
  },
} satisfies Meta<typeof Botao>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  name: "Padrão",
  args: { icone: <IconeMais /> },
  play: async ({ args, canvasElement }) => {
    const botao = within(canvasElement).getByRole("button", {
      name: "Novo cadastro",
    });
    await userEvent.click(botao);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

function Linha({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-2xs font-bold tracking-wider text-foreground-muted uppercase">
        {titulo}
      </span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

/** As variantes, na intenção padrão e na de perigo. */
export const Variantes: Story = {
  render: () => (
    <div className="flex flex-col gap-8 rounded-card border border-border bg-surface p-6">
      <Linha titulo="Sólido: a ação principal">
        <Botao icone={<IconeCheck />}>Resgatar</Botao>
        <Botao icone={<IconeMais />}>Criar conta</Botao>
        <Botao intencao="perigo" icone={<IconeLixeira />}>
          Excluir conta
        </Botao>
      </Linha>
      <Linha titulo="Contorno: ações secundárias">
        <Botao variante="contorno" icone={<IconeBaixar />}>
          Exportar
        </Botao>
        <Botao variante="contorno" icone={<IconeFiltro />}>
          Filtros
        </Botao>
        <Botao variante="contorno" intencao="perigo" icone={<IconeLixeira />}>
          Inativar
        </Botao>
      </Linha>
      <Linha titulo="Suave: ação neutra sem borda">
        <Botao variante="suave">Voltar</Botao>
        <BotaoDeIcone
          variante="suave"
          rotulo="Notificações"
          icone={<IconeAtualizar />}
        />
      </Linha>
      <div className="flex flex-col gap-3 rounded-card bg-passport p-4">
        <span className="text-2xs font-bold tracking-wider text-white uppercase">
          Flutuante: sobre foto
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <BotaoDeIcone
            variante="flutuante"
            rotulo="Voltar"
            icone={<IconeSeta />}
          />
          <BotaoDeIcone
            variante="flutuante"
            rotulo="Favoritar"
            icone={<IconeMais />}
          />
          <Botao variante="flutuante">Ver fotos</Botao>
        </div>
      </div>
      <Linha titulo="Fantasma: ações de apoio">
        <Botao variante="fantasma">Cancelar</Botao>
        <Botao variante="fantasma" icone={<IconeAtualizar />}>
          Atualizar
        </Botao>
        <Botao variante="fantasma" intencao="perigo">
          Descartar alterações
        </Botao>
      </Linha>
    </div>
  ),
};

export const Tamanhos: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-3">
      {(["xs", "sm", "md", "lg"] as const).map((tamanho) => (
        <Botao key={tamanho} tamanho={tamanho} icone={<IconeMais />}>
          Tamanho {tamanho}
        </Botao>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const alturas = [...canvasElement.querySelectorAll("button")].map(
      (botao) => botao.getBoundingClientRect().height
    );
    await expect(alturas).toEqual([32, 40, 44, 52]);
  },
};

/** Ícone antes, ícone depois e só ícone; o ícone acompanha o tamanho do texto. */
export const ComIcones: Story = {
  name: "Com ícones",
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Botao icone={<IconeMais />}>Ícone antes</Botao>
        <Botao variante="contorno" iconeFinal={<IconeSeta />}>
          Ícone depois
        </Botao>
        <Botao
          variante="contorno"
          icone={<IconeBaixar />}
          iconeFinal={<IconeSeta />}
        >
          Os dois
        </Botao>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <BotaoDeIcone rotulo="Editar" icone={<IconeEditar />} />
        <BotaoDeIcone
          rotulo="Atualizar"
          icone={<IconeAtualizar />}
          variante="fantasma"
        />
        <BotaoDeIcone
          rotulo="Novo cadastro"
          icone={<IconeMais />}
          variante="solido"
        />
        <BotaoDeIcone
          rotulo="Excluir"
          icone={<IconeLixeira />}
          intencao="perigo"
        />
        <BotaoDeIcone rotulo="Editar" icone={<IconeEditar />} tamanho="xs" />
        <BotaoDeIcone
          rotulo="Excluir"
          icone={<IconeLixeira />}
          tamanho="xs"
          intencao="perigo"
        />
      </div>
    </div>
  ),
};

export const Estados: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Botao carregando>Salvando</Botao>
      <Botao variante="contorno" carregando>
        Exportando
      </Botao>
      <Botao desabilitado icone={<IconeCheck />}>
        Salvar
      </Botao>
      <Botao variante="contorno" desabilitado>
        Exportar
      </Botao>
      <Botao variante="fantasma" desabilitado>
        Cancelar
      </Botao>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const salvando = within(canvasElement).getByRole("button", {
      name: "Salvando",
    });
    await expect(salvando).toBeDisabled();
    await expect(salvando).toHaveAttribute("aria-busy", "true");
  },
};

/** O rodapé de um formulário: fantasma para cancelar, sólido para salvar. */
export const RodapeDeFormulario: Story = {
  name: "Rodapé de formulário",
  render: () => (
    <div className="flex w-[32rem] items-center justify-between gap-3 rounded-card border border-border bg-surface p-4">
      <Botao variante="fantasma" intencao="perigo" icone={<IconeLixeira />}>
        Excluir
      </Botao>
      <div className="flex gap-2">
        <Botao variante="fantasma">Cancelar</Botao>
        <Botao type="submit" icone={<IconeCheck />}>
          Salvar alterações
        </Botao>
      </div>
    </div>
  ),
};
