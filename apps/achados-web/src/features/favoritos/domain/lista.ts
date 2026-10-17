/** A lista de slugs salvos com um lugar posto ou tirado (o otimismo do coração). */
export function listaComPedido(
  slugs: readonly string[] | undefined,
  pedido: { slug: string; favoritar: boolean }
): string[] {
  const atual = new Set(slugs ?? []);
  if (pedido.favoritar) atual.add(pedido.slug);
  else atual.delete(pedido.slug);
  return [...atual];
}
