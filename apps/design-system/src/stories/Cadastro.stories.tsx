import { useMemo, useState } from "react";
import {
  Aba,
  Abas,
  AcoesDaGrade,
  BarraDaGrade,
  BarraDoFormulario,
  Botao,
  BotaoDeAcaoDaLinha,
  BuscaDaGrade,
  CampoDeTexto,
  ChipDeFiltro,
  ChipsDeFiltro,
  CorpoDoFormulario,
  GradeDeCadastro,
  GradeDeCampos,
  IconeBaixar,
  IconeEditar,
  IconeMais,
  ListaDeAbas,
  PainelDaAba,
  RodapeDaGrade,
  RodapeDoFormulario,
  Select,
  SeloDeStatus,
  Tabela,
  Tecla,
  TextoDaLinha,
  Visoes,
  type ColunaDaTabela,
  type Visao,
} from "@meuproduto/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileText, LayoutTemplate, PenLine, ScrollText } from "lucide-react";
import { expect, userEvent, waitFor, within } from "storybook/test";

// O cadastro de documentos do protótipo: a grade de listagem, a transição para o
// formulário em abas e a volta, com as partes do design system. Os dados são
// fictícios.

type Situacao = "aprovado" | "revisao";

type Documento = {
  codigo: string;
  titulo: string;
  cliente: string;
  pasta: string;
  modelo: string;
  versao: string;
  signatarios: number;
  situacao: Situacao;
  atualizacao: string;
};

const DOCUMENTOS_DO_PROTOTIPO: readonly Documento[] = [
  {
    codigo: "04291",
    titulo: "Contrato de Prestação de Serviços (Projeto Aurora)",
    cliente: "Cliente Exemplo Ltda.",
    pasta: "Contratos comerciais",
    modelo: "Contrato de Prestação de Serviços",
    versao: "v3",
    signatarios: 2,
    situacao: "aprovado",
    atualizacao: "14/09/2026 por Usuária Demo",
  },
  {
    codigo: "04302",
    titulo: "Procuração para Representação Administrativa",
    cliente: "Empresa Modelo S.A.",
    pasta: "Procurações",
    modelo: "Procuração",
    versao: "v1",
    signatarios: 1,
    situacao: "aprovado",
    atualizacao: "02/09/2026 por Usuário Teste",
  },
  {
    codigo: "04318",
    titulo: "Termo de Confidencialidade (Parceria Horizonte)",
    cliente: "Comércio Fictício Ltda.",
    pasta: "Confidencialidade",
    modelo: "Termo de Confidencialidade",
    versao: "v2",
    signatarios: 3,
    situacao: "revisao",
    atualizacao: "28/08/2026 por Usuária Demo",
  },
  {
    codigo: "04325",
    titulo: "Aditivo Contratual de Prazo",
    cliente: "Indústria Amostra Ltda.",
    pasta: "Contratos comerciais",
    modelo: "Aditivo Contratual",
    versao: "v1",
    signatarios: 2,
    situacao: "aprovado",
    atualizacao: "20/08/2026 por Equipe Jurídica",
  },
  {
    codigo: "04340",
    titulo: "Declaração de Residência",
    cliente: "Associação Demonstração",
    pasta: "Declarações",
    modelo: "Declaração",
    versao: "v1",
    signatarios: 1,
    situacao: "aprovado",
    atualizacao: "11/08/2026 por Usuária Demo",
  },
  {
    codigo: "04351",
    titulo: "Contrato de Locação Comercial",
    cliente: "Serviços Teste ME",
    pasta: "Imóveis",
    modelo: "Contrato de Locação",
    versao: "v4",
    signatarios: 4,
    situacao: "aprovado",
    atualizacao: "05/08/2026 por Usuário Teste",
  },
];

const CLIENTES = [
  "Cliente Exemplo Ltda.",
  "Empresa Modelo S.A.",
  "Comércio Fictício Ltda.",
  "Indústria Amostra Ltda.",
  "Associação Demonstração",
  "Serviços Teste ME",
];
const MODELOS_E_PASTAS = [
  ["Contrato de Prestação de Serviços", "Contratos comerciais"],
  ["Procuração", "Procurações"],
  ["Termo de Confidencialidade", "Confidencialidade"],
  ["Aditivo Contratual", "Contratos comerciais"],
  ["Declaração", "Declarações"],
  ["Contrato de Locação", "Imóveis"],
  ["Notificação Extrajudicial", "Notificações"],
] as const;
const RESPONSAVEIS = ["Usuária Demo", "Usuário Teste", "Equipe Jurídica"];

const doCiclo = <V,>(lista: readonly V[], indice: number) =>
  lista[indice % lista.length] as V;
const doisDigitos = (numero: number) => String(numero).padStart(2, "0");

/**
 * Registros de exemplo para exercitar a grade: ordenar, filtrar por lista e por
 * condição, rolar. Determinísticos, para os testes verem sempre as mesmas linhas.
 */
function gerarDocumentos(quantos: number): Documento[] {
  return Array.from({ length: quantos }, (_, i) => {
    const [modelo, pasta] = doCiclo(MODELOS_E_PASTAS, i * 3 + 1);
    const codigo = String(4400 + i * 9).padStart(5, "0");
    return {
      codigo,
      titulo: `${modelo} nº ${codigo}`,
      cliente: doCiclo(CLIENTES, i),
      pasta,
      modelo,
      versao: `v${1 + (i % 4)}`,
      signatarios: 1 + ((i * 7) % 4),
      situacao: i % 5 === 3 ? "revisao" : "aprovado",
      atualizacao: `${doisDigitos(1 + ((i * 5) % 28))}/${doisDigitos(1 + (i % 7))}/2026 por ${doCiclo(RESPONSAVEIS, i)}`,
    };
  });
}

const DOCUMENTOS: readonly Documento[] = [
  ...DOCUMENTOS_DO_PROTOTIPO,
  ...gerarDocumentos(54),
];

const SITUACAO: Record<
  Situacao,
  { rotulo: string; plural: string; intencao: "sucesso" | "atencao" }
> = {
  aprovado: { rotulo: "Aprovado", plural: "Aprovados", intencao: "sucesso" },
  revisao: { rotulo: "Em revisão", plural: "Em revisão", intencao: "atencao" },
};

type Filtro = "todos" | Situacao;

const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

function filtrar(
  documentos: readonly Documento[],
  filtro: Filtro,
  busca: string
): readonly Documento[] {
  const alvo = normalizar(busca.trim());
  return documentos
    .filter((d) => filtro === "todos" || d.situacao === filtro)
    .filter(
      (d) =>
        !alvo ||
        [d.titulo, d.cliente, d.modelo].some((campo) =>
          normalizar(campo).includes(alvo)
        )
    );
}

function colunas(
  aoEditar: (documento: Documento) => void
): ColunaDaTabela<Documento>[] {
  return [
    {
      id: "codigo",
      titulo: "Código",
      valor: (d) => d.codigo,
      largura: 100,
      celula: (d) => (
        <span className="font-mono font-bold text-foreground-muted">
          #{d.codigo}
        </span>
      ),
    },
    {
      id: "titulo",
      titulo: "Documento / Cliente",
      valor: (d) => d.titulo,
      largura: 320,
      celula: (d) => (
        <TextoDaLinha
          principal={d.titulo}
          secundario={`${d.cliente} • ${d.pasta}`}
        />
      ),
    },
    {
      id: "modelo",
      titulo: "Modelo de origem",
      valor: (d) => d.modelo,
      largura: 260,
      celula: (d) => (
        <TextoDaLinha
          principal={d.modelo}
          secundario={`Versão do modelo: ${d.versao}`}
          destaque={false}
        />
      ),
    },
    {
      id: "signatarios",
      titulo: "Signatários",
      valor: (d) => d.signatarios,
      largura: 130,
      celula: (d) => <strong className="text-[13.5px]">{d.signatarios}</strong>,
    },
    { id: "pasta", titulo: "Pasta", valor: (d) => d.pasta, largura: 200 },
    {
      id: "situacao",
      titulo: "Status",
      valor: (d) => SITUACAO[d.situacao].rotulo,
      largura: 140,
      celula: (d) => (
        <SeloDeStatus intencao={SITUACAO[d.situacao].intencao}>
          {SITUACAO[d.situacao].rotulo}
        </SeloDeStatus>
      ),
    },
    {
      id: "atualizacao",
      titulo: "Última atualização",
      valor: (d) => d.atualizacao,
      largura: 220,
      celula: (d) => (
        <span className="text-[11.5px] text-foreground-muted">
          {d.atualizacao}
        </span>
      ),
    },
    {
      id: "acoes",
      titulo: "Ações",
      valor: () => null,
      largura: 90,
      alinhamento: "fim",
      semFiltro: true,
      semOrdenacao: true,
      celula: (d) => (
        <BotaoDeAcaoDaLinha
          rotulo={`Editar ${d.titulo}`}
          icone={<IconeEditar />}
          onClick={() => aoEditar(d)}
        />
      ),
    },
  ];
}

/** A listagem com busca, chips e ações, como no protótipo. */
function Listagem({
  aoAbrir,
}: {
  aoAbrir: (documento: Documento | null) => void;
}) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const linhas = useMemo(
    () => filtrar(DOCUMENTOS, filtro, busca),
    [filtro, busca]
  );
  const definicao = useMemo(() => colunas(aoAbrir), [aoAbrir]);
  const quantos = (situacao: Filtro) =>
    filtrar(DOCUMENTOS, situacao, "").length;

  return (
    <GradeDeCadastro
      className="rounded-none border-0"
      barra={
        <BarraDaGrade>
          <BuscaDaGrade
            valor={busca}
            aoMudar={setBusca}
            placeholder="Buscar por documento, cliente ou modelo..."
          />
          <ChipsDeFiltro rotulo="Situação">
            {(["todos", "aprovado", "revisao"] as const).map((opcao) => (
              <ChipDeFiltro
                key={opcao}
                ativo={filtro === opcao}
                aoEscolher={() => setFiltro(opcao)}
              >
                {opcao === "todos" ? "Todos" : SITUACAO[opcao].plural} (
                {quantos(opcao)})
              </ChipDeFiltro>
            ))}
          </ChipsDeFiltro>
          <AcoesDaGrade>
            <Botao variante="contorno" icone={<IconeBaixar />}>
              Exportar
            </Botao>
            <Botao icone={<IconeMais />} onClick={() => aoAbrir(null)}>
              Novo Cadastro
            </Botao>
          </AcoesDaGrade>
        </BarraDaGrade>
      }
      rodape={
        <RodapeDaGrade
          resumo={
            <>
              Mostrando <strong>1 a {linhas.length}</strong> de{" "}
              <strong>{linhas.length}</strong> registros cadastrados
            </>
          }
          pagina="Página 1 de 1"
        />
      }
    >
      <Tabela
        rotulo="Documentos"
        colunas={definicao}
        linhas={linhas}
        idDaLinha={(d) => d.codigo}
        aoAbrirLinha={aoAbrir}
        alturaDaLinha={64}
        semRodape
        className="rounded-none border-0"
      />
    </GradeDeCadastro>
  );
}

const MODELOS = [
  "Contrato de Prestação de Serviços",
  "Procuração",
  "Termo de Confidencialidade",
  "Aditivo Contratual",
  "Declaração",
  "Contrato de Locação",
  "Notificação Extrajudicial",
].map((nome) => ({ valor: nome, label: nome }));

/** O formulário em abas de um registro, com a barra de cima e o rodapé fixo. */
function Formulario({
  documento,
  aoVoltar,
}: {
  documento: Documento | null;
  aoVoltar: () => void;
}) {
  const [modelo, setModelo] = useState<string | null>(
    documento?.modelo ?? MODELOS[0]?.valor ?? null
  );

  return (
    <>
      <BarraDoFormulario
        aoVoltar={aoVoltar}
        titulo={
          documento
            ? `Editando documento: ${documento.titulo} (Cód. ${documento.codigo})`
            : "Novo documento"
        }
      >
        <SeloDeStatus intencao="sucesso">Aprovado</SeloDeStatus>
      </BarraDoFormulario>

      <CorpoDoFormulario>
        <Abas valorInicial="geral" variante="formulario">
          <ListaDeAbas rotulo="Seções do cadastro">
            <Aba valor="geral" icone={<FileText className="size-4" />}>
              1. Dados do Documento
            </Aba>
            <Aba valor="prazos" icone={<LayoutTemplate className="size-4" />}>
              2. Prazos e Validade
            </Aba>
            <Aba valor="assinaturas" icone={<PenLine className="size-4" />}>
              3. Signatários e Lembretes
            </Aba>
            <Aba valor="historico" icone={<ScrollText className="size-4" />}>
              4. Histórico e Auditoria
            </Aba>
          </ListaDeAbas>
          <PainelDaAba valor="geral">
            <GradeDeCampos>
              <CampoDeTexto
                label="Título do documento"
                tamanho="md"
                valorInicial={documento?.titulo ?? ""}
                ajuda="Como o documento aparece para o cliente e para os signatários."
                className="col-span-full"
              />
              <Select
                label="Modelo de origem"
                tamanho="md"
                opcoes={MODELOS}
                valor={modelo}
                aoMudar={setModelo}
              />
              <CampoDeTexto
                label="Código Interno"
                tamanho="md"
                valorInicial={documento ? `DOC-${documento.codigo}` : ""}
                placeholder="Ex: DOC-001"
              />
            </GradeDeCampos>
          </PainelDaAba>
          <PainelDaAba valor="prazos">
            <GradeDeCampos>
              <CampoDeTexto
                label="Prazo para Assinatura"
                tamanho="md"
                valorInicial="15"
                sufixo="dias"
              />
              <CampoDeTexto
                label="Validade do Documento"
                tamanho="md"
                valorInicial="12"
                sufixo="meses"
              />
            </GradeDeCampos>
          </PainelDaAba>
          <PainelDaAba valor="assinaturas">
            <GradeDeCampos>
              <CampoDeTexto
                label="Intervalo entre Lembretes"
                tamanho="md"
                valorInicial="3"
                sufixo="dias"
              />
            </GradeDeCampos>
          </PainelDaAba>
          <PainelDaAba valor="historico">
            <p className="px-7 py-6 text-foreground-muted">
              Linha do tempo das alterações, com autor e data.
            </p>
          </PainelDaAba>
        </Abas>
      </CorpoDoFormulario>

      <RodapeDoFormulario
        dica={
          <>
            Dica: use <Tecla>Ctrl + S</Tecla> para salvar instantaneamente
          </>
        }
      >
        <Botao variante="fantasma" onClick={aoVoltar}>
          Cancelar
        </Botao>
        <Botao variante="contorno">Salvar como Rascunho</Botao>
        <Botao onClick={aoVoltar}>Salvar Alterações</Botao>
      </RodapeDoFormulario>
    </>
  );
}

/** Listagem e formulário no mesmo espaço, com a transição do protótipo. */
function Cadastro() {
  const [visao, setVisao] = useState<Visao>("lista");
  const [documento, setDocumento] = useState<Documento | null>(null);

  function abrir(escolhido: Documento | null) {
    setDocumento(escolhido);
    setVisao("formulario");
  }

  return (
    <div className="flex h-[640px] flex-col overflow-hidden rounded-card border border-border bg-surface">
      <Visoes
        visao={visao}
        lista={<Listagem aoAbrir={abrir} />}
        formulario={
          <Formulario
            documento={documento}
            aoVoltar={() => setVisao("lista")}
          />
        }
      />
    </div>
  );
}

const meta = { title: "Dados/Cadastro" } satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Clicar em uma linha (ou em "Novo Cadastro") desliza a listagem para fora e
 * traz o formulário; "Voltar para a Listagem" inverte. A busca e o que foi
 * digitado continuam, porque as duas visões ficam montadas.
 */
export const ListagemEFormulario: Story = {
  name: "Listagem e formulário",
  render: () => <Cadastro />,
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);

    const emRevisao = DOCUMENTOS.filter((d) => d.situacao === "revisao").length;
    const chip = `Em revisão (${emRevisao})`;

    await expect(tela.getByRole("grid")).toBeVisible();
    await userEvent.click(tela.getByRole("button", { name: chip }));
    await expect(tela.getByRole("grid")).toHaveAttribute(
      "aria-rowcount",
      String(emRevisao + 1)
    );

    await userEvent.click(
      tela.getByText("Termo de Confidencialidade (Parceria Horizonte)")
    );
    await waitFor(() =>
      expect(
        tela.getByText(/Editando documento: Termo de Confidencialidade/)
      ).toBeVisible()
    );
    await expect(
      tela.getByRole("tab", { name: /Dados do Documento/ })
    ).toHaveAttribute("aria-selected", "true");

    await userEvent.click(tela.getByRole("tab", { name: /Prazos e Validade/ }));
    await expect(tela.getByRole("tabpanel")).toHaveTextContent(
      "Prazo para Assinatura"
    );

    await userEvent.click(
      tela.getByRole("button", { name: "Voltar para a Listagem" })
    );
    await waitFor(() => expect(tela.getByRole("grid")).toBeVisible());
    // O filtro escolhido antes continua.
    await expect(tela.getByRole("button", { name: chip })).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    // A história termina com todos os registros, para quem for explorar a grade.
    await userEvent.click(
      tela.getByRole("button", { name: `Todos (${DOCUMENTOS.length})` })
    );
    await expect(tela.getByRole("grid")).toHaveAttribute(
      "aria-rowcount",
      String(DOCUMENTOS.length + 1)
    );
  },
};

/** Só a grade, com todos os registros. */
export const Grade: Story = {
  render: () => (
    <div className="flex h-[520px] flex-col">
      <Listagem aoAbrir={() => {}} />
    </div>
  ),
};

/** Os selos de estado de um registro, nas seis intenções. */
export const Status: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <SeloDeStatus intencao="sucesso">Aprovado</SeloDeStatus>
        <SeloDeStatus intencao="primario">Gerado</SeloDeStatus>
        <SeloDeStatus intencao="destaque">Em revisão</SeloDeStatus>
        <SeloDeStatus intencao="atencao">Aguardando</SeloDeStatus>
        <SeloDeStatus intencao="perigo">Cancelado</SeloDeStatus>
        <SeloDeStatus>Rascunho</SeloDeStatus>
      </div>
      <div className="flex flex-wrap gap-3">
        <SeloDeStatus intencao="sucesso" maiusculas={false}>
          Assinado
        </SeloDeStatus>
        <SeloDeStatus intencao="primario" maiusculas={false}>
          Em andamento
        </SeloDeStatus>
        <SeloDeStatus intencao="atencao" maiusculas={false}>
          Aguardando
        </SeloDeStatus>
        <SeloDeStatus maiusculas={false}>Rascunho</SeloDeStatus>
      </div>
    </div>
  ),
};
