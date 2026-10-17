// As áreas do menu lateral do Meuproduto (ADR-0018), na mesma ordem, sem o
// Início. Os nomes em cada idioma estão em textos.ts. Nenhuma tem guia ainda:
// a documentação mostra todas como "em construção".
export const MODULOS = [
  "documentos",
  "modelos",
  "assinaturas",
  "clientes",
  "equipe",
  "relatorios",
  "integracoes",
  "configuracoes",
] as const;

export type Modulo = (typeof MODULOS)[number];
