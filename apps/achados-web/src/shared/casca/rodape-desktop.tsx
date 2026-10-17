import Link from "next/link";

import { ROTAS } from "@/shared/rotas";
import { Marca } from "./marca";

const EXPLORAR = [
  { rotulo: "Restaurantes", href: "/?categoria=restaurantes" },
  { rotulo: "Cafés", href: "/?categoria=cafes" },
  { rotulo: "Bares", href: "/?categoria=bares" },
  { rotulo: "Pousadas", href: "/?categoria=pousadas" },
];

const PASSAPORTE = [
  { rotulo: "Conhecer o passaporte", href: ROTAS.passaporte },
  { rotulo: "Como funciona a curadoria", href: "/#como-funciona" },
  { rotulo: "Meus favoritos", href: ROTAS.favoritos },
];

/**
 * O rodapé da versão desktop (protótipo `index.html`). Escuro nos dois temas,
 * como o asfalto da marca. Sem redes sociais nem contato até existirem de
 * verdade.
 */
export function RodapeDesktop() {
  const coluna = "flex flex-col gap-2 text-xs";
  const titulo = "mb-1 text-xs font-bold tracking-wider text-white uppercase";
  const link = "text-white/65 transition-colors hover:text-white";
  return (
    <footer
      data-theme="dark"
      className="hidden border-t border-border bg-background py-12 text-sm lg:block"
    >
      <div className="mx-auto max-w-7xl px-8">
        <div className="mb-8 grid grid-cols-4 gap-8">
          <div className="flex flex-col gap-3">
            <Marca />
            <p className="text-xs leading-relaxed text-white/65">
              Lugares que valem a pena, avaliados por curadoria independente, e
              benefícios para quem está na rota.
            </p>
          </div>
          <nav aria-label="Explorar" className={coluna}>
            <h2 className={titulo}>Explorar</h2>
            {EXPLORAR.map((item) => (
              <Link key={item.href} href={item.href} className={link}>
                {item.rotulo}
              </Link>
            ))}
          </nav>
          <nav aria-label="Passaporte" className={coluna}>
            <h2 className={titulo}>Passaporte</h2>
            {PASSAPORTE.map((item) => (
              <Link key={item.href} href={item.href} className={link}>
                {item.rotulo}
              </Link>
            ))}
          </nav>
          <div className={coluna}>
            <h2 className={titulo}>Estabelecimentos</h2>
            <p className="text-white/65">
              Área de parceiros em breve. Estabelecimentos não pagam por notas,
              selos ou posição.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-8 text-xs text-white/55">
          <p>© {new Date().getFullYear()} Achados na Rota.</p>
          <div className="flex items-center gap-4">
            <Link href="/termos" className="hover:text-white">
              Termos de uso
            </Link>
            <Link href="/privacidade" className="hover:text-white">
              Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
