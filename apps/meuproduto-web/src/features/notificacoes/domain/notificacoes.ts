// As notificações da faixa do topo. Regras puras (filtro, grupos, contagem) e
// os dados PROVISÓRIOS e sintéticos, até existir a API de notificações.
// Títulos, textos e "quando" vêm das traduções (`Notificacoes.itens.<id>`),
// sem nomes de pessoas nem dados de clientes.

export type TipoDeNotificacao = "sucesso" | "aviso" | "info";
export type GrupoDeNotificacao = "hoje" | "anteriores";
export type ModuloDeNotificacao =
  "documentos" | "assinaturas" | "modelos" | "sistema";

export type IdDeNotificacao =
  | "assinaturaConcluida"
  | "assinaturaPendente"
  | "documentoGerado"
  | "assinaturaRecusada"
  | "modeloAtualizado"
  | "versao";

export type Notificacao = {
  id: IdDeNotificacao;
  grupo: GrupoDeNotificacao;
  tipo: TipoDeNotificacao;
  modulo: ModuloDeNotificacao;
  lida: boolean;
};

export type FiltroDeNotificacoes = "todas" | "naoLidas" | "assinaturas";

/** PROVISÓRIO: exemplos sintéticos, para o painel ter o que mostrar. */
export const NOTIFICACOES_PROVISORIAS: readonly Notificacao[] = [
  {
    id: "assinaturaConcluida",
    grupo: "hoje",
    tipo: "sucesso",
    modulo: "assinaturas",
    lida: false,
  },
  {
    id: "assinaturaPendente",
    grupo: "hoje",
    tipo: "aviso",
    modulo: "assinaturas",
    lida: false,
  },
  {
    id: "documentoGerado",
    grupo: "hoje",
    tipo: "sucesso",
    modulo: "documentos",
    lida: false,
  },
  {
    id: "assinaturaRecusada",
    grupo: "anteriores",
    tipo: "aviso",
    modulo: "assinaturas",
    lida: true,
  },
  {
    id: "modeloAtualizado",
    grupo: "anteriores",
    tipo: "info",
    modulo: "modelos",
    lida: true,
  },
  {
    id: "versao",
    grupo: "anteriores",
    tipo: "info",
    modulo: "sistema",
    lida: true,
  },
];

export function filtrarNotificacoes(
  lista: readonly Notificacao[],
  filtro: FiltroDeNotificacoes
): readonly Notificacao[] {
  switch (filtro) {
    case "todas":
      return lista;
    case "naoLidas":
      return lista.filter((n) => !n.lida);
    case "assinaturas":
      return lista.filter((n) => n.modulo === "assinaturas");
  }
}

/** Os grupos na ordem em que aparecem, cada um com as suas notificações. */
export function agruparNotificacoes(
  lista: readonly Notificacao[]
): readonly { grupo: GrupoDeNotificacao; itens: readonly Notificacao[] }[] {
  const grupos: readonly GrupoDeNotificacao[] = ["hoje", "anteriores"];
  return grupos
    .map((grupo) => ({ grupo, itens: lista.filter((n) => n.grupo === grupo) }))
    .filter(({ itens }) => itens.length > 0);
}

export function naoLidas(lista: readonly Notificacao[]): number {
  return lista.filter((n) => !n.lida).length;
}

export function marcarComoLida(
  lista: readonly Notificacao[],
  id: IdDeNotificacao
): readonly Notificacao[] {
  return lista.map((n) => (n.id === id ? { ...n, lida: true } : n));
}

export function marcarTodasComoLidas(
  lista: readonly Notificacao[]
): readonly Notificacao[] {
  return lista.map((n) => (n.lida ? n : { ...n, lida: true }));
}
