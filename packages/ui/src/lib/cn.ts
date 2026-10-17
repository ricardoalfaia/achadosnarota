import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// O tailwind-merge só resolve conflitos de classes que conhece: os tokens de
// espaçamento e de raio próprios de tokens.css precisam ser declarados aqui.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: ["control-xs", "control-sm", "control-md", "control-lg"],
      radius: ["control", "card", "overlay"],
    },
  },
});

/** Junta classes do Tailwind resolvendo conflitos (`cn("p-2", ativo && "p-4")` → "p-4"). */
export function cn(...classes: ClassValue[]): string {
  return twMerge(clsx(classes));
}
