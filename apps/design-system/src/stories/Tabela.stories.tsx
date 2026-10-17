import { Suspense, use, useCallback, useMemo, useState } from "react";
import {
  Botao,
  DialogoDeConfirmacao,
  EsqueletoDeTabela,
  IconeCheck,
  IconeLixeira,
  Tabela,
  type ColunaDaTabela,
  type EdicaoDeCelula,
} from "@meuproduto/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

// Documentos fictícios, gerados para exercitar a tabela.
type Documento = {
  id: string;
  status: string;
  tipo: string;
  cliente: string;
  data: string;
  paginas: number;
  valor: number;
  responsavel: string | null;
};

const STATUS = ["Rascunho", "Assinado", "Em revisão", "Cancelado"];
const TIPOS = [
  "Procuração",
  "Contrato de Prestação de Serviços",
  "Termo de Confidencialidade",
  "Declaração",
];
const CLIENTES = [
  "Cliente Exemplo",
  "Empresa Modelo",
  "Comércio Fictício",
  "Indústria Amostra",
  "Associação Demonstração",
  "Serviços Teste",
];
const UNIDADES = ["Matriz", "Unidade Centro", "Filial Norte", "Filial Sul"];
const RESPONSAVEIS = [
  "Usuária Demo",
  "Usuário Teste",
  "Equipe Jurídica",
  "Equipe Comercial",
  "Recepção",
  null,
];

/** Gerador determinístico: as mesmas linhas a cada execução, para os testes. */
function sorteador(semente: number) {
  let estado = semente;
  return () => {
    estado = (estado + 0x6d2b79f5) | 0;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gerarDocumentos(quantos: number, inicio = 0): Documento[] {
  const sortear = sorteador(20261005 + inicio);
  const um = <V,>(lista: readonly V[]) =>
    lista[Math.floor(sortear() * lista.length)] as V;
  return Array.from({ length: quantos }, (_, indice) => {
    const dia = 1 + Math.floor(sortear() * 28);
    const mes = 1 + Math.floor(sortear() * 10);
    return {
      id: String(inicio + indice + 1).padStart(6, "0"),
      status: um(STATUS),
      tipo: um(TIPOS),
      cliente: `${um(CLIENTES)} ${um(UNIDADES)} ${1 + Math.floor(sortear() * 12)}`,
      data: `2026-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`,
      paginas: Math.floor(sortear() * 400),
      valor: Math.round(sortear() * 5_000_000 * 100) / 100,
      responsavel: um(RESPONSAVEIS),
    };
  });
}

const MOEDA = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const COLUNAS: ColunaDaTabela<Documento>[] = [
  {
    id: "id",
    titulo: "Documento",
    valor: (b) => b.id,
    largura: 110,
    fixa: true,
  },
  { id: "status", titulo: "Status", valor: (b) => b.status, largura: 130 },
  {
    id: "tipo",
    titulo: "Tipo de documento",
    valor: (b) => b.tipo,
    largura: 240,
  },
  { id: "cliente", titulo: "Cliente", valor: (b) => b.cliente, largura: 300 },
  {
    id: "data",
    titulo: "Data de criação",
    tipo: "data",
    valor: (b) => b.data,
    largura: 160,
  },
  {
    id: "paginas",
    titulo: "Páginas",
    tipo: "numero",
    valor: (b) => b.paginas,
    largura: 130,
  },
  {
    id: "valor",
    titulo: "Valor (R$)",
    tipo: "numero",
    valor: (b) => b.valor,
    formatar: (valor) => (typeof valor === "number" ? MOEDA.format(valor) : ""),
    largura: 160,
  },
  {
    id: "responsavel",
    titulo: "Responsável",
    valor: (b) => b.responsavel,
    largura: 170,
  },
];

const idDoDocumento = (documento: Documento) => documento.id;

const meta = { title: "Dados/Tabela" } satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

const POUCAS = gerarDocumentos(40);

export const Padrao: Story = {
  name: "Padrão",
  render: () => (
    <Tabela
      rotulo="Documentos"
      colunas={COLUNAS}
      linhas={POUCAS}
      idDaLinha={idDoDocumento}
      className="h-96"
    />
  ),
};

/**
 * O submenu "Filtros de texto" leva ao diálogo do filtro customizado, com o
 * operador escolhido já selecionado. A coluna filtrada fica destacada no
 * cabeçalho até "Limpar filtro".
 */
export const FiltroCustomizado: Story = {
  name: "Filtro customizado",
  render: () => (
    <Tabela
      rotulo="Documentos"
      colunas={COLUNAS}
      linhas={POUCAS}
      idDaLinha={idDoDocumento}
      className="h-96"
    />
  ),
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    const pagina = within(canvasElement.ownerDocument.body);
    const grade = tela.getByRole("grid", { name: "Documentos" });

    await userEvent.click(
      tela.getByRole("button", { name: "Filtrar Cliente" })
    );
    const menu = within(await pagina.findByRole("form", { name: /Cliente/ }));
    await userEvent.click(
      menu.getByRole("button", { name: "Filtros de texto" })
    );
    await userEvent.click(
      await pagina.findByRole("menuitem", { name: "Contém..." })
    );

    const dialogo = within(
      await pagina.findByRole("dialog", { name: "Filtro customizado" })
    );
    await userEvent.type(
      dialogo.getByRole("textbox", { name: "Valor" }),
      "centro"
    );
    await userEvent.click(dialogo.getByRole("button", { name: "OK" }));

    const comCentro = POUCAS.filter((b) => /centro/i.test(b.cliente)).length;
    await waitFor(() =>
      expect(grade).toHaveAttribute("aria-rowcount", String(comCentro + 1))
    );
    const botao = tela.getByRole("button", {
      name: "Filtrar Cliente (filtro aplicado)",
    });
    await expect(botao).toBeVisible();

    // Reabrir o menu: o operador em vigor aparece marcado; limpar devolve tudo.
    await userEvent.click(botao);
    const reaberto = within(
      await pagina.findByRole("form", { name: /Cliente/ })
    );
    await userEvent.click(
      reaberto.getByRole("button", { name: "Limpar filtro" })
    );
    await waitFor(() =>
      expect(grade).toHaveAttribute("aria-rowcount", String(POUCAS.length + 1))
    );
  },
};

const MUITAS = gerarDocumentos(150_000);

/**
 * 150 mil linhas na memória do navegador. Só as visíveis vão para a tela;
 * ordenar e filtrar rodam sobre todas.
 */
export const CentoECinquentaMilLinhas: Story = {
  name: "150 mil linhas",
  render: () => (
    <Tabela
      rotulo="Documentos"
      colunas={COLUNAS}
      linhas={MUITAS}
      idDaLinha={idDoDocumento}
      className="h-[32rem]"
    />
  ),
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    const pagina = within(canvasElement.ownerDocument.body);
    const grade = tela.getByRole("grid", { name: "Documentos" });

    // A grade anuncia todas as linhas, mas desenha poucas.
    await expect(grade).toHaveAttribute("aria-rowcount", "150001");
    await expect(tela.getAllByRole("row").length).toBeLessThan(80);

    // Filtro pela lista de valores: desmarca tudo e fica só com um status.
    await userEvent.click(tela.getByRole("button", { name: "Filtrar Status" }));
    const menu = within(await pagina.findByRole("form", { name: /Status/ }));
    await userEvent.click(
      menu.getByRole("checkbox", { name: "Selecionar tudo" })
    );
    await userEvent.click(menu.getByRole("checkbox", { name: /Assinado/ }));
    await userEvent.click(menu.getByRole("button", { name: "OK" }));

    const assinados = MUITAS.filter((b) => b.status === "Assinado").length;
    await waitFor(() =>
      expect(grade).toHaveAttribute("aria-rowcount", String(assinados + 1))
    );
    await expect(
      tela.getByText(new RegExp(`${assinados.toLocaleString("pt-BR")} de`))
    ).toBeVisible();

    // Ordenar pelo valor, do maior para o menor: a primeira linha é o maior valor.
    const cabecalho = tela.getByRole("button", { name: "Valor (R$)" });
    await userEvent.click(cabecalho);
    await userEvent.click(cabecalho);
    const maior = Math.max(
      ...MUITAS.filter((b) => b.status === "Assinado").map((b) => b.valor)
    );
    await waitFor(() =>
      expect(tela.getAllByRole("row")[1]).toHaveTextContent(MOEDA.format(maior))
    );

    await userEvent.click(
      tela.getByRole("button", { name: /Limpar 1 filtro/ })
    );
    await waitFor(() =>
      expect(grade).toHaveAttribute("aria-rowcount", "150001")
    );
  },
};

const PAGINA = 500;
const TOTAL_NO_SERVIDOR = 150_000;

function ComRolagemInfinita() {
  const [linhas, setLinhas] = useState(() => gerarDocumentos(PAGINA));
  const [carregando, setCarregando] = useState(false);

  // Simula a API: cada página chega depois de um instante.
  const buscarMais = useCallback(() => {
    if (linhas.length >= TOTAL_NO_SERVIDOR) return;
    setCarregando(true);
    setTimeout(() => {
      setLinhas((atuais) => [
        ...atuais,
        ...gerarDocumentos(PAGINA, atuais.length),
      ]);
      setCarregando(false);
    }, 300);
  }, [linhas.length]);

  const colunas = useMemo(() => COLUNAS, []);

  return (
    <Tabela
      rotulo="Documentos com rolagem infinita"
      colunas={colunas}
      linhas={linhas}
      idDaLinha={idDoDocumento}
      aoChegarAoFim={buscarMais}
      carregandoMais={carregando}
      total={TOTAL_NO_SERVIDOR}
      className="h-[32rem]"
    />
  );
}

/**
 * As linhas chegam em páginas de 500 conforme a rolagem se aproxima do fim.
 * Neste modo, ordenar e filtrar valem só sobre o que já foi carregado.
 */
export const RolagemInfinita: Story = {
  name: "Rolagem infinita",
  render: () => <ComRolagemInfinita />,
  play: async ({ canvasElement }) => {
    const grade = within(canvasElement).getByRole("grid");
    await expect(grade).toHaveAttribute("aria-rowcount", "501");

    grade.scrollTop = grade.scrollHeight;
    await waitFor(
      () => expect(grade).toHaveAttribute("aria-rowcount", "1001"),
      { timeout: 4000 }
    );
  },
};

const COLUNAS_EDITAVEIS: ColunaDaTabela<Documento>[] = COLUNAS.map((coluna) =>
  ["paginas", "responsavel", "data"].includes(coluna.id)
    ? // Documento cancelado não pode mais ser alterado.
      { ...coluna, editavel: (documento) => documento.status !== "Cancelado" }
    : coluna
);

function ComEdicaoESelecao() {
  const [linhas, setLinhas] = useState(() => gerarDocumentos(200));
  const [marcadas, setMarcadas] = useState<ReadonlySet<string>>(new Set());
  const [aExcluir, setAExcluir] = useState<readonly string[] | null>(null);

  function editar({ idDaLinha, coluna, valor }: EdicaoDeCelula<Documento>) {
    if (coluna === "paginas" && (valor === null || Number(valor) < 0)) {
      return "o número de páginas não pode ser negativo nem ficar vazio.";
    }
    setLinhas((atuais) =>
      atuais.map((documento) =>
        documento.id === idDaLinha
          ? { ...documento, [coluna]: valor }
          : documento
      )
    );
  }

  return (
    <>
      <Tabela
        rotulo="Documentos editáveis"
        colunas={COLUNAS_EDITAVEIS}
        linhas={linhas}
        idDaLinha={idDoDocumento}
        selecionavel
        selecionadas={marcadas}
        aoMudarSelecao={setMarcadas}
        aoEditar={editar}
        acoesDaSelecao={({ ids, limpar }) => (
          <>
            <Botao
              variante="contorno"
              tamanho="xs"
              icone={<IconeCheck />}
              onClick={() => {
                setLinhas((atuais) =>
                  atuais.map((documento) =>
                    ids.includes(documento.id)
                      ? { ...documento, status: "Assinado" }
                      : documento
                  )
                );
                limpar();
              }}
            >
              Marcar como assinado
            </Botao>
            <Botao
              variante="contorno"
              intencao="perigo"
              tamanho="xs"
              icone={<IconeLixeira />}
              onClick={() => setAExcluir(ids)}
            >
              Excluir
            </Botao>
          </>
        )}
        className="h-[32rem]"
      />
      <DialogoDeConfirmacao
        aberto={aExcluir !== null}
        titulo={`Excluir ${aExcluir?.length ?? 0} documentos?`}
        descricao="Os documentos selecionados saem da lista. Esta ação não pode ser desfeita."
        rotuloDeConfirmar="Excluir"
        perigo
        aoCancelar={() => setAExcluir(null)}
        aoConfirmar={() => {
          setLinhas((atuais) =>
            atuais.filter((documento) => !aExcluir?.includes(documento.id))
          );
          setMarcadas(new Set());
          setAExcluir(null);
        }}
      />
    </>
  );
}

/**
 * Duplo clique (ou Enter) edita a célula; Enter confirma, Esc desiste e Tab vai
 * para a próxima célula editável. As linhas marcadas ganham uma barra de ações.
 */
export const EdicaoESelecao: Story = {
  name: "Edição e seleção",
  render: () => <ComEdicaoESelecao />,
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    const pagina = within(canvasElement.ownerDocument.body);
    const grade = tela.getByRole("grid");
    const linha = (n: number) =>
      within(tela.getAllByRole("row")[n] as HTMLElement);

    // Edição: valor inválido é recusado com o motivo; o válido é gravado.
    const primeira = tela.getAllByRole("row")[1] as HTMLElement;
    const paginas = primeira.querySelector(
      '[data-celula$="|paginas"]'
    ) as HTMLElement;
    await userEvent.dblClick(paginas);
    const campo = await linha(1).findByRole("textbox", { name: /Páginas/ });
    await userEvent.clear(campo);
    await userEvent.type(campo, "-5{Enter}");
    await expect(await tela.findByRole("alert")).toHaveTextContent(
      "não pode ser negativo"
    );
    await userEvent.clear(campo);
    await userEvent.type(campo, "1.234{Enter}");
    await waitFor(() => expect(paginas).toHaveTextContent("1.234"));
    await expect(tela.queryByRole("alert")).toBeNull();

    // Seleção: Shift e clique marcam o intervalo; a barra oferece as ações.
    await userEvent.click(
      linha(1).getByRole("checkbox", { name: "Selecionar a linha 1" })
    );
    // O Shift precisa da mesma sessão de teclado e mouse.
    const usuario = userEvent.setup();
    await usuario.keyboard("{Shift>}");
    await usuario.click(
      linha(4).getByRole("checkbox", { name: "Selecionar a linha 4" })
    );
    await usuario.keyboard("{/Shift}");
    const barra = within(
      await tela.findByRole("toolbar", { name: /selecionadas/ })
    );
    await expect(barra.getByText(/4 selecionadas/)).toBeVisible();

    // Excluir pede confirmação e tira as linhas da lista.
    await userEvent.click(barra.getByRole("button", { name: "Excluir" }));
    const dialogo = within(await pagina.findByRole("dialog"));
    await userEvent.click(dialogo.getByRole("button", { name: "Excluir" }));
    await waitFor(() => expect(grade).toHaveAttribute("aria-rowcount", "197"));
    await expect(tela.queryByRole("toolbar")).toBeNull();
  },
};

function buscarDocumentos(): Promise<Documento[]> {
  return new Promise((resolver) =>
    setTimeout(() => resolver(gerarDocumentos(200)), 700)
  );
}

function TabelaQueAguarda({ promessa }: { promessa: Promise<Documento[]> }) {
  // `use` suspende até os dados chegarem; o Suspense acima mostra o esqueleto.
  const linhas = use(promessa);
  return (
    <Tabela
      rotulo="Documentos"
      colunas={COLUNAS}
      linhas={linhas}
      idDaLinha={idDoDocumento}
      className="h-96"
    />
  );
}

function ComSuspense() {
  // A promessa é criada uma vez e guardada; criá-la a cada desenho reiniciaria a espera.
  const [promessa] = useState(buscarDocumentos);
  return (
    <Suspense fallback={<EsqueletoDeTabela className="h-96" />}>
      <TabelaQueAguarda promessa={promessa} />
    </Suspense>
  );
}

/**
 * Enquanto os dados carregam, o `EsqueletoDeTabela` ocupa o lugar com a mesma
 * moldura, e a tela não pula quando a tabela entra.
 */
export const ComEsqueleto: Story = {
  name: "Carregando com Suspense",
  render: () => <ComSuspense />,
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByText("Carregando a tabela…")).toBeInTheDocument();
    await expect(tela.queryByRole("grid")).toBeNull();
    const grade = await tela.findByRole("grid", {}, { timeout: 4000 });
    await expect(grade).toHaveAttribute("aria-rowcount", "201");
    await expect(tela.queryByText("Carregando a tabela…")).toBeNull();
  },
};
