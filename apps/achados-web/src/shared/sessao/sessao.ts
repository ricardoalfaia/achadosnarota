// Tipos da sessão e o recorte que chega ao navegador. Sem import de servidor:
// a leitura da sessão está em `sessao.servidor.ts`.

/** Quem está logado, como o servidor usa. O id nunca vai para a interface. */
export type UsuarioDaSessao = {
  id: string;
  nome: string;
  email: string;
  foto?: string | undefined;
  /** Quando a conta foi criada: "Membro desde 2026" no perfil. */
  criadoEm: Date;
};

/**
 * Quem está usando o app, como o cabeçalho e o perfil mostram. É o que chega
 * ao navegador: sem token e sem id de usuário.
 */
export type PessoaDaSessao = {
  nome: string;
  /** Foto de quem entrou; sem ela, o avatar mostra as iniciais. */
  fotoUrl?: string;
};

/** O recorte seguro para a interface. */
export function pessoaDaSessao(usuario: UsuarioDaSessao): PessoaDaSessao {
  return {
    nome: usuario.nome,
    ...(usuario.foto ? { fotoUrl: usuario.foto } : {}),
  };
}

/** "Ana Souza" → "Ana", para a saudação. */
export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? "";
}
