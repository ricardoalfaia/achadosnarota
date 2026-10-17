import { BadgeCheck, MapPinned, Store } from "lucide-react";

/**
 * A prova do topo: quantos lugares e cidades a curadoria já avaliou, contados
 * no banco, e o princípio de que ninguém paga pela nota (ADR-004 de produto).
 */
export function NumerosDoCatalogo({
  lugares,
  cidades,
}: {
  lugares: number;
  cidades: number;
}) {
  const itens = [
    {
      icone: Store,
      valor: lugares,
      rotulo: lugares === 1 ? "lugar avaliado" : "lugares avaliados",
    },
    {
      icone: MapPinned,
      valor: cidades,
      rotulo: cidades === 1 ? "cidade na rota" : "cidades na rota",
    },
  ];
  return (
    <ul className="flex items-center gap-6 text-sm text-white/80">
      {itens.map(({ icone: Icone, valor, rotulo }) => (
        <li key={rotulo} className="flex items-center gap-2">
          <Icone aria-hidden="true" className="size-4 text-accent-on-dark" />
          <span>
            <strong className="text-lg font-extrabold text-white tabular-nums">
              {valor}
            </strong>{" "}
            {rotulo}
          </span>
        </li>
      ))}
      <li className="flex items-center gap-2">
        <BadgeCheck aria-hidden="true" className="size-4 text-accent-on-dark" />
        Nenhum lugar paga pela nota
      </li>
    </ul>
  );
}
