const TECLAS: Record<string, string> = {
  ctrl: "Control",
  control: "Control",
  cmd: "Meta",
  "⌘": "Meta",
  alt: "Alt",
  shift: "Shift",
};

/**
 * A dica de atalho escrita para pessoas ("Ctrl K", "⌘ K", "Ctrl+Shift+F")
 * no formato de `aria-keyshortcuts` ("Control+K"). Só descreve: quem registra
 * o atalho é a aplicação.
 */
export function atalhoParaAria(atalho: string): string {
  return atalho
    .split(/[\s+]+/)
    .filter(Boolean)
    .map((tecla) => TECLAS[tecla.toLowerCase()] ?? tecla.toUpperCase())
    .join("+");
}
