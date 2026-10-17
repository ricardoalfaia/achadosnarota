import { useState } from "react";
import {
  Acordeao,
  Alerta,
  Botao,
  BotaoDeIcone,
  CabecalhoDoCartao,
  Cartao,
  CorpoDoCartao,
  Dica,
  Esqueleto,
  EsqueletoDeTexto,
  IconeAtualizar,
  IconeBaixar,
  IconeEditar,
  ItemDoAcordeao,
  RodapeDoCartao,
} from "@meuproduto/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = { title: "Conteúdo/Superfícies" } satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const CartaoCompleto: Story = {
  name: "Cartão",
  render: () => (
    <div className="grid max-w-3xl gap-6 md:grid-cols-2">
      <Cartao>
        <CabecalhoDoCartao
          titulo="Cliente Exemplo Ltda."
          descricao="Pessoa jurídica · Cliente desde 2024"
          acoes={
            <BotaoDeIcone
              rotulo="Editar cliente"
              icone={<IconeEditar />}
              variante="fantasma"
              tamanho="xs"
            />
          }
        />
        <CorpoDoCartao>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs text-foreground-muted">Documentos</dt>
              <dd className="font-mono text-xl font-bold">48</dd>
            </div>
            <div>
              <dt className="text-xs text-foreground-muted">
                Aguardando assinatura
              </dt>
              <dd className="font-mono text-xl font-bold">3</dd>
            </div>
          </dl>
        </CorpoDoCartao>
        <RodapeDoCartao>
          <Botao variante="fantasma">Ver histórico</Botao>
          <Botao variante="contorno" icone={<IconeBaixar />}>
            Exportar
          </Botao>
        </RodapeDoCartao>
      </Cartao>
      <Cartao elevado>
        <CorpoDoCartao>
          <p className="text-xs text-foreground-muted">Cartão elevado</p>
          <p className="mt-1">
            Só o corpo, com sombra, para o que flutua sobre o conteúdo.
          </p>
        </CorpoDoCartao>
      </Cartao>
    </div>
  ),
};

function AlertaQueFecha() {
  const [visivel, setVisivel] = useState(true);
  return visivel ? (
    <Alerta
      intencao="sucesso"
      titulo="Cadastro salvo"
      aoFechar={() => setVisivel(false)}
    >
      As alterações do Cliente Exemplo Ltda. já estão valendo.
    </Alerta>
  ) : (
    <Botao variante="contorno" onClick={() => setVisivel(true)}>
      Mostrar de novo
    </Botao>
  );
}

export const Alertas: Story = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-3">
      <Alerta titulo="Assinaturas em sincronização">
        O status das assinaturas é atualizado a cada 15 minutos.
      </Alerta>
      <AlertaQueFecha />
      <Alerta intencao="atencao" titulo="Créditos de assinatura acabando">
        Restam 8% dos créditos de assinatura do plano.
      </Alerta>
      <Alerta
        intencao="erro"
        titulo="Não foi possível gerar o documento"
        acoes={
          <Botao variante="contorno" tamanho="xs" icone={<IconeAtualizar />}>
            Tentar de novo
          </Botao>
        }
      >
        O serviço de geração não respondeu. Nenhum dado foi alterado.
      </Alerta>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await userEvent.click(tela.getByRole("button", { name: "Fechar aviso" }));
    await expect(tela.queryByText("Cadastro salvo")).toBeNull();
  },
};

export const Acordeoes: Story = {
  name: "Acordeão",
  render: () => (
    <Acordeao abertosInicialmente={["prazos"]} className="max-w-xl">
      <ItemDoAcordeao valor="prazos" titulo="Prazos e validade">
        Os signatários têm 15 dias para assinar; o documento vale por 12 meses a
        partir da última assinatura.
      </ItemDoAcordeao>
      <ItemDoAcordeao valor="regras" titulo="Regras de aprovação">
        O modelo passa por revisão interna e só gera documentos depois de
        aprovado por quem é responsável pela pasta.
      </ItemDoAcordeao>
      <ItemDoAcordeao valor="historico" titulo="Histórico" desabilitado>
        Sem alterações registradas.
      </ItemDoAcordeao>
    </Acordeao>
  ),
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    const prazos = tela.getByRole("button", { name: "Prazos e validade" });
    const regras = tela.getByRole("button", {
      name: "Regras de aprovação",
    });
    await expect(prazos).toHaveAttribute("aria-expanded", "true");

    // No tipo único, abrir uma seção fecha a outra.
    await userEvent.click(regras);
    await expect(regras).toHaveAttribute("aria-expanded", "true");
    await expect(prazos).toHaveAttribute("aria-expanded", "false");
  },
};

export const Esqueletos: Story = {
  name: "Esqueleto",
  render: () => (
    <Cartao className="max-w-sm">
      <CorpoDoCartao className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Esqueleto className="size-10 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Esqueleto className="h-4 w-40" />
            <Esqueleto className="h-3 w-24" />
          </div>
        </div>
        <EsqueletoDeTexto linhas={3} />
        <Esqueleto className="h-control-sm w-28 rounded-control" />
      </CorpoDoCartao>
    </Cartao>
  ),
};

export const Dicas: Story = {
  name: "Dica",
  render: () => (
    <div className="flex gap-4 p-16">
      <Dica texto="Atualiza o status das assinaturas agora">
        <BotaoDeIcone rotulo="Atualizar" icone={<IconeAtualizar />} />
      </Dica>
      <Dica texto="Gera o arquivo no layout do cliente" lado="baixo">
        <Botao variante="contorno" icone={<IconeBaixar />}>
          Exportar
        </Botao>
      </Dica>
      <Dica texto="À direita" lado="direita">
        <Botao variante="fantasma">Outro lado</Botao>
      </Dica>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    const botao = tela.getByRole("button", { name: "Exportar" });

    // Pelo teclado a dica aparece na hora e Esc a esconde.
    botao.focus();
    const dica = await tela.findByRole("tooltip");
    await expect(dica).toHaveTextContent("layout do cliente");
    await expect(botao).toHaveAttribute("aria-describedby", dica.id);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(tela.queryByRole("tooltip")).toBeNull());
  },
};
