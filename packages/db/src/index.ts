// @achados/db — esquema, cliente e escopos de acesso. SOMENTE SERVIDOR.
//
// Não importa o pacote "server-only": ele lança erro fora da condição
// "react-server", o que quebraria drizzle-kit, seed e vitest, que rodam em
// Node puro. A garantia fica com quem consome: no app Next, importe este
// pacote só de módulos de servidor (que já importam "server-only"). Ele usa
// node:crypto e conexões TCP, então nem funcionaria num bundle de browser, e
// as URLs de banco só existem no ambiente do servidor.
export * from "./schema";
export {
  criarDb,
  encerrarDb,
  type CriarDbOpcoes,
  type Db,
  type DbExecutor,
  type Tx,
} from "./client";
export { ehUlid, novoId } from "./id";
export { codigoPostgres, lerPublico, validarUserId, withUser } from "./escopo";
