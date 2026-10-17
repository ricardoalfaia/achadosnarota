import { Marca } from "@/shared/marca";

/** A marca Meuproduto no alto da coluna do formulário. */
export function MarcaDeAcesso() {
  return (
    <header>
      <h1 aria-label="Meuproduto">
        <Marca />
      </h1>
    </header>
  );
}
