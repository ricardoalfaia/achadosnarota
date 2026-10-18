import { CartaoDeIndicador } from "@achados/ui";
import { Store, TriangleAlert, Users } from "lucide-react";

import type { ResumoDoBalcao } from "../domain/balcao";

/** Os números do topo de Parceiros: cobertura do balcão e pessoas vinculadas. */
export function IndicadoresDoBalcao({ resumo }: { resumo: ResumoDoBalcao }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-3">
      <li>
        <CartaoDeIndicador
          icone={<Store />}
          valor={`${resumo.comOperador} de ${resumo.casas}`}
          rotulo="Casas com operador no balcão"
          tom="sucesso"
        />
      </li>
      <li>
        <CartaoDeIndicador
          icone={<TriangleAlert />}
          valor={resumo.semOperador}
          rotulo="Casas sem operador"
          tom={resumo.semOperador > 0 ? "aviso" : "primario"}
        />
      </li>
      <li>
        <CartaoDeIndicador
          icone={<Users />}
          valor={resumo.operadores}
          rotulo="Pessoas operando balcões"
        />
      </li>
    </ul>
  );
}
