import { useState } from "react";
import { ZonaDeArquivo, type RecusaDeArquivo } from "@achados/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

const DEZ_MB = 10 * 1024 * 1024;

const meta = {
  title: "Campos/ZonaDeArquivo",
  component: ZonaDeArquivo,
  args: {
    rotulo: "Envie o documento assinado",
    descricao: "PDF de até 10 MB. Arraste para cá ou escolha no computador.",
    aceitar: ["application/pdf", ".pdf"],
    tamanhoMaximoEmBytes: DEZ_MB,
    aoEscolher: fn(),
    aoRecusar: fn(),
    className: "max-w-lg",
  },
} satisfies Meta<typeof ZonaDeArquivo>;
export default meta;

type Story = StoryObj<typeof meta>;

const arquivo = (nome: string, tipo: string, bytes = 2048) =>
  new File([new Uint8Array(bytes)], nome, { type: tipo });

export const Padrao: Story = {
  name: "Padrão",
  play: async ({ args, canvasElement }) => {
    const tela = within(canvasElement);
    const botao = tela.getByRole("button", {
      name: "Escolher arquivo: Envie o documento assinado",
    });
    await expect(botao).toHaveAccessibleDescription(
      "PDF de até 10 MB. Arraste para cá ou escolha no computador."
    );

    // O seletor do sistema é o input escondido; o teste entrega os arquivos a ele.
    const entrada =
      canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
    if (!entrada) throw new Error("input de arquivo ausente");
    await userEvent.upload(
      entrada,
      arquivo("contrato-assinado.pdf", "application/pdf")
    );
    await expect(args.aoEscolher).toHaveBeenCalledTimes(1);

    // Recusas não chegam a aoEscolher. `applyAccept: false` simula um arquivo
    // que passou pelo seletor (ou foi solto) fora do tipo aceito.
    await userEvent.upload(entrada, arquivo("foto.png", "image/png"), {
      applyAccept: false,
    });
    await expect(args.aoEscolher).toHaveBeenCalledTimes(1);
    await expect(args.aoRecusar).toHaveBeenCalledWith([
      { arquivo: "foto.png", motivo: "tipo" },
    ]);
  },
};

export const Multiplos: Story = {
  name: "Vários arquivos",
  args: { multiplo: true, rotulo: "Anexos do processo" },
};

export const ComErro: Story = {
  name: "Com erro",
  args: { erro: "O arquivo precisa ser um PDF." },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByRole("alert")).toHaveTextContent(
      "precisa ser um PDF"
    );
  },
};

export const Desabilitado: Story = {
  args: { desabilitado: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button")).toBeDisabled();
  },
};

const MOTIVO: Record<RecusaDeArquivo["motivo"], string> = {
  tipo: "não é PDF",
  tamanho: "passa de 10 MB",
  quantidade: "só um arquivo por vez",
};

function ComMensagens() {
  const [escolhido, setEscolhido] = useState<string>();
  const [erro, setErro] = useState<string>();
  return (
    <div className="flex max-w-lg flex-col gap-3">
      <ZonaDeArquivo
        rotulo="Envie o documento assinado"
        descricao="PDF de até 10 MB."
        aceitar={[".pdf"]}
        tamanhoMaximoEmBytes={DEZ_MB}
        erro={erro}
        aoEscolher={(arquivos) => {
          setErro(undefined);
          setEscolhido(arquivos[0]?.name);
        }}
        aoRecusar={(recusas) =>
          setErro(
            recusas.map((r) => `${r.arquivo}: ${MOTIVO[r.motivo]}`).join(" · ")
          )
        }
      />
      {escolhido && (
        <p className="text-sm text-foreground-muted">
          Escolhido: <span className="font-semibold">{escolhido}</span>
        </p>
      )}
    </div>
  );
}

/** Quem usa transforma as recusas na mensagem de erro. */
export const MensagensDeRecusa: Story = {
  name: "Mensagens de recusa",
  render: () => <ComMensagens />,
};
