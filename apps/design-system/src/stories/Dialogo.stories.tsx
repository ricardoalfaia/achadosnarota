import { useState } from "react";
import {
  Botao,
  CampoDeTexto,
  Dialogo,
  DialogoDeConfirmacao,
  DialogoDeExclusao,
  IconeCheck,
  IconeLixeira,
} from "@achados/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { QrCode } from "lucide-react";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = { title: "Conteúdo/Dialogo" } satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

function Confirmacao() {
  const [aberto, setAberto] = useState(false);
  const [resultado, setResultado] = useState("Nenhuma ação ainda.");

  return (
    <div className="flex flex-col items-start gap-3">
      <Botao
        intencao="perigo"
        variante="contorno"
        icone={<IconeLixeira />}
        onClick={() => setAberto(true)}
      >
        Arquivar documento
      </Botao>
      <p className="text-sm text-foreground-muted">{resultado}</p>
      <DialogoDeConfirmacao
        aberto={aberto}
        titulo="Arquivar o Contrato Exemplo?"
        descricao="O documento sai da lista de pendências e deixa de receber assinaturas. O histórico é mantido."
        rotuloDeConfirmar="Arquivar documento"
        perigo
        aoCancelar={() => {
          setAberto(false);
          setResultado("Cancelado.");
        }}
        aoConfirmar={() => {
          setAberto(false);
          setResultado("Documento arquivado.");
        }}
      />
    </div>
  );
}

/** Pergunta antes de uma ação que não dá para desfazer. O foco começa em Cancelar. */
export const DeConfirmacao: Story = {
  name: "De confirmação",
  render: () => <Confirmacao />,
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    const abrir = tela.getByRole("button", { name: "Arquivar documento" });

    await userEvent.click(abrir);
    const dialogo = await tela.findByRole("dialog");
    const dentro = within(dialogo);
    await waitFor(() =>
      expect(dentro.getByRole("button", { name: "Cancelar" })).toHaveFocus()
    );

    // Esc cancela e o foco volta para quem abriu.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(tela.queryByRole("dialog")).toBeNull());
    await expect(tela.getByText("Cancelado.")).toBeVisible();
    await waitFor(() => expect(abrir).toHaveFocus());

    await userEvent.click(abrir);
    await userEvent.click(
      within(await tela.findByRole("dialog")).getByRole("button", {
        name: "Arquivar documento",
      })
    );
    await expect(tela.getByText("Documento arquivado.")).toBeVisible();
  },
};

function Formulario() {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <Botao onClick={() => setAberto(true)}>Sugerir lugar</Botao>
      <Dialogo
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo="Sugerir um lugar"
        descricao="A curadoria visita antes de qualquer publicação."
        rodape={
          <>
            <Botao variante="fantasma" onClick={() => setAberto(false)}>
              Cancelar
            </Botao>
            <Botao icone={<IconeCheck />} onClick={() => setAberto(false)}>
              Enviar sugestão
            </Botao>
          </>
        }
      >
        <div className="flex flex-col gap-4 pt-2">
          <CampoDeTexto label="Nome do lugar" tamanho="md" />
          <CampoDeTexto label="Cidade" tamanho="md" />
        </div>
      </Dialogo>
    </>
  );
}

/** Janela com conteúdo livre e ações no rodapé. */
export const ComFormulario: Story = {
  name: "Com formulário",
  render: () => <Formulario />,
};

function Exclusao({ falhar = false }: { falhar?: boolean }) {
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string>();
  const [resultado, setResultado] = useState("Nada foi excluído.");

  function excluir() {
    setCarregando(true);
    setErro(undefined);
    // Simula a chamada ao servidor.
    setTimeout(() => {
      setCarregando(false);
      if (falhar) {
        setErro("O servidor não respondeu. Nada foi apagado; tente de novo.");
        return;
      }
      setAberto(false);
      setResultado("Cliente Exemplo Ltda. excluído.");
    }, 600);
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <Botao
        intencao="perigo"
        icone={<IconeLixeira />}
        onClick={() => setAberto(true)}
      >
        Excluir cliente
      </Botao>
      <p className="text-sm text-foreground-muted">{resultado}</p>
      <DialogoDeExclusao
        aberto={aberto}
        nome="o Cliente Exemplo Ltda."
        espera={1}
        carregando={carregando}
        erro={erro}
        aoCancelar={() => {
          setAberto(false);
          setErro(undefined);
        }}
        aoExcluir={excluir}
      >
        <p>Ao excluir este cliente, o sistema apaga de forma permanente:</p>
        <ul className="list-disc pl-5 text-foreground-muted">
          <li>o cadastro e os contatos do cliente;</li>
          <li>os 12 documentos e todas as versões;</li>
          <li>o histórico de 1.284 eventos de auditoria.</li>
        </ul>
        <p>Se a intenção é só tirar o cliente de uso, prefira inativar.</p>
      </DialogoDeExclusao>
    </div>
  );
}

/**
 * Exclusão em duas confirmações: a frase digitada e, em outra caixa, o Excluir
 * final, que fica bloqueado por alguns segundos.
 */
export const DeExclusao: Story = {
  name: "De exclusão",
  render: () => <Exclusao />,
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await userEvent.click(
      tela.getByRole("button", { name: "Excluir cliente" })
    );
    const dialogo = within(await tela.findByRole("dialog"));
    const campo = dialogo.getByLabelText("Frase de confirmação");
    const continuar = dialogo.getByRole("button", { name: "Continuar" });
    await waitFor(() => expect(campo).toHaveFocus());

    // Colar não vale, e uma frase quase certa não libera.
    await userEvent.paste("confirmo a exclusão");
    await expect(campo).toHaveValue("");
    await userEvent.type(campo, "confirmo a exclusa");
    await expect(continuar).toBeDisabled();
    await userEvent.type(campo, "o");
    await expect(continuar).toBeEnabled();

    // Segunda caixa: o foco vai para Voltar e o Excluir começa bloqueado.
    await userEvent.click(continuar);
    await expect(
      dialogo.getByRole("heading", { name: "Excluir definitivamente?" })
    ).toBeVisible();
    await waitFor(() =>
      expect(dialogo.getByRole("button", { name: "Voltar" })).toHaveFocus()
    );
    await expect(
      dialogo.getByRole("button", { name: /Excluir em/ })
    ).toBeDisabled();
    await expect(tela.getByText("Nada foi excluído.")).toBeInTheDocument();

    const excluir = await dialogo.findByRole(
      "button",
      { name: "Excluir" },
      { timeout: 3000 }
    );
    await userEvent.click(excluir);
    await waitFor(
      () =>
        expect(tela.getByText("Cliente Exemplo Ltda. excluído.")).toBeVisible(),
      { timeout: 3000 }
    );
  },
};

/** Quando a exclusão falha, a segunda caixa mostra o motivo e permite tentar de novo. */
export const DeExclusaoComFalha: Story = {
  name: "De exclusão com falha",
  render: () => <Exclusao falhar />,
};

function Cartao({ tema }: { tema?: "light" | "dark" }) {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <Botao onClick={() => setAberto(true)}>Resgatar</Botao>
      <Dialogo
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        variante="cartao"
        tamanho="sm"
        {...(tema ? { tema } : {})}
        icone={<QrCode />}
        titulo="10% de desconto no almoço"
        descricao="Rancho Português • Pindamonhangaba - SP"
        rodape={
          <Botao variante="contorno" onClick={() => setAberto(false)}>
            Entendi
          </Botao>
        }
      >
        <p className="rounded-2xl border border-border bg-surface-raised p-3 text-left text-xs">
          Regras: válido de segunda a sexta. Apresente o cupom no local.
        </p>
      </Dialogo>
    </>
  );
}

/** O modal do app: ícone, título e conteúdo centralizados, fechar no canto. */
export const VarianteCartao: Story = {
  name: "Cartão",
  render: () => <Cartao />,
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement.ownerDocument.body);
    await userEvent.click(tela.getByRole("button", { name: "Resgatar" }));
    const dialogo = await tela.findByRole("dialog", {
      name: "10% de desconto no almoço",
    });
    await expect(dialogo).toHaveTextContent("Regras");
    await userEvent.click(
      within(dialogo).getByRole("button", { name: "Fechar" })
    );
    await waitFor(() =>
      expect(tela.queryByRole("dialog")).not.toBeInTheDocument()
    );
  },
};

/** O mesmo cartão forçado no tema escuro, como o leitor de QR Code. */
export const VarianteCartaoEscuro: Story = {
  name: "Cartão escuro",
  render: () => <Cartao tema="dark" />,
};
