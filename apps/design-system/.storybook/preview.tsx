import { useEffect } from "react";
import type { Preview } from "@storybook/react-vite";

import "../src/styles.css";

type Tema = "sistema" | "light" | "dark";

const preview: Preview = {
  globalTypes: {
    tema: {
      description: "Tema dos tokens",
      toolbar: {
        title: "Tema",
        icon: "mirror",
        dynamicTitle: true,
        items: [
          { value: "sistema", title: "Sistema" },
          { value: "light", title: "Claro" },
          { value: "dark", title: "Escuro" },
        ],
      },
    },
  },
  initialGlobals: { tema: "sistema" },
  parameters: {
    layout: "fullscreen",
    backgrounds: { disable: true },
    controls: { expanded: true },
    // Violação de acessibilidade reprova a história em `pnpm test`.
    a11y: { test: "error" },
  },
  decorators: [
    (Story, contexto) => {
      const tema = contexto.globals.tema as Tema;
      // O mesmo contrato do app: data-theme no <html> força o tema; ausente, segue o sistema.
      useEffect(() => {
        const raiz = document.documentElement;
        if (tema === "sistema") raiz.removeAttribute("data-theme");
        else raiz.setAttribute("data-theme", tema);
      }, [tema]);
      return (
        <div className="min-h-screen bg-background p-8 text-foreground">
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
