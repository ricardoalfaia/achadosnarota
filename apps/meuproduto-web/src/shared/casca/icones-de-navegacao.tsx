import {
  ChartColumn,
  FileText,
  House,
  LayoutGrid,
  Link2,
  PenLine,
  Settings,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import type { IdDeNavegacao } from "./navegacao";

/** O ícone (lucide-react) de cada item do menu, como no mockup. */
export const ICONE_DE_NAVEGACAO: Record<IdDeNavegacao, LucideIcon> = {
  inicio: House,
  documentos: FileText,
  modelos: LayoutGrid,
  assinaturas: PenLine,
  clientes: Users,
  equipe: UsersRound,
  relatorios: ChartColumn,
  integracoes: Link2,
  configuracoes: Settings,
};
