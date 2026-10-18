import "server-only";

import {
  novoId,
  type Category,
  type City,
  type EditorialReview,
  type Offer,
  type Place,
  type PlaceMedia,
} from "@achados/db";

// PROVISÓRIO (fase visual do painel): as linhas têm o formato das tabelas do
// @achados/db, para as consultas das features mapearem linha → domínio como
// farão com o Drizzle. Tudo aqui é sintético: casas, notas e promoções de
// exemplo, sem pessoa real, que só existem no desenvolvimento
// (`guarda.ts`). Fica no processo e some ao reiniciar o servidor.

export type Tabelas = {
  city: City[];
  category: Category[];
  place: Place[];
  place_media: PlaceMedia[];
  offer: Offer[];
  editorial_review: EditorialReview[];
};

const AGORA = Date.now();
const DIA = 24 * 60 * 60 * 1000;
const diasAtras = (dias: number) => new Date(AGORA - dias * DIA);
const diasAFrente = (dias: number) => new Date(AGORA + dias * DIA);

function semear(): Tabelas {
  const cidade = (state: string, name: string, slug: string): City => ({
    id: novoId(),
    state,
    name,
    slug,
    createdAt: diasAtras(90),
  });
  const cidades = {
    pinda: cidade("SP", "Pindamonhangaba", "pindamonhangaba-sp"),
    campos: cidade("SP", "Campos do Jordão", "campos-do-jordao-sp"),
    taubate: cidade("SP", "Taubaté", "taubate-sp"),
    cunha: cidade("SP", "Cunha", "cunha-sp"),
    saoLuiz: cidade(
      "SP",
      "São Luiz do Paraitinga",
      "sao-luiz-do-paraitinga-sp"
    ),
  };

  const categoria = (
    slug: string,
    name: string,
    icon: string,
    position: number
  ): Category => ({
    id: novoId(),
    slug,
    name,
    icon,
    position,
    createdAt: diasAtras(90),
  });
  const categorias = {
    restaurante: categoria("restaurantes", "Restaurantes", "utensils", 0),
    cafe: categoria("cafes", "Cafés", "coffee", 1),
    bar: categoria("bares", "Bares", "beer", 2),
    pousada: categoria("pousadas", "Pousadas", "bed", 3),
  };

  type Semente = {
    nome: string;
    slug: string;
    cidade: City;
    categoria: Category;
    especialidade: string;
    resumo: string;
    status: Place["status"];
    tags: string[];
    atualizado: number;
  };

  const sementes: Semente[] = [
    {
      nome: "Casa Ipê Amarelo",
      slug: "casa-ipe-amarelo",
      cidade: cidades.pinda,
      categoria: categorias.restaurante,
      especialidade: "Culinária Caipira",
      resumo:
        "Fogão a lenha, panelas de barro e quintal com vista para a serra.",
      status: "published",
      tags: ["Fogão a lenha", "Família", "Almoço"],
      atualizado: 2,
    },
    {
      nome: "Empório Serra Fina",
      slug: "emporio-serra-fina",
      cidade: cidades.campos,
      categoria: categorias.cafe,
      especialidade: "Cafés Especiais",
      resumo: "Torra própria, pães de fermentação natural e doces da casa.",
      status: "published",
      tags: ["Café da manhã", "Pet friendly"],
      atualizado: 5,
    },
    {
      nome: "Bistrô Quatro Estações",
      slug: "bistro-quatro-estacoes",
      cidade: cidades.campos,
      categoria: categorias.restaurante,
      especialidade: "Cozinha de Montanha",
      resumo: "Menu da estação com ingredientes de pequenos produtores.",
      status: "published",
      tags: ["Jantar", "Romântico", "Vinhos"],
      atualizado: 1,
    },
    {
      nome: "Pousada Vale do Silêncio",
      slug: "pousada-vale-do-silencio",
      cidade: cidades.cunha,
      categoria: categorias.pousada,
      especialidade: "Chalés na Montanha",
      resumo: "Chalés com lareira, trilhas próprias e café colonial.",
      status: "draft",
      tags: ["Lareira", "Trilhas"],
      atualizado: 0,
    },
    {
      nome: "Choperia Ponte Velha",
      slug: "choperia-ponte-velha",
      cidade: cidades.taubate,
      categoria: categorias.bar,
      especialidade: "Chope Artesanal",
      resumo: "Torneiras de cervejarias da região e petiscos de boteco.",
      status: "published",
      tags: ["Happy hour", "Música ao vivo"],
      atualizado: 9,
    },
    {
      nome: "Cantina do Largo",
      slug: "cantina-do-largo",
      cidade: cidades.saoLuiz,
      categoria: categorias.restaurante,
      especialidade: "Massas Artesanais",
      resumo: "Massa fresca feita no salão, molhos de longo cozimento.",
      status: "draft",
      tags: ["Família", "Massas"],
      atualizado: 3,
    },
    {
      nome: "Café Estação 1914",
      slug: "cafe-estacao-1914",
      cidade: cidades.pinda,
      categoria: categorias.cafe,
      especialidade: "Confeitaria",
      resumo: "Antigo armazém da ferrovia com bolos de receita de família.",
      status: "published",
      tags: ["Histórico", "Tarde"],
      atualizado: 14,
    },
    {
      nome: "Recanto das Araucárias",
      slug: "recanto-das-araucarias",
      cidade: cidades.campos,
      categoria: categorias.pousada,
      especialidade: "Hospedagem Boutique",
      resumo: "Doze suítes entre araucárias, spa e restaurante próprio.",
      status: "published",
      tags: ["Spa", "Casal"],
      atualizado: 20,
    },
    {
      nome: "Armazém Paraitinga",
      slug: "armazem-paraitinga",
      cidade: cidades.saoLuiz,
      categoria: categorias.bar,
      especialidade: "Cachaças da Região",
      resumo: "Balcão de madeira, cachaças de alambique e petiscos caipiras.",
      status: "archived",
      tags: ["Cachaça"],
      atualizado: 40,
    },
    {
      nome: "Sabor de Cunha",
      slug: "sabor-de-cunha",
      cidade: cidades.cunha,
      categoria: categorias.restaurante,
      especialidade: "Cozinha Tropeira",
      resumo: "Pratos tropeiros servidos em louça da cerâmica local.",
      status: "published",
      tags: ["Cerâmica", "Almoço"],
      atualizado: 6,
    },
  ];

  const place: Place[] = sementes.map((s) => ({
    id: novoId(),
    cityId: s.cidade.id,
    categoryId: s.categoria.id,
    slug: s.slug,
    name: s.nome,
    specialty: s.especialidade,
    summary: s.resumo,
    description: null,
    tags: s.tags,
    address: null,
    phone: null,
    website: null,
    latitude: null,
    longitude: null,
    status: s.status,
    publishedAt: s.status === "published" ? diasAtras(s.atualizado + 30) : null,
    createdAt: diasAtras(s.atualizado + 60),
    updatedAt: diasAtras(s.atualizado),
  }));

  const porSlug = (slug: string) => {
    const lugar = place.find((p) => p.slug === slug);
    if (!lugar) throw new Error(`Semente sem casa: ${slug}`);
    return lugar.id;
  };

  const place_media: PlaceMedia[] = place
    .filter((p) => p.status !== "archived")
    .flatMap((p, indice) =>
      Array.from({ length: (indice % 4) + 1 }, (_, position) => ({
        id: novoId(),
        placeId: p.id,
        url: "",
        alt: `Foto ${position + 1} de ${p.name}`,
        source: "Exemplo sintético do desenvolvimento",
        position,
        createdAt: p.createdAt,
      }))
    );

  const oferta = (
    slug: string,
    title: string,
    kind: Offer["kind"],
    icon: string,
    status: Offer["status"],
    validade: [number, number] | null,
    atualizado: number
  ): Offer => ({
    id: novoId(),
    placeId: porSlug(slug),
    title,
    terms:
      "Válido para assinantes do passaporte, mediante código no app. Não cumulativo com outras promoções.",
    kind,
    icon,
    limitPerUser: 1,
    usagePeriod: "year",
    validFrom: validade ? diasAtras(validade[0]) : null,
    validUntil: validade ? diasAFrente(validade[1]) : null,
    status,
    position: 0,
    createdAt: diasAtras(atualizado + 10),
    updatedAt: diasAtras(atualizado),
  });

  const offer: Offer[] = [
    oferta(
      "casa-ipe-amarelo",
      "Sobremesa da casa no almoço",
      "courtesy",
      "dessert",
      "active",
      [20, 70],
      3
    ),
    oferta(
      "emporio-serra-fina",
      "10% no café da manhã",
      "discount",
      "percent",
      "active",
      [10, 50],
      4
    ),
    oferta(
      "bistro-quatro-estacoes",
      "Taça de vinho na entrada",
      "courtesy",
      "wine",
      "pending_review",
      null,
      0
    ),
    oferta(
      "choperia-ponte-velha",
      "Segundo chope por conta da casa",
      "courtesy",
      "beer",
      "active",
      [30, 25],
      8
    ),
    oferta(
      "cafe-estacao-1914",
      "Fatia de bolo com o café",
      "courtesy",
      "dessert",
      "paused",
      [40, 20],
      12
    ),
    oferta(
      "recanto-das-araucarias",
      "15% na diária de domingo a quinta",
      "discount",
      "percent",
      "active",
      [15, 120],
      6
    ),
    oferta(
      "sabor-de-cunha",
      "Suco natural na refeição",
      "courtesy",
      "gift",
      "draft",
      null,
      1
    ),
    oferta(
      "armazem-paraitinga",
      "Dose de cachaça de boas-vindas",
      "courtesy",
      "gift",
      "expired",
      [120, -10],
      30
    ),
  ];

  const avaliacao = (
    slug: string,
    score: string,
    status: EditorialReview["status"],
    seal: EditorialReview["seal"],
    notas: Partial<
      Record<
        | "hygiene"
        | "presentation"
        | "flavor"
        | "sophistication"
        | "service"
        | "ambience"
        | "value",
        string
      >
    >,
    visitado: number
  ): EditorialReview => ({
    id: novoId(),
    placeId: porSlug(slug),
    score,
    summary:
      "Parecer de exemplo do desenvolvimento: texto sintético para desenhar a tela.",
    caveats: null,
    hygiene: notas.hygiene ?? null,
    presentation: notas.presentation ?? null,
    flavor: notas.flavor ?? null,
    sophistication: notas.sophistication ?? null,
    service: notas.service ?? null,
    ambience: notas.ambience ?? null,
    value: notas.value ?? null,
    highlight: null,
    tips: [],
    visitedOn: diasAtras(visitado).toISOString().slice(0, 10),
    seal,
    status,
    publishedAt: status === "published" ? diasAtras(visitado - 5) : null,
    createdAt: diasAtras(visitado),
    updatedAt: diasAtras(Math.max(visitado - 6, 0)),
  });

  const editorial_review: EditorialReview[] = [
    avaliacao(
      "casa-ipe-amarelo",
      "4.7",
      "published",
      "beloved",
      {
        hygiene: "4.8",
        presentation: "4.5",
        flavor: "4.9",
        service: "4.6",
        ambience: "4.7",
        value: "4.6",
      },
      40
    ),
    avaliacao(
      "emporio-serra-fina",
      "4.5",
      "published",
      "verified",
      {
        hygiene: "4.7",
        presentation: "4.4",
        flavor: "4.6",
        service: "4.3",
        ambience: "4.5",
        value: "4.4",
      },
      35
    ),
    avaliacao(
      "bistro-quatro-estacoes",
      "4.8",
      "in_review",
      "featured",
      {
        hygiene: "4.9",
        presentation: "4.9",
        flavor: "4.8",
        sophistication: "4.8",
        service: "4.7",
        ambience: "4.8",
        value: "4.4",
      },
      8
    ),
    avaliacao(
      "choperia-ponte-velha",
      "4.2",
      "published",
      null,
      {
        hygiene: "4.1",
        flavor: "4.4",
        service: "4.2",
        ambience: "4.3",
        value: "4.0",
      },
      60
    ),
    avaliacao(
      "cafe-estacao-1914",
      "4.4",
      "approved",
      null,
      {
        hygiene: "4.6",
        presentation: "4.3",
        flavor: "4.5",
        service: "4.2",
        ambience: "4.6",
        value: "4.3",
      },
      12
    ),
    avaliacao(
      "recanto-das-araucarias",
      "4.9",
      "published",
      "featured",
      { hygiene: "5.0", service: "4.9", ambience: "5.0", value: "4.6" },
      25
    ),
    avaliacao(
      "pousada-vale-do-silencio",
      "4.3",
      "draft",
      "new",
      { hygiene: "4.5", service: "4.2", ambience: "4.6", value: "4.0" },
      4
    ),
    avaliacao(
      "sabor-de-cunha",
      "4.6",
      "in_review",
      null,
      {
        hygiene: "4.6",
        presentation: "4.4",
        flavor: "4.8",
        service: "4.5",
        ambience: "4.5",
        value: "4.7",
      },
      10
    ),
  ];

  return {
    city: Object.values(cidades),
    category: Object.values(categorias),
    place,
    place_media,
    offer,
    editorial_review,
  };
}

// No processo, não no módulo: o recarregamento do `next dev` reavalia o
// módulo e perderia o que foi gravado durante a sessão.
const CHAVE = Symbol.for("achados-admin.banco-em-memoria");
type Recipiente = { [CHAVE]?: Tabelas };

/** As tabelas sintéticas do processo, criadas na primeira leitura. */
export function bancoEmMemoria(): Tabelas {
  const recipiente = globalThis as Recipiente;
  recipiente[CHAVE] ??= semear();
  return recipiente[CHAVE];
}

/** Uma ida ao banco leva tempo: o atraso deixa ver esqueletos e transições. */
export function latenciaSimulada(ms = 350): Promise<void> {
  return new Promise((resolver) => setTimeout(resolver, ms));
}
