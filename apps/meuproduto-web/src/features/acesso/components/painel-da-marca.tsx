import Image from "next/image";
import { getTranslations } from "next-intl/server";

/**
 * O lado da marca nas telas de acesso: o logo, a frase "Seus documentos
 * ganham vida." e um texto curto do produto, sobre o degradê da marca. Fica no
 * tema claro nos dois temas (`data-theme`), como o quadro da marca, porque o
 * nome no logo é azul-escuro. Some em telas estreitas, onde o formulário fica
 * com a tela toda.
 */
export async function PainelDaMarca() {
  const t = await getTranslations("Acesso.painel");

  return (
    <aside className="sticky top-0 h-screen p-3 max-lg:hidden">
      <div
        data-theme="light"
        className="relative isolate flex h-full flex-col justify-center gap-10 overflow-hidden rounded-[28px] border border-border bg-surface p-14 text-foreground max-xl:p-10"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute -top-[20%] -right-[15%] size-[560px] rounded-full bg-brand-gradient opacity-20 blur-[90px]" />
          <div className="absolute -bottom-[25%] -left-[15%] size-[480px] rounded-full bg-brand-gradient opacity-15 blur-[100px]" />
        </div>

        <Image
          src="/logo-meuproduto.png"
          alt="Meuproduto"
          width={1044}
          height={330}
          priority
          className="h-auto w-full max-w-105"
        />

        <div className="max-w-[540px]">
          <h2 className="text-[44px] leading-[1.08] font-bold tracking-tight text-balance max-xl:text-[36px]">
            {t.rich("titulo", {
              destaque: (trecho) => (
                <span className="text-brand-gradient">{trecho}</span>
              ),
            })}
          </h2>
          <p className="mt-4 text-xl leading-relaxed text-foreground-muted">
            {t("texto")}
          </p>
        </div>

        <ul className="flex flex-col gap-3 text-lg text-foreground-muted">
          {(["gerar", "organizar", "assinar"] as const).map((item) => (
            <li key={item} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full bg-brand-gradient"
              />
              {t(`itens.${item}`)}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
