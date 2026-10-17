import { CaixaDeIcone } from "@achados/ui";
import { Compass, MapPinned, Percent, Star } from "lucide-react";

const PILARES = [
  {
    icone: Compass,
    titulo: "Curadoria real",
    texto: "Lugares visitados e avaliados por quem realmente vai.",
  },
  {
    icone: Percent,
    titulo: "Benefícios exclusivos",
    texto:
      "Vantagens dos parceiros para quem tem o Passaporte, com regras claras.",
  },
  {
    icone: MapPinned,
    titulo: "Na sua rota",
    texto:
      "Descubra paradas que valem a pena na próxima viagem ou na sua cidade.",
  },
  {
    icone: Star,
    titulo: "Sem nota comprada",
    texto: "Estabelecimentos não pagam por notas, selos ou posição.",
  },
];

/**
 * "Por que usar o Achados na Rota?" (protótipo desktop): os quatro pilares.
 * "Em todo o Brasil" e "Experiências autênticas" do protótipo viraram "Na sua
 * rota" (o MVP é regional) e "Sem nota comprada" (princípio do produto).
 */
export function PorQueUsar() {
  return (
    <section
      id="como-funciona"
      aria-labelledby="titulo-por-que-usar"
      className="scroll-mt-24 border-y border-border bg-surface py-20"
    >
      <div className="mx-auto max-w-7xl px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mx-auto mb-3 block h-1 w-12 rounded-full bg-brand" />
          <h2
            id="titulo-por-que-usar"
            className="text-3xl font-extrabold tracking-tight text-foreground"
          >
            Por que usar o Achados na Rota?
          </h2>
          <p className="mt-2 text-sm text-foreground-muted">
            Uma curadoria viva feita para transformar viagens em boas
            lembranças.
          </p>
        </div>
        <ul className="grid grid-cols-4 gap-8">
          {PILARES.map(({ icone: Icone, titulo, texto }) => (
            <li
              key={titulo}
              className="flex flex-col items-center rounded-3xl p-6 text-center transition-colors duration-300 hover:bg-surface-raised"
            >
              <CaixaDeIcone
                tom="suave"
                tamanho="lg"
                className="mb-5 rounded-full"
              >
                <Icone />
              </CaixaDeIcone>
              <h3 className="text-lg font-bold text-foreground">{titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                {texto}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
