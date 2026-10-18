// O que a descoberta mostra, já no formato da interface. Sem ids internos:
// lugar e categoria são identificados pelo slug, que é público.

/** Selo editorial sobre a foto (ADR-004 de produto: decidido pela curadoria). */
export type Selo = "featured" | "beloved" | "verified" | "new";

export type Categoria = {
  slug: string;
  nome: string;
  /** Chave de apresentação do ícone, traduzida em `icones.tsx`. */
  icone: string;
};

export type Cidade = {
  slug: string;
  nome: string;
  uf: string;
};

export type Foto = {
  url: string;
  alt: string;
};

/** Oferta comercial do parceiro, mostrada com as regras (docs/produto/08). */
export type Beneficio = {
  id: string;
  titulo: string;
  regras: string;
  icone: string;
  tipo: "discount" | "courtesy";
};

/** Parecer editorial publicado. Nota de 0 a 5. */
export type Avaliacao = {
  nota: number;
  parecer: string;
  ressalvas?: string;
  /** Data da visita, ISO (AAAA-MM-DD). */
  visitadoEm: string;
  selo?: Selo;
};

export type CartaoDeLugar = {
  slug: string;
  nome: string;
  especialidade: string;
  resumo: string;
  /** "Pindamonhangaba - SP" */
  local: string;
  categoria: Pick<Categoria, "slug" | "nome">;
  foto?: Foto;
  nota?: number;
  selo?: Selo;
  /** O primeiro benefício ativo, para a faixa do cartão. */
  beneficio?: Pick<Beneficio, "titulo" | "icone">;
};

export type FichaDoLugar = CartaoDeLugar & {
  descricao?: string;
  tags: string[];
  endereco?: string;
  /** Só dígitos, com DDD. */
  telefone?: string;
  site?: string;
  fotos: Foto[];
  avaliacao?: Avaliacao;
  beneficios: Beneficio[];
};

/** Filtros da exploração, vindos da URL (P07). */
export type FiltroDoCatalogo = {
  categoria?: string;
  cidade?: string;
  busca?: string;
};

/** O topo da exploração: os primeiros destaques e os totais do catálogo. */
export type VitrineDoCatalogo = {
  /** Os primeiros da curadoria, na ordem dela (selo, depois nota). */
  destaques: CartaoDeLugar[];
  lugares: number;
  cidades: number;
};
