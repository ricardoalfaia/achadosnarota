import { CartaoDeIndicador } from "@achados/ui";
import { BadgeCheck, CalendarClock, Gift, Hourglass } from "lucide-react";

import type { ResumoDosAssinantes } from "../domain/assinantes";

/** Os números do topo de Assinantes, contados no banco. */
export function IndicadoresDosAssinantes({
  resumo,
}: {
  resumo: ResumoDosAssinantes;
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <li>
        <CartaoDeIndicador
          icone={<BadgeCheck />}
          valor={resumo.pagos}
          rotulo="Passaportes pagos ativos"
          tom="sucesso"
        />
      </li>
      <li>
        <CartaoDeIndicador
          icone={<Gift />}
          valor={resumo.cortesias}
          rotulo="Cortesias ativas"
          tom="destaque"
        />
      </li>
      <li>
        <CartaoDeIndicador
          icone={<Hourglass />}
          valor={resumo.pendentes}
          rotulo="Pagamento pendente"
          tom={resumo.pendentes > 0 ? "aviso" : "primario"}
        />
      </li>
      <li>
        <CartaoDeIndicador
          icone={<CalendarClock />}
          valor={resumo.vencemEmBreve}
          rotulo="Vencem nos próximos 7 dias"
        />
      </li>
    </ul>
  );
}
