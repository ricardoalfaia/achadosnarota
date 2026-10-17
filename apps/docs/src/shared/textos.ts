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
  /** Os nomes seguem o menu lateral do sistema. */
  modulos: Record<Modulo, string>;
  rodape: { direitos: string };
};

const TEXTOS: Record<Idioma, Textos> = {
  "pt-BR": {
    nomeDoSite: "Meuproduto Docs",
    descricaoDoSite: "Documentação do Meuproduto para quem usa o sistema.",
    documentacao: "Documentação",
    rotuloDaMarca: "Docs",
    inicio: {
      selo: "Central de documentação",
      titulo: "Seus documentos",
      tituloDestaque: "ganham vida.",
      descricao:
        "Guias para conhecer o Meuproduto, entender cada área e resolver dúvidas do dia a dia.",
      comecar: "Começar a ler",
      buscar: "Buscar na documentação",
      acessoRapido: "Acesso rápido",
      secoes: "Por onde começar",
      secoesDescricao: "Escolha um caminho e siga no seu ritmo.",
      modulos: "Áreas do sistema",
      modulosDescricao: "As mesmas áreas do menu lateral do Meuproduto.",
      emConstrucao: "Em construção",
      verTodos: "Ver todas as áreas",
    },
    modulos: {
      documentos: "Documentos",
      modelos: "Modelos",
      assinaturas: "Assinaturas",
      clientes: "Clientes",
      equipe: "Equipe",
      relatorios: "Relatórios",
      integracoes: "Integrações",
      configuracoes: "Configurações",
    },
    rodape: { direitos: "Todos os direitos reservados." },
  },
  en: {
    nomeDoSite: "Meuproduto Docs",
    descricaoDoSite: "Meuproduto documentation for the people who use it.",
    documentacao: "Documentation",
    rotuloDaMarca: "Docs",
    inicio: {
      selo: "Documentation center",
      titulo: "Your documents",
      tituloDestaque: "come to life.",
      descricao:
        "Guides to get to know Meuproduto, understand each area and answer day-to-day questions.",
      comecar: "Start reading",
      buscar: "Search the documentation",
      acessoRapido: "Quick access",
      secoes: "Where to start",
      secoesDescricao: "Pick a path and go at your own pace.",
      modulos: "Areas of the system",
      modulosDescricao: "The same areas as the Meuproduto side menu.",
      emConstrucao: "Under construction",
      verTodos: "See all areas",
    },
    modulos: {
      documentos: "Documents",
      modelos: "Templates",
      assinaturas: "Signatures",
      clientes: "Clients",
      equipe: "Team",
      relatorios: "Reports",
      integracoes: "Integrations",
      configuracoes: "Settings",
    },
    rodape: { direitos: "All rights reserved." },
  },
};

export function textosDe(idioma: Idioma): Textos {
  return TEXTOS[idioma];
}
