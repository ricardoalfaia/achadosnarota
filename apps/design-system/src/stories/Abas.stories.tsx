import type { ReactNode } from "react";
import { Aba, Abas, CampoDeTexto, ListaDeAbas, PainelDaAba } from "@achados/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

function Icone({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4"
    >
      <path d={d} />
    </svg>
  );
}

const ICONES = {
  geral: "M3 3h10v10H3zM3 6.5h10M6.5 6.5V13",
  signatarios: "M4 12 12 4M5 5.5a1 1 0 1 0 0-.01M11 10.5a1 1 0 1 0 0-.01",
  regras: "M8 2 3 4v4c0 3 2.2 5 5 6 2.8-1 5-3 5-6V4z",
  historico: "M8 4v4l2.5 1.5M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2",
} as const;

function Conteudo({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <p className="text-foreground-muted">{children}</p>
    </div>
  );
}

const meta = {
  title: "Navegação/Abas",
  decorators: [
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

/** Abas de formulário, como no cadastro do protótipo: ícone, contador e aba bloqueada. */
export const Linha: Story = {
  render: () => (
    <Abas valorInicial="geral">
      <ListaDeAbas rotulo="Cadastro do documento">
        <Aba valor="geral" icone={<Icone d={ICONES.geral} />}>
          Dados gerais
        </Aba>
        <Aba
          valor="signatarios"
          icone={<Icone d={ICONES.signatarios} />}
          contador={3}
        >
          Signatários
        </Aba>
        <Aba valor="regras" icone={<Icone d={ICONES.regras} />}>
          Revisão
        </Aba>
        <Aba
          valor="historico"
          icone={<Icone d={ICONES.historico} />}
          desabilitada
        >
          Histórico
        </Aba>
      </ListaDeAbas>
      <PainelDaAba valor="geral">
        <Conteudo>Cliente, modelo de origem, pasta e responsável.</Conteudo>
      </PainelDaAba>
      <PainelDaAba valor="signatarios">
        <Conteudo>
          Ordem de assinatura, nome e e-mail de cada signatário.
        </Conteudo>
      </PainelDaAba>
      <PainelDaAba valor="regras">
        <Conteudo>Aprovação interna e regras de confidencialidade.</Conteudo>
      </PainelDaAba>
    </Abas>
  ),
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    const aba = (name: string | RegExp) => tela.getByRole("tab", { name });

    await userEvent.click(aba("Dados gerais"));
    await userEvent.keyboard("{ArrowRight}");
    await expect(aba(/Signatários/)).toHaveAttribute("aria-selected", "true");
    await expect(aba(/Signatários/)).toHaveFocus();
    await expect(tela.getByRole("tabpanel")).toHaveTextContent(
      "Ordem de assinatura"
    );

    // A aba desabilitada é pulada: End vai para a última habilitada.
    await userEvent.keyboard("{End}");
    await expect(aba("Revisão")).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowRight}");
    await expect(aba("Dados gerais")).toHaveAttribute("aria-selected", "true");
  },
};

/**
 * As abas do cadastro do protótipo: sobre a faixa cinza, a ativa fica branca
 * com a linha azul embaixo, e o painel entra descendo.
 */
export const Formulario: Story = {
  name: "Formulário",
  render: () => (
    <div className="overflow-hidden rounded-card border border-border bg-surface">
      <Abas valorInicial="geral" variante="formulario">
        <ListaDeAbas rotulo="Seções do cadastro">
          <Aba valor="geral" icone={<Icone d={ICONES.geral} />}>
            1. Dados Gerais e Identificação
          </Aba>
          <Aba valor="signatarios" icone={<Icone d={ICONES.signatarios} />}>
            2. Signatários e Ordem de Assinatura
          </Aba>
          <Aba valor="regras" icone={<Icone d={ICONES.regras} />}>
            3. Revisão e Aprovação
          </Aba>
          <Aba valor="historico" icone={<Icone d={ICONES.historico} />}>
            4. Histórico e Auditoria
          </Aba>
        </ListaDeAbas>
        <PainelDaAba valor="geral" className="p-6">
          <p className="text-foreground-muted">
            Cliente, modelo de origem, pasta e responsável.
          </p>
        </PainelDaAba>
        <PainelDaAba valor="signatarios" className="p-6">
          <p className="text-foreground-muted">
            Ordem de assinatura, nome e e-mail de cada signatário.
          </p>
        </PainelDaAba>
        <PainelDaAba valor="regras" className="p-6">
          <p className="text-foreground-muted">
            Aprovação interna e regras de confidencialidade.
          </p>
        </PainelDaAba>
        <PainelDaAba valor="historico" className="p-6">
          <p className="text-foreground-muted">
            Linha do tempo das alterações.
          </p>
        </PainelDaAba>
      </Abas>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await userEvent.click(
      tela.getByRole("tab", { name: /Signatários e Ordem/ })
    );
    await expect(
      tela.getByRole("tab", { name: /Signatários e Ordem/ })
    ).toHaveAttribute("aria-selected", "true");
    await expect(tela.getByRole("tabpanel")).toHaveTextContent(
      "Ordem de assinatura"
    );
  },
};

/** Alternância compacta de visão, para filtros e barras de ferramentas. */
export const Pilula: Story = {
  name: "Pílula",
  render: () => (
    <Abas valorInicial="todos" variante="pilula">
      <ListaDeAbas rotulo="Situação dos documentos">
        <Aba valor="todos" contador={54}>
          Todos
        </Aba>
        <Aba valor="assinados" contador={48}>
          Assinados
        </Aba>
        <Aba valor="revisao" contador={6}>
          Em revisão
        </Aba>
      </ListaDeAbas>
      <PainelDaAba valor="todos">
        <Conteudo>54 documentos.</Conteudo>
      </PainelDaAba>
      <PainelDaAba valor="assinados">
        <Conteudo>48 documentos assinados.</Conteudo>
      </PainelDaAba>
      <PainelDaAba valor="revisao">
        <Conteudo>6 documentos aguardando revisão.</Conteudo>
      </PainelDaAba>
    </Abas>
  ),
};

/**
 * Com `manterEstado`, o painel de uma aba já visitada continua vivo quando ela
 * sai da tela: o que foi digitado, filtrado ou rolado está lá na volta.
 */
export const MantendoOEstado: Story = {
  name: "Mantendo o estado",
  render: () => (
    <Abas valorInicial="geral" manterEstado>
      <ListaDeAbas rotulo="Cadastro do documento">
        <Aba valor="geral">Dados gerais</Aba>
        <Aba valor="signatarios">Signatários</Aba>
      </ListaDeAbas>
      <PainelDaAba valor="geral">
        <CampoDeTexto
          label="Título do documento"
          tamanho="md"
          className="max-w-sm"
        />
      </PainelDaAba>
      <PainelDaAba valor="signatarios">
        <CampoDeTexto label="Signatário" tamanho="md" className="max-w-sm" />
      </PainelDaAba>
    </Abas>
  ),
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await userEvent.type(
      tela.getByLabelText("Título do documento"),
      "Contrato Exemplo"
    );

    await userEvent.click(tela.getByRole("tab", { name: "Signatários" }));
    await waitFor(() =>
      expect(tela.getByLabelText("Signatário")).toBeVisible()
    );
    // O painel anterior saiu da tela, mas continua montado.
    await expect(tela.queryAllByRole("tabpanel")).toHaveLength(1);

    await userEvent.click(tela.getByRole("tab", { name: "Dados gerais" }));
    await expect(tela.getByLabelText("Título do documento")).toHaveValue(
      "Contrato Exemplo"
    );
  },
};

/** Pílulas que dividem a largura toda: o filtro de cupons do passaporte. */
export const Segmentos: Story = {
  render: () => (
    <div className="max-w-sm">
      <Abas valorInicial="disponiveis" variante="segmentos">
        <ListaDeAbas rotulo="Filtrar cupons">
          <Aba valor="disponiveis">Disponíveis (3)</Aba>
          <Aba valor="utilizados">Utilizados (12)</Aba>
          <Aba valor="expirados">Expirados (2)</Aba>
        </ListaDeAbas>
        <PainelDaAba valor="disponiveis">
          <Conteudo>Cupons que você pode usar agora.</Conteudo>
        </PainelDaAba>
        <PainelDaAba valor="utilizados">
          <Conteudo>Cupons já validados pelos estabelecimentos.</Conteudo>
        </PainelDaAba>
        <PainelDaAba valor="expirados">
          <Conteudo>Cupons que passaram da validade.</Conteudo>
        </PainelDaAba>
      </Abas>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await userEvent.click(tela.getByRole("tab", { name: "Utilizados (12)" }));
    await expect(tela.getByRole("tabpanel")).toHaveTextContent(
      "validados pelos estabelecimentos"
    );
  },
};
