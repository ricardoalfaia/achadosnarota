/**
 * As iniciais de um nome: a primeira letra da primeira e da última palavra, em
 * maiúsculas ("João da Silva" → "JS"). Uma palavra só dá uma letra; nome vazio
 * dá texto vazio. Letras acentuadas e emojis contam como um caractere.
 */
export function iniciaisDoNome(nome: string): string {
  const palavras = nome.trim().split(/\s+/).filter(Boolean);
  const primeira = palavras[0];
  if (!primeira) return "";
  const letra = (palavra: string) => Array.from(palavra)[0] ?? "";
  const ultima = palavras.length > 1 ? palavras[palavras.length - 1] : "";
  return (letra(primeira) + (ultima ? letra(ultima) : "")).toLocaleUpperCase(
    "pt-BR"
  );
}
