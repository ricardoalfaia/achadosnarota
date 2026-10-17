import Link from "next/link";
import { EstadoVazio } from "@achados/ui";
import { estiloDoBotao } from "@achados/ui/estilos";
import { MapPinOff } from "lucide-react";

import { ROTAS } from "@/shared/rotas";

/** Lugar inexistente ou ainda não publicado: o mesmo aviso, sem distinguir. */
export default function LugarNaoEncontrado() {
  return (
    <div className="p-4 pt-16">
      <EstadoVazio
        icone={<MapPinOff />}
        titulo="Lugar não encontrado"
        descricao="Ele pode ter saído do catálogo ou o endereço está incompleto."
        nivelDoTitulo="h2"
        acao={
          <Link href={ROTAS.explorar} className={estiloDoBotao()}>
            Explorar lugares
          </Link>
        }
      />
    </div>
  );
}
