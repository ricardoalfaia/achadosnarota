/**
 * Dados SINTÉTICOS de desenvolvimento. Os lugares, notas, ofertas e pessoas
 * daqui são inventados, a partir do protótipo; nada é real e nada disto vai
 * para produção (docs/produto/README, princípio 6). Telefones começam com 0
 * depois do DDD (número inexistente) e os sites usam example.com.
 *
 *   pnpm db:seed
 *
 * Idempotente: rodar de novo atualiza o catálogo pelo slug e não troca a
 * senha de quem já existe. Grava como DONO (DATABASE_URL_ADMIN): o catálogo
 * não tem caminho de escrita para o papel da app.
 */
import { generateRandomString, hashPassword } from "better-auth/crypto";
import { and, eq, inArray } from "drizzle-orm";

import { criarDb, encerrarDb, type Db } from "./client";
import { novoId } from "./id";
import * as s from "./schema";

if (process.env.APP_ENV === "production") {
  console.error("✗ seed é só para desenvolvimento.");
  process.exit(1);
}

const CIDADES = [
  { slug: "pindamonhangaba-sp", name: "Pindamonhangaba", state: "SP" },
  { slug: "campos-do-jordao-sp", name: "Campos do Jordão", state: "SP" },
  {
    slug: "sao-bento-do-sapucai-sp",
    name: "São Bento do Sapucaí",
    state: "SP",
  },
  {
    slug: "santo-antonio-do-pinhal-sp",
    name: "Santo Antônio do Pinhal",
    state: "SP",
  },
  {
    slug: "sao-francisco-xavier-sp",
    name: "São Francisco Xavier",
    state: "SP",
  },
] as const;

type CidadeSlug = (typeof CIDADES)[number]["slug"];

const CATEGORIAS = [
  { slug: "restaurantes", name: "Restaurantes", icon: "utensils" },
  { slug: "cafes", name: "Cafés", icon: "coffee" },
  { slug: "bares", name: "Bares", icon: "beer" },
  { slug: "pousadas", name: "Pousadas", icon: "house" },
  { slug: "atracoes", name: "Atrações", icon: "landmark" },
  { slug: "compras", name: "Compras", icon: "shopping-bag" },
] as const;

type CategoriaSlug = (typeof CATEGORIAS)[number]["slug"];

type Oferta = {
  title: string;
  terms: string;
  kind: s.OfferKind;
  icon: string;
  /** Padrão do banco: 1 uso por ano. */
  limitPerUser?: number;
  usagePeriod?: s.OfferUsagePeriod;
};

type Lugar = {
  slug: string;
  name: string;
  cidade: CidadeSlug;
  categoria: CategoriaSlug;
  specialty: string;
  summary: string;
  description: string;
  tags: string[];
  address: string;
  phone: string;
  fotos: { arquivo: string; alt: string; origem?: string }[];
  avaliacao: {
    summary: string;
    caveats?: string;
    visitedOn: string;
    seal: s.Seal | null;
  };
  ofertas: Oferta[];
};

type NotasPorCriterio = Partial<Record<s.Criterio, number>>;

/**
 * O que a curadoria registrou em cada visita fictícia: nota por critério (o
 * que não se aplica fica de fora), o achado imperdível e as dicas. A nota
 * geral do seed é a média dos critérios.
 */
const CURADORIA: Record<
  string,
  { criterios: NotasPorCriterio; destaque: string; dicas: string[] }
> = {
  "rancho-portugues": {
    criterios: {
      hygiene: 4.9,
      presentation: 4.8,
      flavor: 5,
      sophistication: 4.6,
      service: 4.8,
      ambience: 4.7,
      value: 4.5,
    },
    destaque: "Bacalhau à lagareiro, com batatas ao murro e muito azeite.",
    dicas: [
      "A sobremesa da casa é generosa: peça uma para dividir.",
      "Aos domingos, chegue antes do meio-dia para não esperar.",
      "A adega tem rótulos portugueses pouco comuns; peça indicação.",
    ],
  },
  "choperia-pinguim": {
    criterios: {
      hygiene: 4.6,
      presentation: 4.3,
      flavor: 4.8,
      sophistication: 3.9,
      service: 4.7,
      ambience: 4.8,
      value: 4.7,
    },
    destaque: "Chopp com colarinho cremoso, tirado na hora.",
    dicas: [
      "Peça a porção na panela de barro para a mesa.",
      "Às sextas tem música ao vivo: reserve antes.",
      "O chopp escuro sai pouco, mas vale provar.",
    ],
  },
  "cafe-da-serra": {
    criterios: {
      hygiene: 4.8,
      presentation: 4.6,
      flavor: 4.7,
      sophistication: 4.2,
      service: 4.5,
      ambience: 4.8,
      value: 4.4,
    },
    destaque: "Torta de maçã quente com café coado na hora.",
    dicas: [
      "As mesas da janela têm vista para a serra.",
      "Os grãos da casa são vendidos no balcão.",
    ],
  },
  "mirante-do-vale": {
    criterios: {
      hygiene: 5,
      presentation: 4.9,
      flavor: 4.9,
      sophistication: 4.8,
      service: 4.8,
      ambience: 5,
      value: 4.6,
    },
    destaque: "O menu degustação ao pôr do sol, no deck do mirante.",
    dicas: [
      "Reserve a mesa do deck para o fim da tarde.",
      "Leve um agasalho: venta bastante à noite.",
      "A harmonização com vinhos da região vale o acréscimo.",
    ],
  },
  "pousada-morada-dos-ventos": {
    criterios: {
      hygiene: 5,
      flavor: 4.8,
      sophistication: 4.8,
      service: 4.9,
      ambience: 5,
      value: 4.7,
    },
    destaque: "O café da manhã servido na varanda, com pães da casa.",
    dicas: [
      "Os chalés do alto têm a melhor vista do vale.",
      "Peça o café da manhã na varanda, sem custo extra.",
    ],
  },
  "emporio-rota-real": {
    criterios: {
      hygiene: 4.9,
      presentation: 4.7,
      flavor: 4.8,
      sophistication: 4.6,
      service: 4.8,
      ambience: 4.6,
      value: 4.9,
    },
    destaque: "A degustação guiada de queijos e azeites da Mantiqueira.",
    dicas: [
      "Pergunte pelos queijos de produção pequena: nem sempre estão expostos.",
      "Embalam para viagem com gelo, se você pedir.",
    ],
  },
};

function curadoriaDo(slug: string) {
  const curadoria = CURADORIA[slug];
  if (!curadoria) throw new Error(`Seed sem curadoria para ${slug}.`);
  const notas = Object.fromEntries(
    Object.entries(curadoria.criterios).map(([criterio, n]) => [
      criterio,
      n.toFixed(1),
    ])
  );
  return {
    ...notas,
    score: mediaDos(curadoria.criterios),
    highlight: curadoria.destaque,
    tips: curadoria.dicas,
  };
}

/** A média dos critérios avaliados, com uma casa, como texto para o numeric. */
function mediaDos(criterios: NotasPorCriterio): string {
  const notas = Object.values(criterios);
  const media = notas.reduce((soma, n) => soma + n, 0) / notas.length;
  return (Math.round(media * 10) / 10).toFixed(1);
}

const ORIGEM_DAS_FOTOS =
  "Imagem ilustrativa do protótipo; só para desenvolvimento.";

// Exceção registrada no ADR-0025: fotos de dois estabelecimentos cujos sites o
// responsável fez, para validar o app com parceiros antes da inauguração. Saem
// do repositório e do seed antes da produção inaugural.
const ORIGEM_DO_SITE =
  "Foto do site do estabelecimento, cedida ao responsável; só para validação antes da inauguração (ADR-0025).";

const LUGARES: Lugar[] = [
  {
    slug: "rancho-portugues",
    name: "Rancho Português",
    cidade: "pindamonhangaba-sp",
    categoria: "restaurantes",
    specialty: "Culinária Brasileira",
    summary:
      "Tradição, sabor e um ambiente acolhedor, com pratos típicos portugueses e um atendimento que faz você se sentir em casa.",
    description:
      "Salão rústico com deck voltado para a serra, cozinha de forno a lenha e porções para compartilhar. Bom para famílias e grupos na parada da viagem.",
    tags: ["Culinária Brasileira", "Ambiente Familiar", "Vista"],
    address: "Estrada do Rancho, km 98, Pindamonhangaba - SP",
    phone: "1200000001",
    fotos: [
      ["01-salao", "Salão com azulejos e pratos decorados na parede"],
      ["02-bacalhau", "Bacalhau à lagareiro servido no restaurante"],
      ["03-mesas", "Mesas postas com taças no salão"],
      ["04-adega", "Adega com prateleiras de vinhos"],
      ["05-polvo", "Polvo à provençal"],
    ].map(([arquivo, alt]) => ({
      arquivo: `rancho-portugues/${arquivo}`,
      alt: alt!,
      origem: ORIGEM_DO_SITE,
    })),
    avaliacao: {
      summary:
        "Bacalhau bem executado, porções generosas e serviço atento mesmo com a casa cheia. O deck vale a parada no fim da tarde.",
      caveats: "Movimento alto aos domingos; chegue antes do meio-dia.",
      visitedOn: "2026-09-14",
      seal: "featured",
    },
    ofertas: [
      {
        title: "Compre um prato principal e ganhe outro",
        terms:
          "O segundo prato principal, de valor igual ou menor, sai de graça. Para duas pessoas na mesma mesa, uma vez por ano.",
        kind: "two_for_one",
        icon: "gift",
        usagePeriod: "year",
      },
      {
        title: "10% de desconto no almoço",
        terms: "Válido de segunda a sexta. Apresente o cupom no local.",
        kind: "discount",
        icon: "percent",
      },
      {
        title: "Sobremesa cortesia no jantar",
        terms: "Válido todos os dias. Uma sobremesa por mesa.",
        kind: "courtesy",
        icon: "dessert",
      },
    ],
  },
  {
    slug: "choperia-pinguim",
    name: "Choperia Pinguim",
    cidade: "pindamonhangaba-sp",
    categoria: "bares",
    specialty: "Choperia",
    summary:
      "Chopp gelado, petiscos incríveis e ambiente descontraído para reunir a família e os amigos na rota.",
    description:
      "Casa ao lado da antiga estação, com chopp tirado na hora, petiscos de boteco e música ao vivo nas sextas.",
    tags: ["Chopp Artesanal", "Petiscos", "Música ao Vivo"],
    address: "Rua da Estação, 450, Centro, Pindamonhangaba - SP",
    phone: "1200000002",
    fotos: [
      ["01-chopp", "Chopp sendo tirado na torneira"],
      ["02-brinde", "Brinde com tulipas de chopp"],
      ["03-salao", "Salão do bar com televisões"],
      ["04-prato", "Prato servido na panela de barro"],
      ["05-tulipa", "Tulipa de chopp com colarinho cremoso"],
    ].map(([arquivo, alt]) => ({
      arquivo: `choperia-pinguim/${arquivo}`,
      alt: alt!,
      origem: ORIGEM_DO_SITE,
    })),
    avaliacao: {
      summary:
        "Chopp sempre na temperatura certa e colarinho bem tirado. Os pastéis são o ponto alto do cardápio.",
      visitedOn: "2026-09-21",
      seal: "beloved",
    },
    ofertas: [
      {
        title: "1 chopp cortesia na compra de 2",
        terms:
          "Válido de terça a domingo. Peça 2 chopps de 500 ml e ganhe o terceiro.",
        kind: "courtesy",
        icon: "beer",
        usagePeriod: "week",
      },
    ],
  },
  {
    slug: "cafe-da-serra",
    name: "Café da Serra",
    cidade: "campos-do-jordao-sp",
    categoria: "cafes",
    specialty: "Café & Confeitaria",
    summary:
      "Cafés especiais, doces artesanais e uma vista deslumbrante das montanhas da Serra da Mantiqueira.",
    description:
      "Cafeteria com torra própria, métodos filtrados e confeitaria da casa. Varanda envidraçada para os dias frios.",
    tags: ["Cafés Especiais", "Doces Artesanais", "Vista da Serra"],
    address: "Avenida das Hortênsias, 310, Capivari, Campos do Jordão - SP",
    phone: "1200000003",
    fotos: [
      { arquivo: "cafe-serra", alt: "Xícara de café com doces na varanda" },
      { arquivo: "rancho-int2", alt: "Varanda com vista para as montanhas" },
    ],
    avaliacao: {
      summary:
        "Grãos de produtores da região bem apresentados pela equipe. A torta de frutas vermelhas é o destaque.",
      visitedOn: "2026-10-02",
      seal: "verified",
    },
    ofertas: [
      {
        title: "Sobremesa cortesia no jantar",
        terms:
          "Válido todos os dias. Uma sobremesa por mesa na compra de prato principal.",
        kind: "courtesy",
        icon: "dessert",
      },
    ],
  },
  {
    slug: "mirante-do-vale",
    name: "Mirante do Vale",
    cidade: "sao-bento-do-sapucai-sp",
    categoria: "restaurantes",
    specialty: "Restaurante",
    summary:
      "Alta gastronomia contemporânea com uma das vistas mais lindas e panorâmicas da região.",
    description:
      "Menu degustação sazonal com ingredientes da Mantiqueira e carta de vinhos de altitude. Reserva recomendada.",
    tags: ["Alta Gastronomia", "Carta de Vinhos", "Deck Panorâmico"],
    address: "Estrada do Mirante, km 4, São Bento do Sapucaí - SP",
    phone: "1200000004",
    fotos: [
      { arquivo: "mirante", alt: "Deck do restaurante com vista para o vale" },
      { arquivo: "gourmet-plate", alt: "Prato do menu degustação" },
      { arquivo: "hero-road", alt: "Estrada da serra ao pôr do sol" },
    ],
    avaliacao: {
      summary:
        "Técnica precisa, ingredientes locais e serviço sem pressa. O pôr do sol do deck completa a experiência.",
      caveats: "Só com reserva aos sábados.",
      visitedOn: "2026-10-05",
      seal: "new",
    },
    ofertas: [
      {
        title: "15% de desconto no menu degustação",
        terms: "Válido para jantares com reserva prévia confirmada.",
        kind: "discount",
        icon: "tag",
      },
    ],
  },
  {
    slug: "pousada-morada-dos-ventos",
    name: "Pousada Morada dos Ventos",
    cidade: "santo-antonio-do-pinhal-sp",
    categoria: "pousadas",
    specialty: "Pousada",
    summary:
      "Chalés privativos com hidromassagem, lareira e vista privilegiada para o pôr do sol.",
    description:
      "Oito chalés espalhados pelo terreno, café da manhã servido no quarto e trilha própria até o mirante.",
    tags: ["Lareira", "Hidromassagem", "Pet Friendly"],
    address: "Estrada da Fazenda Velha, km 2, Santo Antônio do Pinhal - SP",
    phone: "1200000005",
    fotos: [
      { arquivo: "passport-bg", alt: "Chalé da pousada entre as montanhas" },
      { arquivo: "hero-road", alt: "Estrada de acesso à pousada" },
    ],
    avaliacao: {
      summary:
        "Chalés silenciosos e bem cuidados, café da manhã farto e equipe que conhece a região.",
      visitedOn: "2026-08-30",
      seal: "featured",
    },
    ofertas: [
      {
        title: "20% de desconto na 2ª diária",
        terms: "Válido de domingo a quinta-feira para chalés premium.",
        kind: "discount",
        icon: "bed",
      },
    ],
  },
  {
    slug: "emporio-rota-real",
    name: "Empório Rota Real",
    cidade: "sao-francisco-xavier-sp",
    categoria: "compras",
    specialty: "Compras & Degustação",
    summary:
      "Queijos artesanais da Mantiqueira, vinhos de altitude e azeites prensados na região.",
    description:
      "Empório de produtores locais com sala de degustação guiada e harmonizações aos fins de semana.",
    tags: ["Queijos Artesanais", "Vinhos de Altitude", "Empório"],
    address: "Rua Quinze de Novembro, 120, São Francisco Xavier - SP",
    phone: "1200000006",
    fotos: [
      { arquivo: "gourmet-plate", alt: "Tábua de queijos artesanais" },
      { arquivo: "cafe-serra", alt: "Balcão do empório" },
    ],
    avaliacao: {
      summary:
        "Seleção cuidadosa de pequenos produtores e explicação paciente na degustação.",
      visitedOn: "2026-09-07",
      seal: "verified",
    },
    ofertas: [
      {
        title: "Degustação guiada cortesia",
        terms: "Quatro queijos e dois vinhos. Apresente o cupom na recepção.",
        kind: "courtesy",
        icon: "wine",
      },
    ],
  },
];

const PLANO = {
  name: "Passaporte Anual",
  // R$ 129/ano é hipótese de teste (docs/produto/08), não tabela aprovada.
  priceCents: 12900,
};

const SENHA = "achados123";

const PESSOAS = [
  {
    email: "assinante@achados.local",
    name: "Ana Viajante",
    assinante: true,
    favoritos: ["rancho-portugues", "cafe-da-serra"],
  },
  {
    email: "visitante@achados.local",
    name: "Bruno Estradeiro",
    assinante: false,
    favoritos: [],
  },
] as const;

async function semearCatalogo(db: Db): Promise<Map<string, string>> {
  const idsDasCidades = new Map<string, string>();
  for (const cidade of CIDADES) {
    const [linha] = await db
      .insert(s.cities)
      .values({ id: novoId(), ...cidade })
      .onConflictDoUpdate({
        target: s.cities.slug,
        set: { name: cidade.name, state: cidade.state },
      })
      .returning({ id: s.cities.id });
    idsDasCidades.set(cidade.slug, linha!.id);
  }

  const idsDasCategorias = new Map<string, string>();
  for (const [posicao, categoria] of CATEGORIAS.entries()) {
    const [linha] = await db
      .insert(s.categories)
      .values({ id: novoId(), ...categoria, position: posicao })
      .onConflictDoUpdate({
        target: s.categories.slug,
        set: { name: categoria.name, icon: categoria.icon, position: posicao },
      })
      .returning({ id: s.categories.id });
    idsDasCategorias.set(categoria.slug, linha!.id);
  }

  const idsDosLugares = new Map<string, string>();
  const agora = new Date();
  for (const lugar of LUGARES) {
    const dados = {
      cityId: idsDasCidades.get(lugar.cidade)!,
      categoryId: idsDasCategorias.get(lugar.categoria)!,
      name: lugar.name,
      specialty: lugar.specialty,
      summary: lugar.summary,
      description: lugar.description,
      tags: lugar.tags,
      address: lugar.address,
      phone: lugar.phone,
      website: `https://example.com/${lugar.slug}`,
      status: "published" as const,
      publishedAt: agora,
    };
    const [linha] = await db
      .insert(s.places)
      .values({ id: novoId(), slug: lugar.slug, ...dados })
      .onConflictDoUpdate({ target: s.places.slug, set: dados })
      .returning({ id: s.places.id });
    const placeId = linha!.id;
    idsDosLugares.set(lugar.slug, placeId);

    // Fotos, avaliação e ofertas do lugar são refeitas a cada seed.
    await db.delete(s.placeMedia).where(eq(s.placeMedia.placeId, placeId));
    await db.insert(s.placeMedia).values(
      lugar.fotos.map((foto, posicao) => ({
        id: novoId(),
        placeId,
        url: `/exemplos/${foto.arquivo}.webp`,
        alt: foto.alt,
        source: foto.origem ?? ORIGEM_DAS_FOTOS,
        position: posicao,
      }))
    );

    await db
      .delete(s.editorialReviews)
      .where(eq(s.editorialReviews.placeId, placeId));
    await db.insert(s.editorialReviews).values({
      id: novoId(),
      placeId,
      ...lugar.avaliacao,
      caveats: lugar.avaliacao.caveats ?? null,
      ...curadoriaDo(lugar.slug),
      status: "published",
      publishedAt: agora,
    });

    await db.delete(s.offers).where(eq(s.offers.placeId, placeId));
    await db.insert(s.offers).values(
      lugar.ofertas.map((oferta, posicao) => ({
        id: novoId(),
        placeId,
        ...oferta,
        status: "active" as const,
        position: posicao,
      }))
    );
  }
  return idsDosLugares;
}

async function semearPlano(db: Db): Promise<string> {
  const [existente] = await db
    .select({ id: s.plans.id })
    .from(s.plans)
    .where(and(eq(s.plans.name, PLANO.name), eq(s.plans.version, 1)));
  if (existente) {
    await db
      .update(s.plans)
      .set({ priceCents: PLANO.priceCents, active: true })
      .where(eq(s.plans.id, existente.id));
    return existente.id;
  }
  const [criado] = await db
    .insert(s.plans)
    .values({ id: novoId(), ...PLANO, active: true })
    .returning({ id: s.plans.id });
  return criado!.id;
}

async function semearPessoas(
  db: Db,
  planId: string,
  idsDosLugares: Map<string, string>
) {
  for (const pessoa of PESSOAS) {
    let [usuario] = await db
      .select({ id: s.users.id })
      .from(s.users)
      .where(eq(s.users.email, pessoa.email));
    if (!usuario) {
      const id = novoId();
      await db.insert(s.users).values({
        id,
        name: pessoa.name,
        email: pessoa.email,
        emailVerified: true,
      });
      await db.insert(s.accounts).values({
        id: novoId(),
        accountId: id,
        providerId: "credential",
        userId: id,
        password: await hashPassword(SENHA),
      });
      usuario = { id };
    }

    if (pessoa.assinante) {
      const [ativa] = await db
        .select({ id: s.subscriptions.id })
        .from(s.subscriptions)
        .where(
          and(
            eq(s.subscriptions.userId, usuario.id),
            eq(s.subscriptions.status, "active")
          )
        );
      if (!ativa) {
        const inicio = new Date();
        inicio.setDate(inicio.getDate() - 30);
        const fim = new Date(inicio);
        fim.setFullYear(fim.getFullYear() + 1);
        // Assinatura de fixture: no sistema real ela só nasce do webhook
        // autenticado do provedor (ADR-006 de produto).
        await db.insert(s.subscriptions).values({
          id: novoId(),
          userId: usuario.id,
          planId,
          status: "active",
          providerSubscriptionId: `seed_${generateRandomString(12, "a-z", "0-9")}`,
          startsAt: inicio,
          endsAt: fim,
        });
      }
    }

    const favoritos = pessoa.favoritos
      .map((slug) => idsDosLugares.get(slug))
      .filter((id): id is string => Boolean(id));
    if (favoritos.length > 0) {
      await db
        .insert(s.favorites)
        .values(favoritos.map((placeId) => ({ userId: usuario.id, placeId })))
        .onConflictDoNothing();
    }
  }
}

async function main() {
  const url = process.env.DATABASE_URL_ADMIN;
  if (!url) throw new Error("DATABASE_URL_ADMIN não definida.");
  const db = criarDb(url, { max: 1 });
  try {
    const idsDosLugares = await semearCatalogo(db);
    const planId = await semearPlano(db);
    await semearPessoas(db, planId, idsDosLugares);

    // Lugares que saíram da lista do seed deixam de aparecer no app.
    const slugs = LUGARES.map((l) => l.slug);
    const todos = await db.select({ slug: s.places.slug }).from(s.places);
    const sobras = todos.map((l) => l.slug).filter((x) => !slugs.includes(x));
    if (sobras.length > 0)
      await db
        .update(s.places)
        .set({ status: "archived" })
        .where(inArray(s.places.slug, sobras));

    console.log(
      `✓ seed: ${CIDADES.length} cidades, ${CATEGORIAS.length} categorias, ${LUGARES.length} lugares, ${PESSOAS.length} pessoas (senha ${SENHA}).`
    );
  } finally {
    await encerrarDb(db);
  }
}

await main();
