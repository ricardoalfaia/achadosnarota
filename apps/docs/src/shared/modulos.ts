// As áreas da barra de navegação do app Achados na Rota (ADR-0025), na mesma
// ordem. Os nomes em cada idioma estão em textos.ts. Nenhuma tem guia ainda:
// a documentação mostra todas como "em construção".
export const MODULOS = [
  "explorar",
  "favoritos",
  "passaporte",
  "perfil",
] as const;

export type Modulo = (typeof MODULOS)[number];
