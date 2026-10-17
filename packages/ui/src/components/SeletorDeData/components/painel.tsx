import type { SeletorDeDataEstado } from "../../../hooks/use-seletor-de-data";
import { CaixaSuspensa } from "../../CaixaSuspensa";
import { Calendario, RodapeDoCalendario } from "../../Calendario";
import type { Lado } from "../../tipos";

export function PainelDoSeletorDeData({
  id,
  seletor,
  lado,
  saindo,
  aoAplicar,
}: {
  id: string;
  seletor: SeletorDeDataEstado;
  lado?: Lado;
  saindo?: boolean;
  aoAplicar: () => void;
}) {
  return (
    <CaixaSuspensa
      id={id}
      role="dialog"
      aria-label="Escolher data"
      lado={lado}
      saindo={saindo}
      className="w-[19.5rem]"
    >
      <Calendario
        calendario={seletor.calendario}
        estadoDoDia={seletor.estadoDoDia}
        hoje={seletor.hoje}
        referencia={seletor.rascunho}
        aoEscolher={seletor.escolher}
      />
      <RodapeDoCalendario
        podeLimpar={seletor.podeLimpar}
        podeAplicar={seletor.podeAplicar}
        aoLimpar={seletor.limpar}
        aoAplicar={aoAplicar}
      />
    </CaixaSuspensa>
  );
}
