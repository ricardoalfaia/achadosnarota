// Passaporte: a assinatura anual vista por quem a tem (ou ainda não). O app só
// lê; ativação e mudanças vêm do webhook do provedor (F3).
export { BotaoDeAssinar } from "./components/botao-de-assinar";
export { CartaoDoPassaporte } from "./components/cartao-do-passaporte";
export { CartaoPromocionalDoPassaporte } from "./components/cartao-promocional";
export { ChamadaDoPlano } from "./components/chamada-do-plano";
export { EstatisticasDoPassaporte } from "./components/estatisticas-do-passaporte";
export { OfertaDoPassaporte } from "./components/oferta-do-passaporte";
export { dataCurta, type Passaporte, type Plano } from "./domain/passaporte";
export {
  lerRetorno,
  pertoDeVencer,
  type RetornoDoPagamento,
} from "./domain/assinatura";
