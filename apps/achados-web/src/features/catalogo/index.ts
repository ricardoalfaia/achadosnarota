// Catálogo (descoberta): cidades, categorias, lugares e a ficha pública. As
// leituras no servidor estão em `servidor.ts`; este ponto de entrada só tem
// componentes, hooks, tipos e regras puras.
export { AcoesRapidas } from "./components/acoes-rapidas";
export { AbasDaFicha } from "./components/abas-da-ficha";
export { BarraDeBusca } from "./components/barra-de-busca";
export { BotaoDeCompartilhar } from "./components/botao-de-compartilhar";
export { CartaoDeLugar } from "./components/cartao-de-lugar";
export { CartaoDescubra } from "./components/cartao-descubra";
export { DestaquesDaRota } from "./components/destaques-da-rota";
export {
  AvaliacaoEditorial,
  GaleriaDeFotos,
  SeloDaCuradoria,
  SobreOLugar,
} from "./components/conteudo-da-ficha";
export {
  EsqueletoDaExploracao,
  EsqueletoDeLinhas,
} from "./components/esqueletos";
export { FiltroDeCategorias } from "./components/filtro-de-categorias";
export { IconeDaCategoria, IconeDoBeneficio } from "./components/icones";
export {
  EsqueletoDaLista,
  ListaDeLugares,
} from "./components/lista-de-lugares";
export { SeloDoLugar } from "./components/selo-do-lugar";
export { TopoDaFicha } from "./components/topo-da-ficha";
export { abaDaFicha, type AbaDaFicha } from "./domain/abas";
export { lerFiltro, semFiltro } from "./domain/filtro";
export { useFiltroDoCatalogo } from "./hooks/use-filtro-do-catalogo";
export { useLugares } from "./hooks/use-lugares";
export type {
  Beneficio,
  CartaoDeLugar as Lugar,
  Categoria,
  Cidade,
  FichaDoLugar,
  FiltroDoCatalogo,
} from "./domain/tipos";
