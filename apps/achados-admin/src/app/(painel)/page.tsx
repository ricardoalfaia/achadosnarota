import { HydrationBoundary } from "@tanstack/react-query";

import { PainelInicial, saudacaoDaHora } from "@/features/inicio";
import { prefetchDoResumo } from "@/features/inicio/servidor";
import { estadoDesidratado } from "@/shared/consultas/cliente.servidor";

/**
 * O início do painel. A saudação é calculada aqui, no servidor, para o HTML
 * e a hidratação mostrarem o mesmo texto.
 */
export default async function Inicio() {
  await prefetchDoResumo();
  return (
    <HydrationBoundary state={estadoDesidratado()}>
      <PainelInicial saudacao={saudacaoDaHora(new Date())} />
    </HydrationBoundary>
  );
}
