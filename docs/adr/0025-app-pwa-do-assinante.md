# ADR-0025 — App PWA do assinante: rotas, casca, dados e PWA

**Estado:** Proposto  
**Data:** 2026-10-17  
**Princípios relacionados:** P01, P03, P04, P06, P07, P08  
**Responsável pela proposta:** Ricardo Alfaia Barbosa  
**Aceitação:** pendente; implementado no `achados-web`.

## Contexto

O `achados-web` veio da base como painel SaaS multi-tenant (`/t/[slug]`, menu lateral). O Achados na Rota começa pelo app do consumidor, um PWA mobile-first fiel ao protótipo `pwa.html` ([marca](../produto/marca/README.md)); a área de administração vem depois, em outro momento. O app é público (descoberta indexável, [ADR-008 de produto](../produto/adr/ADR-008.md)) e só algumas telas usam a conta.

## Decisão proposta

### Rotas e casca

| Rota                                  | Tela do protótipo | Sessão                       |
| ------------------------------------- | ----------------- | ---------------------------- |
| `/`                                   | Explorar          | Opcional (corações)          |
| `/lugar/[slug]`                       | Detalhes do lugar | Opcional (corações, resgate) |
| `/favoritos`                          | Favoritos         | Convida a entrar             |
| `/passaporte`                         | Meu Passaporte    | Opcional (cartão e oferta)   |
| `/perfil`                             | Perfil            | Obrigatória                  |
| `/login`, `/cadastro`                 | —                 | Telas de acesso              |
| `/termos`, `/privacidade`, `/offline` | —                 | Públicas                     |

- Coluna única de até 480px (`(app)/layout.tsx`) com a barra inferior fixa e o botão central do leitor; cada tela compõe o próprio topo (cabeçalho com a marca, barra de seção ou foto do lugar).
- Sem `proxy.ts` de triagem: telas e Actions conferem a sessão no servidor (`exigirSessao`, `sessaoLiberada`, `sessaoDaAcao`).
- O painel SaaS da base saiu; ele está no commit inicial, para servir à área administrativa.

### Dados ([ADR-0006](0006-estado-http-e-cache.md))

| Recurso                                        | Caminho                                                                                                                                                                                |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lugares do catálogo                            | Query `["web","catalogo","lugares",filtro]`, staleTime 5 min; prefetch no servidor + `HydrationBoundary`; BFF `GET /api/lugares`                                                       |
| Favoritos da pessoa                            | Query `["web",escopo,"favoritos"]`, staleTime 5 min; prefetch + hidratação; BFF `GET /api/me/favoritos`; `useMutation` sobre a Action `alternarFavorito`, com otimismo e reconciliação |
| Ficha, passaporte, perfil, categorias, cidades | Leitura no Server Component, sem Query (só leitura, sem vida no navegador)                                                                                                             |
| Cadastro e login                               | `useActionState` + Server Action                                                                                                                                                       |

- O filtro da exploração mora na URL e muda pela History API (`useFiltroDoCatalogo`), sem pedir a página ao servidor; a lista vem do cache.
- `escopo` é o SHA-256 truncado do id da pessoa; o `ProvedorDeConsultas` é remontado com `key={escopo}`, descartando o cache ao entrar, sair ou trocar de conta.
- O app lê o catálogo como `achados_app`, e o banco só devolve o publicado (RLS `*_leitura_publica`); favoritos e assinatura passam por `withUser`.

### Componentes e hooks

- Lógica de tela em hooks da feature (`features/*/hooks`): `useFiltroDoCatalogo`, `useBuscaDeLugares`, `useLugares`, `useCompartilhar`, `useFavoritos`, `useFavorito`, `useAlternarFavorito`, `useResgate`; e na casca `useNavegacaoInferior`. Componentes recebem dados e renderizam.
- Hooks genéricos ficam em `packages/ui/src/hooks` e são reaproveitados: `useToggle` (diálogos), `useDebouncedCallback` (busca), `useNetworkStatus` (aviso sem conexão), `useInstalacaoPwa` (novo).
- React 19.2: `useSuspenseQuery` com `useDeferredValue` (a lista atual fica enquanto a nova chega) dentro do `DataBoundary`; `<Activity>` nas abas da ficha e do passaporte (`manterEstado`).

### Desktop

- **O mesmo app, por CSS**, a partir de 1024px (`lg`): cabeçalho com navegação (`CabecalhoDesktop`), rodapé (`RodapeDesktop`), hero com a foto da estrada, busca em pílula e categorias em vidro, destaques em grade de 3 a 4 colunas, "Por que usar o Achados na Rota?" e a chamada do passaporte (protótipo `index.html` e `page.jpeg`). A ficha vira duas colunas (foto fixa à esquerda); as demais telas ficam centralizadas. A barra inferior e o cabeçalho do celular somem.
- **Sem detectar aparelho pelo user-agent:** um só HTML serve celular e computador, sem "piscar" de um modelo para o outro, compatível com cache e com janelas redimensionadas; tablets em pé recebem a coluna do celular centralizada.
- A seção "Roteiros prontos" do protótipo ficou de fora: roteiros não estão no escopo do MVP ([01 — Produto](../produto/01-produto.md)).

### Carregamento

- `loading.tsx` com esqueleto na forma final em Explorar (celular e desktop), Favoritos, Passaporte e Perfil ([ADR-0016](0016-recursos-do-react-19.md)).
- **A ficha do lugar não tem `loading.tsx` de rota:** com ele o streaming começa antes do `notFound()` e um lugar inexistente responde 200 em vez de 404 (ruim para SEO, [ADR-008 de produto](../produto/adr/ADR-008.md)). O teste "lugar inexistente responde 404" protege isso.

### PWA

- `app/manifest.ts` com ícones 192, 512 e maskable gerados do símbolo; `theme_color` laranja.
- `public/sw.js` conservador: guarda só estáticos públicos e a página offline; navegação sempre pela rede; nunca `/api`, HTML ou dado de pessoa ([02 — Arquitetura](../produto/02-arquitetura.md)). Registrado só em produção. Servido sem cache e com CSP própria.

## Alternativas consideradas

- **Manter o painel SaaS e criar o PWA em outro app agora:** dois apps com autenticação duplicada antes de existir a área administrativa.
- **Query em todas as telas:** dois ciclos de cache onde a leitura no servidor basta (ADR-0006).
- **Filtro por navegação do Next (`router.replace`):** cada letra ou categoria pede a página ao servidor; sem o cache entre filtros.

## Consequências

Explorar e favoritar respondem na hora e funcionam com rede ruim; as fichas continuam renderizadas no servidor para SEO. O custo é manter dois caminhos coerentes (consulta direta no servidor e BFF no navegador) com a mesma chave e o mesmo formato.

## Verificação de aderência

| Regra                                                     | Evidência                                                           | Estado                         |
| --------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------ |
| Trocar categoria não recarrega a página e usa o cache     | `explorar.spec.ts`, "trocar de categoria não recarrega a página"    | Executado                      |
| Favoritos isolados entre pessoas                          | `favoritos.spec.ts` (A/B na interface) e `isolamento.test.ts` (RLS) | Executado                      |
| Rascunho e oferta inativa não chegam ao app               | `isolamento.test.ts`, "catálogo público"                            | Executado                      |
| Manifesto e service worker conservador                    | `pwa.spec.ts`                                                       | Executado                      |
| Desktop por CSS, sem a barra do celular, ficha em colunas | `desktop.spec.ts`                                                   | Executado                      |
| Telas fiéis ao protótipo                                  | Capturas em 390×844 conferidas com `pwa.html`                       | Executado (conferência visual) |

## Pendências e exceções

- Leitor de QR Code e emissão do código de resgate: F4.
- Assinatura e checkout: F3, depende do provedor ([ADR-006 de produto](../produto/adr/ADR-006.md)).
- Notificações: sem push nesta etapa; o sino abre um estado vazio.

## Referências

- [ADR-0006](0006-estado-http-e-cache.md), [ADR-0016](0016-recursos-do-react-19.md), [ADR-0020](0020-autenticacao-e-sessao.md), [ADR-0022](0022-identidade-visual-achados.md), [ADR-0024](0024-identificadores-ulid.md)
- [Guia de PWA do Next.js](https://nextjs.org/docs/app/guides/progressive-web-apps)
