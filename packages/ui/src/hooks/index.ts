"use client";

// Hooks sem domínio para uso em componentes cliente. A integração precisa
// definir e validar os entrypoints; este comentário não impõe uma fronteira de build.
export * from "./use-debounce";
export * from "./use-elemento-visivel";
export * from "./use-fullscreen";
export * from "./use-instalacao-pwa";
export * from "./use-keyboard-shortcut";
export * from "./use-media-query";
export * from "./use-mounted";
export * from "./use-network-status";
export * from "./use-now";
export * from "./use-toggle";

// Hooks headless dos campos do design system. Os componentes de UI são a
// composição deles; use diretamente ao construir outra apresentação.
// `use-valor-controlavel` é interno e não sai daqui.
export { useFecharAoSair } from "./use-fechar-ao-sair";
export { usePresenca } from "./use-presenca";
export {
  useCalendario,
  type Calendario,
  type EstadoDoDia,
  type LimitesDeData,
  type UseCalendarioOpcoes,
} from "./use-calendario";
export {
  normalizarParaBusca,
  useSelect,
  type Opcao,
  type SelectEstado,
  type UseSelectOpcoes,
} from "./use-select";
export {
  useSeletorDeData,
  type SeletorDeDataEstado,
  type UseSeletorDeDataOpcoes,
} from "./use-seletor-de-data";
export {
  useSeletorDePeriodo,
  type Atalho,
  type SeletorDePeriodoEstado,
  type UseSeletorDePeriodoOpcoes,
} from "./use-seletor-de-periodo";
