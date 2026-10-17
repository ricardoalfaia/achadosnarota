import Image from "next/image";
import { uiTranslations } from "fumadocs-ui/i18n";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

import { comIdioma, i18n, type Idioma } from "./idiomas";
import { textosDe } from "./textos";

// Textos dos componentes do Fumadocs. O inglês é o original da biblioteca.
export const traducoes = i18n
  .translations()
  .extend(uiTranslations())
  .add({
    "pt-BR": {
      displayName: "Português",
      "Back to Home(404 not found page)": "Voltar ao início",
      "Choose a language(language switcher)": "Escolha um idioma",
      "Choose a language(language switcher)(aria-label)": "Escolher idioma",
      "Close Search(search dialog)(aria-label)": "Fechar busca",
      "Close Sidebar(aria-label)": "Fechar menu",
      "Close Sidebar(sidebar)(aria-label)": "Fechar menu",
      "Collapse Sidebar(sidebar)(aria-label)": "Recolher menu",
      "Copied Anchor Link(heading anchor)(aria-label)": "Link copiado",
      "Copied Text(code block)(aria-label)": "Texto copiado",
      "Copy Anchor Link(heading anchor)(aria-label)": "Copiar link da seção",
      "Copy Text(code block)(aria-label)": "Copiar texto",
      "Dark(theme switcher)(aria-label)": "Escuro",
      "Hide Sidebar(sidebar)": "Esconder menu",
      "Language(language switcher)": "Idioma",
      "Last updated on(page footer)": "Atualizado em",
      "Light(theme switcher)(aria-label)": "Claro",
      "Next Page(pagination)": "Próxima página",
      "No Headings(table of contents)": "Sem seções",
      "No results found(search dialog)": "Nenhum resultado encontrado",
      "On this page(table of contents)": "Nesta página",
      "Open Search(search trigger)(aria-label)": "Abrir busca",
      "Open Sidebar(aria-label)": "Abrir menu",
      "Open Sidebar(sidebar)(aria-label)": "Abrir menu",
      "Options(aria-label)": "Opções",
      "Page Not Found(404 not found page)": "Página não encontrada",
      "Previous Page(pagination)": "Página anterior",
      "Search(search dialog)": "Buscar",
      "Search(search trigger)": "Buscar",
      "Show Sidebar(sidebar)": "Mostrar menu",
      "System(theme switcher)(aria-label)": "Sistema",
      "Table of Contents(inline table of contents)": "Sumário",
      "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 not found page)":
        "A página que você procura pode ter sido removida, mudado de nome ou estar indisponível no momento.",
      "Theme(site menu)": "Tema",
      "Toggle Menu(home layout header)(aria-label)": "Abrir ou fechar menu",
      "Toggle Theme(theme switcher)(aria-label)": "Trocar tema",
    },
    en: { displayName: "English" },
  });

/**
 * O logotipo do Meuproduto (símbolo, nome e lema). O texto é azul-escuro sobre
 * fundo transparente: a pílula clara o mantém legível também no tema escuro.
 */
export function Logotipo({ altura = 28 }: { altura?: number }) {
  // Proporção do arquivo original: 2162 x 727.
  const largura = Math.round((altura * 2162) / 727);
  return (
    <span className="inline-flex rounded-control bg-white px-1.5 py-0.5">
      <Image
        src="/logo-meuproduto.png"
        alt="Meuproduto"
        width={largura}
        height={altura}
      />
    </span>
  );
}

/** O que a página inicial e a documentação têm em comum: a marca no topo. */
export function opcoesDoLayout(idioma: Idioma): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <Logotipo />
          <span className="font-semibold">
            {textosDe(idioma).rotuloDaMarca}
          </span>
        </>
      ),
      url: comIdioma(idioma, "/"),
    },
    themeSwitch: { mode: "light-dark-system" },
  };
}
