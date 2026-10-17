import { Casca } from "@/shared/casca/casca";
import { sessaoDoCliente, tenantsDaLista } from "@/shared/sessao/sessao";
import { exigirSessao } from "@/shared/sessao/sessao.servidor";
import { exigirTenant } from "@/shared/sessao/tenant.servidor";

/**
 * As telas de um tenant, dentro da casca do mockup. `exigirTenant` confere a
 * sessão (sem ela, login; com troca de senha ou autenticador pendente, de
 * volta ao login) e o vínculo com o tenant da URL (sem ele, 404). A casca
 * recebe só o recorte da sessão, sem ids, e a lista de tenants para o seletor.
 */
export default async function LayoutDoTenant({
  children,
  params,
}: LayoutProps<"/t/[slug]">) {
  const { slug } = await params;
  const contexto = await exigirTenant(slug);
  const { vinculos } = await exigirSessao();

  return (
    <Casca
      sessao={sessaoDoCliente(contexto)}
      slug={contexto.tenant.slug}
      tenants={tenantsDaLista(vinculos)}
    >
      {children}
    </Casca>
  );
}
