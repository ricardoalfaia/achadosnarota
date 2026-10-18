// Catálogo (descoberta): cidades, categorias, lugares e a ficha pública. As
// leituras no servidor estão em `servidor.ts`; este ponto de entrada só tem
// componentes, hooks, tipos e regras puras.
export { AcoesRapidas } from "./components/acoes-rapidas";
export { AbasDaFicha } from "./components/abas-da-ficha";
export { AtalhosDeCidade } from "./components/atalhos-de-cidade";
export { BarraDeBusca } from "./components/barra-de-busca";
export { BuscaRapida } from "./components/busca-rapida";
export { BotaoDeCompartilhar } from "./components/botao-de-compartilhar";
export { CabecalhoDaFicha } from "./components/cabecalho-da-ficha";
export { CartaoDeLugar } from "./components/cartao-de-lugar";
export { CarrosselDeAchados } from "./components/carrossel-de-achados";
export { CartaoEmDestaque } from "./components/cartao-em-destaque";
export { DestaquesDaRota } from "./components/destaques-da-rota";
export {
  FaixaDeFotos,
  GaleriaDeFotos,
  SeloDaCuradoria,
  SobreOLugar,
} from "./components/conteudo-da-ficha";
export {
  AvaliacaoEditorial,
  CertificadoDoSelo,
  EmblemaDoSelo,
  ResumoDaCuradoria,
} from "./components/curadoria-da-ficha";
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
export { NumerosDoCatalogo } from "./components/numeros-do-catalogo";
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
  VitrineDoCatalogo,
} from "./domain/tipos";
