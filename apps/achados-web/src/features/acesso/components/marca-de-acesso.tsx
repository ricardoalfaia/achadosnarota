import Link from "next/link";

import { Marca } from "@/shared/casca/marca";
import { ROTAS } from "@/shared/rotas";

/** A marca no alto das telas de acesso, que leva de volta ao início do app. */
export function MarcaDeAcesso() {
  return (
    <header className="flex justify-center">
      <Link
        href={ROTAS.explorar}
        aria-label="Achados na Rota, início"
        className="rounded-xl outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <Marca tamanho="lg" />
      </Link>
    </header>
  );
}
