import {
  BedDouble,
  Beer,
  CakeSlice,
  Coffee,
  Gift,
  House,
  Landmark,
  MapPin,
  Mountain,
  Percent,
  ShoppingBag,
  Tag,
  Ticket,
  Utensils,
  Wine,
  type LucideIcon,
} from "lucide-react";

// O banco guarda uma chave de apresentação (`categories.icon`, `offers.icon`);
// aqui ela vira ícone. Chave desconhecida cai num ícone neutro, sem erro.

const DA_CATEGORIA: Record<string, LucideIcon> = {
  utensils: Utensils,
  coffee: Coffee,
  beer: Beer,
  house: House,
  landmark: Landmark,
  "shopping-bag": ShoppingBag,
  mountain: Mountain,
};

const DO_BENEFICIO: Record<string, LucideIcon> = {
  percent: Percent,
  dessert: CakeSlice,
  beer: Beer,
  tag: Tag,
  bed: BedDouble,
  wine: Wine,
  gift: Gift,
  coffee: Coffee,
};

export function IconeDaCategoria({
  chave,
  className,
}: {
  chave: string;
  className?: string;
}) {
  const Icone = DA_CATEGORIA[chave] ?? MapPin;
  return <Icone aria-hidden="true" className={className} />;
}

export function IconeDoBeneficio({
  chave,
  className,
}: {
  chave: string;
  className?: string;
}) {
  const Icone = DO_BENEFICIO[chave] ?? Ticket;
  return <Icone aria-hidden="true" className={className} />;
}
