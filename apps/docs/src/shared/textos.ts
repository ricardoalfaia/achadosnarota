import type { Idioma } from "./idiomas";
import type { Modulo } from "./modulos";

// Textos das telas próprias deste app (início e navegação). Os textos dos
// componentes do Fumadocs estão em layout.tsx; o conteúdo, em content/docs.
type Textos = {
  nomeDoSite: string;
  descricaoDoSite: string;
  documentacao: string;
  /** Rótulo ao lado do logotipo, no topo. */
  rotuloDaMarca: string;
  inicio: {
    selo: string;
    /** O lema é dividido para a segunda parte receber o degradê da marca. */
    titulo: string;
    tituloDestaque: string;
    descricao: string;
    comecar: string;
    buscar: string;
    acessoRapido: string;
    secoes: string;
    secoesDescricao: string;
    modulos: string;
    modulosDescricao: string;
    emConstrucao: string;
    verTodos: string;
  };
  /** Os nomes seguem a barra de navegação do app. */
  modulos: Record<Modulo, string>;
  rodape: { direitos: string };
};

const TEXTOS: Record<Idioma, Textos> = {
  "pt-BR": {
    nomeDoSite: "Achados na Rota Docs",
    descricaoDoSite: "Documentação do Achados na Rota para quem usa o app.",
    documentacao: "Documentação",
    rotuloDaMarca: "Docs",
    inicio: {
      selo: "Central de documentação",
      titulo: "Descubra lugares",
      tituloDestaque: "que valem a pena.",
      descricao:
        "Guias para conhecer o Achados na Rota, o passaporte de benefícios e cada área do app.",
      comecar: "Começar a ler",
      buscar: "Buscar na documentação",
      acessoRapido: "Acesso rápido",
      secoes: "Por onde começar",
      secoesDescricao: "Escolha um caminho e siga no seu ritmo.",
      modulos: "Áreas do app",
      modulosDescricao: "As mesmas áreas da barra de navegação do app.",
      emConstrucao: "Em construção",
      verTodos: "Ver todas as áreas",
    },
    modulos: {
      explorar: "Explorar",
      favoritos: "Favoritos",
      passaporte: "Passaporte",
      perfil: "Perfil",
    },
    rodape: { direitos: "Todos os direitos reservados." },
  },
  en: {
    nomeDoSite: "Achados na Rota Docs",
    descricaoDoSite:
      "Achados na Rota documentation for the people who use the app.",
    documentacao: "Documentation",
    rotuloDaMarca: "Docs",
    inicio: {
      selo: "Documentation center",
      titulo: "Discover places",
      tituloDestaque: "worth the trip.",
      descricao:
        "Guides to get to know Achados na Rota, the benefits passport and each area of the app.",
      comecar: "Start reading",
      buscar: "Search the documentation",
      acessoRapido: "Quick access",
      secoes: "Where to start",
      secoesDescricao: "Pick a path and go at your own pace.",
      modulos: "Areas of the app",
      modulosDescricao: "The same areas as the app navigation bar.",
      emConstrucao: "Under construction",
      verTodos: "See all areas",
    },
    modulos: {
      explorar: "Explore",
      favoritos: "Favorites",
      passaporte: "Passport",
      perfil: "Profile",
    },
    rodape: { direitos: "All rights reserved." },
  },
};

export function textosDe(idioma: Idioma): Textos {
  return TEXTOS[idioma];
}
