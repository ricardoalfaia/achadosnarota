import type { ReactNode } from "react";
import {
  Avatar,
  Botao,
  BotaoDeIcone,
  CampoDeBusca,
  CartaoDeAcao,
  CartaoDeIndicador,
  CartaoDeModelo,
  Destaque,
  IconeMaisOpcoes,
  SeloDeStatus,
  type IntencaoDoSeloDeStatus,
  type TomDoCartao,
} from "@meuproduto/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Clock,
  FilePlus,
  FileText,
  LayoutGrid,
  Lock,
  PenLine,
  Plus,
  UserPlus,
  Users,
} from "lucide-react";
import { expect, within } from "storybook/test";

import { IlustracaoDeDocumento } from "./ilustracao";

// O painel inicial do mockup da marca (docs/produto/marca/quadro-da-marca.png), só com componentes do
// design system e dados sintéticos.

const INDICADORES: {
  icone: ReactNode;
  valor: number;
  rotulo: string;
  tom: TomDoCartao;
  variacao: { texto: string; tendencia: "alta" | "baixa" | "estavel" };
}[] = [
  {
    icone: <FileText />,
    valor: 24,
    rotulo: "Documentos",
    tom: "primario",
    variacao: { texto: "12%", tendencia: "alta" },
  },
  {
    icone: <PenLine />,
    valor: 18,
    rotulo: "Assinaturas",
    tom: "sucesso",
    variacao: { texto: "8%", tendencia: "alta" },
  },
  {
    icone: <Users />,
    valor: 12,
    rotulo: "Clientes",
    tom: "destaque",
    variacao: { texto: "3%", tendencia: "alta" },
  },
  {
    icone: <Clock />,
    valor: 6,
    rotulo: "Pendentes",
    tom: "aviso",
    variacao: { texto: "2%", tendencia: "baixa" },
  },
];

const STATUS: Record<
  "assinado" | "andamento" | "aguardando" | "rascunho",
  { rotulo: string; intencao: IntencaoDoSeloDeStatus }
> = {
  assinado: { rotulo: "Assinado", intencao: "sucesso" },
  andamento: { rotulo: "Em andamento", intencao: "primario" },
  aguardando: { rotulo: "Aguardando", intencao: "atencao" },
  rascunho: { rotulo: "Rascunho", intencao: "neutro" },
};

const RECENTES: {
  nome: string;
  status: keyof typeof STATUS;
  atualizacao: string;
}[] = [
  {
    nome: "Contrato de Prestação de Serviços",
    status: "assinado",
    atualizacao: "Hoje, 14:32",
  },
  {
    nome: "Procuração",
    status: "andamento",
    atualizacao: "14 out 2026, 10:21",
  },
  {
    nome: "Proposta Comercial",
    status: "aguardando",
    atualizacao: "12 out 2026, 16:45",
  },
  {
    nome: "Termo de Confidencialidade",
    status: "assinado",
    atualizacao: "10 out 2026, 09:18",
  },
  {
    nome: "Contrato de Locação",
    status: "rascunho",
    atualizacao: "9 out 2026, 11:03",
  },
];

const ACOES: {
  icone: ReactNode;
  titulo: string;
  descricao: string;
  tom: TomDoCartao;
}[] = [
  {
    icone: <FilePlus />,
    titulo: "Criar documento",
    descricao: "A partir de um modelo",
    tom: "primario",
  },
  {
    icone: <PenLine />,
    titulo: "Enviar para assinatura",
    descricao: "Com poucos cliques",
    tom: "sucesso",
  },
  {
    icone: <LayoutGrid />,
    titulo: "Usar modelo",
    descricao: "Modelos prontos",
    tom: "primario",
  },
  {
    icone: <UserPlus />,
    titulo: "Adicionar cliente",
    descricao: "Cadastrar novo cliente",
    tom: "destaque",
  },
];

const MODELOS: {
  icone: ReactNode;
  nome: string;
  usos: number;
  tom: TomDoCartao;
}[] = [
  { icone: <FileText />, nome: "Procuração", usos: 12, tom: "sucesso" },
  {
    icone: <FileText />,
    nome: "Contrato de Serviços",
    usos: 8,
    tom: "primario",
  },
  {
    icone: <Lock />,
    nome: "Termo de Confidencialidade",
    usos: 6,
    tom: "destaque",
  },
  { icone: <FileText />, nome: "Proposta Comercial", usos: 5, tom: "destaque" },
];

const LINK_DO_CARTAO = "block rounded-card outline-none";

function TituloDaSecao({
  children,
  verTodos,
}: {
  children: string;
  verTodos?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-xl font-bold">{children}</h2>
      {verTodos && (
        <a
          href={`#${verTodos}`}
          className="text-sm font-semibold text-primary hover:text-primary-hover"
        >
          Ver todos<span className="sr-only"> os {verTodos}</span>
        </a>
      )}
    </div>
  );
}

function Painel() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="flex items-center gap-4">
        <CampoDeBusca
          rotulo="Buscar documentos, clientes ou modelos"
          placeholder="Buscar documentos, clientes ou modelos..."
          atalho="Ctrl K"
          className="max-w-xl"
        />
        <Avatar nome="Marina Duarte" className="ml-auto" />
      </header>

      <Destaque
        nivelDoTitulo="h1"
        saudacao="Olá, Marina 👋"
        titulo={
          <>
            Seus documentos{" "}
            <span className="text-brand-gradient">ganham vida.</span>
          </>
        }
        descricao="Crie, gerencie e envie para assinatura de forma simples, rápida e segura."
        acoes={
          <>
            <Botao tamanho="md" icone={<Plus />}>
              Gerar documento
            </Botao>
            <Botao tamanho="md" variante="contorno" icone={<PenLine />}>
              Enviar para assinatura
            </Botao>
          </>
        }
        ilustracao={<IlustracaoDeDocumento />}
      />

      <section aria-label="Indicadores do mês">
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4">
          {INDICADORES.map((indicador) => (
            <li key={indicador.rotulo}>
              <a href={`#${indicador.rotulo}`} className={LINK_DO_CARTAO}>
                <CartaoDeIndicador
                  icone={indicador.icone}
                  valor={indicador.valor}
                  rotulo={indicador.rotulo}
                  tom={indicador.tom}
                  variacao={{ ...indicador.variacao, descricao: "este mês" }}
                />
              </a>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section className="flex min-w-0 flex-col gap-6">
          <div>
            <TituloDaSecao verTodos="documentos">
              Documentos recentes
            </TituloDaSecao>
            <div className="overflow-x-auto rounded-card border border-border bg-surface">
              <table className="w-full border-collapse text-left">
                <thead className="text-xs text-foreground-muted">
                  <tr className="border-b border-border">
                    <th className="px-4 py-2.5 font-semibold">Nome</th>
                    <th className="px-4 py-2.5 font-semibold">Status</th>
                    <th className="px-4 py-2.5 font-semibold">Atualização</th>
                    <th className="w-12 px-4 py-2.5 font-semibold">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {RECENTES.map((documento) => (
                    <tr
                      key={documento.nome}
                      className="border-b border-border last:border-b-0 hover:bg-surface-hover"
                    >
                      <td className="px-4 py-2.5">
                        <span className="flex items-center gap-2.5">
                          <FileText
                            aria-hidden="true"
                            className="size-4 shrink-0 text-foreground-muted"
                          />
                          {documento.nome}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <SeloDeStatus
                          intencao={STATUS[documento.status].intencao}
                          maiusculas={false}
                        >
                          {STATUS[documento.status].rotulo}
                        </SeloDeStatus>
                      </td>
                      <td className="px-4 py-2.5 text-sm whitespace-nowrap text-foreground-muted">
                        {documento.atualizacao}
                      </td>
                      <td className="px-4 py-1.5">
                        <BotaoDeIcone
                          rotulo={`Ações de ${documento.nome}`}
                          icone={<IconeMaisOpcoes />}
                          variante="fantasma"
                          tamanho="xs"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <TituloDaSecao verTodos="modelos">
              Modelos mais usados
            </TituloDaSecao>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3">
              {MODELOS.map((modelo) => (
                <li key={modelo.nome}>
                  <a href={`#${modelo.nome}`} className={LINK_DO_CARTAO}>
                    <CartaoDeModelo
                      icone={modelo.icone}
                      nome={modelo.nome}
                      detalhe={`${modelo.usos} usos`}
                      tom={modelo.tom}
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <nav aria-labelledby="titulo-acoes-rapidas">
          <h2 id="titulo-acoes-rapidas" className="mb-3 text-xl font-bold">
            Ações rápidas
          </h2>
          <ul className="flex flex-col gap-2.5">
            {ACOES.map((acao) => (
              <li key={acao.titulo}>
                <a href={`#${acao.titulo}`} className={LINK_DO_CARTAO}>
                  <CartaoDeAcao
                    icone={acao.icone}
                    titulo={acao.titulo}
                    descricao={acao.descricao}
                    tom={acao.tom}
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

const meta = { title: "Painel/Painel" } satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

/** O painel inicial do mockup, composto dos componentes do design system. */
export const Inicio: Story = {
  name: "Início",
  render: () => <Painel />,
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(
      tela.getByRole("heading", {
        level: 1,
        name: "Seus documentos ganham vida.",
      })
    ).toBeInTheDocument();
    await expect(tela.getAllByText("Assinado")).toHaveLength(2);
    await expect(
      within(
        tela.getByRole("navigation", { name: "Ações rápidas" })
      ).getAllByRole("link")
    ).toHaveLength(4);
  },
};

/** O mesmo painel no tema escuro, forçado por `data-theme`. */
export const InicioEscuro: Story = {
  name: "Início no escuro",
  render: () => (
    <div
      data-theme="dark"
      className="-m-8 min-h-screen bg-background p-8 text-foreground"
    >
      <Painel />
    </div>
  ),
};
