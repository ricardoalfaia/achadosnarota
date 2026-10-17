// "Lembrar meu e-mail": só o e-mail fica no navegador, para vir preenchido na
// próxima vez. A senha e a sessão nunca passam por aqui.

export const CHAVE_DO_USUARIO_LEMBRADO = "achados-email-lembrado";

/** O que precisamos do `localStorage`; nos testes, um Map faz o papel. */
export type Armazenamento = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function lerUsuarioLembrado(armazenamento: Armazenamento): string {
  return armazenamento.getItem(CHAVE_DO_USUARIO_LEMBRADO) ?? "";
}

/** Guarda o usuário quando a pessoa pediu; caso contrário, esquece o que havia. */
export function guardarUsuarioLembrado(
  armazenamento: Armazenamento,
  usuario: string,
  lembrar: boolean
): void {
  const limpo = usuario.trim();
  if (lembrar && limpo) armazenamento.setItem(CHAVE_DO_USUARIO_LEMBRADO, limpo);
  else armazenamento.removeItem(CHAVE_DO_USUARIO_LEMBRADO);
}
