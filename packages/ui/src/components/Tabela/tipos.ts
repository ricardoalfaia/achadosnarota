import type { ReactNode } from "react";

/** O que a coluna guarda. Define o alinhamento, a ordenação e as condições de filtro. */
export type TipoDeColuna = "texto" | "numero" | "data";

/** Valor bruto de uma célula. Datas vêm como `AAAA-MM-DD`, que ordena como texto. */
export type ValorDeCelula = string | number | null;

/**
 * Uma coluna da tabela. É o contrato entre quem conhece os dados (a fonte de
 * dados da tela) e a tabela, que só sabe mostrar, ordenar e filtrar.
 */
export type ColunaDaTabela<T> = {
  /** Identidade estável: usada na ordem, na largura e nos filtros gravados. */
  id: string;
  titulo: string;
  /** Valor usado para ordenar e filtrar. */
  valor: (linha: T) => ValorDeCelula;
  tipo?: TipoDeColuna;
  /** Texto exibido na célula e na lista de valores do filtro. */
  formatar?: (valor: ValorDeCelula) => string;
  /** Conteúdo próprio da célula (selo, link). O filtro continua usando `valor` e `formatar`. */
  celula?: (linha: T) => ReactNode;
  /** Largura inicial em px. */
  largura?: number;
  larguraMinima?: number;
  /** Padrão: números à direita, o resto à esquerda. */
  alinhamento?: "inicio" | "centro" | "fim";
  /** Fica presa à esquerda durante a rolagem horizontal. */
  fixa?: boolean;
  /** A célula pode ser editada, sempre ou conforme a linha. Exige `aoEditar` na tabela. */
  editavel?: boolean | ((linha: T) => boolean);
  semFiltro?: boolean;
  semOrdenacao?: boolean;
};

/** Uma célula alterada pela pessoa, já convertida para o tipo da coluna. */
export type EdicaoDeCelula<T> = {
  linha: T;
  idDaLinha: string;
  /** `id` da coluna editada. */
  coluna: string;
  valor: ValorDeCelula;
};

export type OperadorDeTexto =
  "igual" | "diferente" | "comecaCom" | "terminaCom" | "contem" | "naoContem";

export type OperadorDeNumero =
  | "igual"
  | "diferente"
  | "maiorQue"
  | "maiorOuIgual"
  | "menorQue"
  | "menorOuIgual";

/** Como as duas cláusulas do filtro customizado se combinam. */
export type JuncaoDeFiltro = "e" | "ou";

/**
 * Condição sobre o valor da coluna, como o "Filtro personalizado" do Excel:
 * uma cláusula e, opcionalmente, uma segunda unida por E ou OU.
 */
export type CondicaoDeFiltro =
  | {
      tipo: "texto";
      operador: OperadorDeTexto;
      termo: string;
      /** Compara o texto como está, com acento e caixa. Padrão: ignora os dois. */
      diferenciarCaixa?: boolean;
      segunda?: {
        juncao: JuncaoDeFiltro;
        operador: OperadorDeTexto;
        termo: string;
      };
    }
  | {
      tipo: "numero";
      operador: OperadorDeNumero;
      termo: number;
      segunda?: {
        juncao: JuncaoDeFiltro;
        operador: OperadorDeNumero;
        termo: number;
      };
    };

/**
 * Filtro de uma coluna, como no menu do Excel: a lista de valores marcados e,
 * opcionalmente, uma condição. Os dois precisam ser satisfeitos.
 */
export type FiltroDeColuna = {
  /** Chaves (`chaveDoValor`) dos valores aceitos. Ausente: todos. */
  valores?: ReadonlySet<string>;
  condicao?: CondicaoDeFiltro;
};
