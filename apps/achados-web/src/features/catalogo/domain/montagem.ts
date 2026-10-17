import { localDoLugar } from "./apresentacao";
import type { Beneficio, CartaoDeLugar, Foto, Selo } from "./tipos";

// Junta as linhas lidas do banco (lugar, primeira foto, avaliação e
// benefícios) nos tipos da interface. Pura: as consultas buscam, isto monta.

export type LinhaDoLugar = {
  id: string;
  slug: string;
  nome: string;
  especialidade: string;
  resumo: string;
  cidade: string;
  uf: string;
  categoriaSlug: string;
  categoriaNome: string;
  /** Nota como o Postgres devolve um numeric: texto. */
  nota: string | null;
  selo: Selo | null;
};

export type LinhaDaFoto = Foto & { lugarId: string; posicao: number };
export type LinhaDoBeneficio = Beneficio & {
  lugarId: string;
  posicao: number;
};

/** A nota numérica, ou `undefined` se não houver avaliação publicada. */
export function notaDe(texto: string | null): number | undefined {
  if (texto === null) return undefined;
  const nota = Number(texto);
  return Number.isFinite(nota) ? nota : undefined;
}

function porPosicao<T extends { posicao: number }>(a: T, b: T) {
  return a.posicao - b.posicao;
}

/** Agrupa por lugar, em ordem de posição. */
export function agruparPorLugar<T extends { lugarId: string; posicao: number }>(
  linhas: readonly T[]
): Map<string, T[]> {
  const grupos = new Map<string, T[]>();
  for (const linha of [...linhas].sort(porPosicao)) {
    const grupo = grupos.get(linha.lugarId) ?? [];
    grupo.push(linha);
    grupos.set(linha.lugarId, grupo);
  }
  return grupos;
}

export function montarCartao(
  lugar: LinhaDoLugar,
  fotos: readonly LinhaDaFoto[] = [],
  beneficios: readonly LinhaDoBeneficio[] = []
): CartaoDeLugar {
  const foto = fotos[0];
  const beneficio = beneficios[0];
  const nota = notaDe(lugar.nota);
  return {
    slug: lugar.slug,
    nome: lugar.nome,
    especialidade: lugar.especialidade,
    resumo: lugar.resumo,
    local: localDoLugar(lugar.cidade, lugar.uf),
    categoria: { slug: lugar.categoriaSlug, nome: lugar.categoriaNome },
    ...(foto ? { foto: { url: foto.url, alt: foto.alt } } : {}),
    ...(nota !== undefined ? { nota } : {}),
    ...(lugar.selo ? { selo: lugar.selo } : {}),
    ...(beneficio
      ? { beneficio: { titulo: beneficio.titulo, icone: beneficio.icone } }
      : {}),
  };
}

export function montarCartoes(
  lugares: readonly LinhaDoLugar[],
  fotos: readonly LinhaDaFoto[],
  beneficios: readonly LinhaDoBeneficio[]
): CartaoDeLugar[] {
  const fotosPorLugar = agruparPorLugar(fotos);
  const beneficiosPorLugar = agruparPorLugar(beneficios);
  return lugares.map((lugar) =>
    montarCartao(
      lugar,
      fotosPorLugar.get(lugar.id),
      beneficiosPorLugar.get(lugar.id)
    )
  );
}

/** Sem o id interno e a posição: o benefício como a interface recebe. */
export function beneficioDaInterface({
  id,
  titulo,
  regras,
  icone,
  tipo,
}: LinhaDoBeneficio): Beneficio {
  return { id, titulo, regras, icone, tipo };
}
