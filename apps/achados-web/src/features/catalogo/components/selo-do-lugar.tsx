import { Etiqueta } from "@achados/ui";
import { BadgeCheck, Sparkles, Star } from "lucide-react";

import { ROTULO_DO_SELO, TOM_DO_SELO } from "../domain/apresentacao";
import type { Selo } from "../domain/tipos";

const ICONE: Record<Selo, React.ReactNode> = {
  featured: <Star className="fill-current" />,
  beloved: <Star className="fill-current" />,
  verified: <BadgeCheck />,
  new: <Sparkles />,
};

/** O selo editorial sobre a foto: Destaque, Mais querido, Verificado ou Novo. */
export function SeloDoLugar({
  selo,
  tamanho = "md",
}: {
  selo: Selo;
  tamanho?: "sm" | "md";
}) {
  return (
    <Etiqueta tom={TOM_DO_SELO[selo]} tamanho={tamanho} icone={ICONE[selo]}>
      {ROTULO_DO_SELO[selo]}
    </Etiqueta>
  );
}
