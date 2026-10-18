// Regras puras do passaporte: situação, código do membro e preço. Testadas
// sem banco.

export type Passaporte =
  | {
      situacao: "ativo";
      /** Pago (assinatura) ou liberado pela equipe por 7 dias (cortesia). */
      origem: "assinatura" | "cortesia";
      validoAte: Date;
      codigoDoMembro: string;
    }
  | { situacao: "inativo" };

export type Plano = {
  id: string;
  nome: string;
  precoEmCentavos: number;
  moeda: string;
};

export type LinhaDaAssinatura = {
  id: string;
  status: string;
  startsAt: Date | null;
  endsAt: Date | null;
};

export type LinhaDaCortesia = {
  id: string;
  startsAt: Date;
  endsAt: Date;
  revokedAt: Date | null;
};

/**
 * O passaporte vale se a assinatura está `active` e o período cobre `agora`.
 * Assinatura ativa com período vencido não vale: a reconciliação com o
 * provedor pode atrasar, e o benefício não pode. Sem assinatura vigente, vale
 * a cortesia que cobre `agora` e não foi revogada (a mesma regra do banco ao
 * emitir o código, em `@achados/db`).
 */
export function passaporteDe(
  assinaturas: readonly LinhaDaAssinatura[],
  agora: Date,
  cortesias: readonly LinhaDaCortesia[] = []
): Passaporte {
  const vigente = assinaturas
    .filter(
      (a) =>
        a.status === "active" &&
        a.startsAt !== null &&
        a.endsAt !== null &&
        a.startsAt <= agora &&
        a.endsAt > agora
    )
    .sort((a, b) => b.endsAt!.getTime() - a.endsAt!.getTime())[0];
  if (!vigente) {
    const cortesia = cortesias.find(
      (c) => c.revokedAt === null && c.startsAt <= agora && c.endsAt > agora
    );
    if (!cortesia) return { situacao: "inativo" };
    return {
      situacao: "ativo",
      origem: "cortesia",
      validoAte: cortesia.endsAt,
      codigoDoMembro: codigoDoMembro(cortesia.id),
    };
  }
  return {
    situacao: "ativo",
    origem: "assinatura",
    validoAte: vigente.endsAt!,
    codigoDoMembro: codigoDoMembro(vigente.id),
  };
}

/**
 * O "ID do membro" do cartão: "AR-" e os seis últimos caracteres do id da
 * assinatura (a parte aleatória do ULID). Serve para o atendimento achar a
 * assinatura; não é senha nem código de resgate.
 */
export function codigoDoMembro(idDaAssinatura: string): string {
  return `AR-${idDaAssinatura.slice(-6).toUpperCase()}`;
}

/** 12900 → "R$ 129,00". */
export function formatarPreco(centavos: number, moeda = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: moeda,
  })
    .format(centavos / 100)
    .replace(/ /g, " ");
}

const DATA = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

/** "Válido até 16/10/2027". */
export function dataCurta(data: Date): string {
  return DATA.format(data);
}
