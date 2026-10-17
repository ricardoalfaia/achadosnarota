/**
 * Os três números do passaporte: cupons utilizados, cidades visitadas e
 * estabelecimentos. Vêm dos resgates confirmados; sem resgate, zero (nunca um
 * número de exemplo).
 */
export function EstatisticasDoPassaporte({
  cupons,
  cidades,
  estabelecimentos,
}: {
  cupons: number;
  cidades: number;
  estabelecimentos: number;
}) {
  const itens = [
    { valor: cupons, rotulo: "Cupons utilizados" },
    { valor: cidades, rotulo: "Cidades visitadas" },
    { valor: estabelecimentos, rotulo: "Estabelecimentos" },
  ];
  return (
    <dl className="grid grid-cols-3 rounded-2xl border border-border bg-surface p-3 text-center shadow-sm">
      {itens.map((item, indice) => (
        <div
          key={item.rotulo}
          className={
            indice === 1
              ? "flex flex-col-reverse border-x border-border"
              : "flex flex-col-reverse"
          }
        >
          <dt className="text-[10px] leading-tight font-medium text-foreground-muted">
            {item.rotulo}
          </dt>
          <dd className="text-lg font-extrabold text-foreground">
            {item.valor}
          </dd>
        </div>
      ))}
    </dl>
  );
}
