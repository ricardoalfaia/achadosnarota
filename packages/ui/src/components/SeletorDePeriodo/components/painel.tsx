import type {
  Atalho,
  SeletorDePeriodoEstado,
} from "../../../hooks/use-seletor-de-periodo";
import { cn } from "../../../lib/cn";
import { diferencaEmDias } from "../../../lib/datas";
import { CaixaSuspensa } from "../../CaixaSuspensa";
import { Calendario, RodapeDoCalendario } from "../../Calendario";
import type { Lado } from "../../tipos";
import { Atalhos } from "./atalhos";

function resumoDoPeriodo({
  rascunho,
  escolhendoFim,
  maxDias,
}: SeletorDePeriodoEstado): string {
  if (rascunho.inicio && rascunho.fim) {
    const dias = diferencaEmDias(rascunho.inicio, rascunho.fim) + 1;
    return dias === 1 ? "1 dia" : `${dias} dias`;
  }
  if (escolhendoFim)
    return maxDias ? `Escolha o fim · até ${maxDias} dias` : "Escolha o fim";
  return maxDias ? `Até ${maxDias} dias` : "";
}

export function PainelDoPeriodo({
  seletor,
  atalhos,
  lado,
  saindo,
  aoAplicar,
}: {
  seletor: SeletorDePeriodoEstado;
  atalhos?: readonly Atalho[];
  lado?: Lado;
  saindo?: boolean;
  aoAplicar: () => void;
}) {
  const doisMeses = seletor.calendario.visiveis.length === 2;

  return (
    <CaixaSuspensa
      role="dialog"
      aria-label="Escolher período"
      lado={lado}
      saindo={saindo}
      className={cn("w-[19.5rem]", doisMeses && "sm:w-[37.5rem]")}
    >
      {atalhos && atalhos.length > 0 && (
        <Atalhos seletor={seletor} atalhos={atalhos} />
      )}
      <Calendario
        calendario={seletor.calendario}
        estadoDoDia={seletor.estadoDoDia}
        hoje={seletor.hoje}
        referencia={seletor.rascunho.fim ?? seletor.rascunho.inicio}
        aoEscolher={seletor.escolher}
        aoPassar={seletor.passar}
      />
      <RodapeDoCalendario
        podeLimpar={seletor.podeLimpar}
        podeAplicar={seletor.podeAplicar}
        aoLimpar={seletor.limpar}
        aoAplicar={aoAplicar}
        resumo={resumoDoPeriodo(seletor)}
      />
    </CaixaSuspensa>
  );
}
