import {
  BadgePercent,
  ClipboardCheck,
  Handshake,
  LayoutDashboard,
  Settings,
  Store,
  TicketCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { IdDeNavegacao } from "./navegacao";

/** O ícone de cada item do menu; a estrutura fica em `navegacao.ts`. */
export const ICONE_DA_NAVEGACAO: Record<IdDeNavegacao, LucideIcon> = {
  inicio: LayoutDashboard,
  casas: Store,
  curadoria: ClipboardCheck,
  promocoes: BadgePercent,
  parceiros: Handshake,
  resgates: TicketCheck,
  assinantes: Users,
  configuracoes: Settings,
};
