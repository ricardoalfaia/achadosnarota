import { Esqueleto } from "@achados/ui";

/** O perfil carregando: avatar, nome e a lista de ajustes. */
export default function CarregandoPerfil() {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando o perfil"
      className="flex flex-col items-center gap-3 p-4 pt-24"
    >
      <Esqueleto className="size-20 rounded-full" />
      <Esqueleto className="h-5 w-40" />
      <Esqueleto className="h-3 w-28" />
      <Esqueleto className="mt-4 h-40 w-full rounded-2xl" />
    </div>
  );
}
