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
- **Topo que converte, sem número inventado**: o hero mostra o primeiro destaque da curadoria (`lerVitrine`), quantos lugares e cidades já foram avaliados (contados no banco), atalhos para as cidades e o preço do plano vindo de `plans`. Nada fixo no código (ADR-004 de produto).
- **Busca sempre à mão**: o cabeçalho desktop ganha um campo compacto (`BuscaRapida`) fora da exploração e, nela, quando a busca grande do topo sai da tela (`useElementoVisivel`, IntersectionObserver), para nunca haver duas buscas visíveis. Entre 1024 e 1279px vira um botão que leva à busca do topo.
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

## Exceção: fotos reais de dois estabelecimentos no seed

As regras do projeto (AGENTS.md) não deixam dado real de parceiro entrar no repositório. Esta exceção é deliberada e temporária:

- **Motivo:** validar o app com parceiros antes da produção inaugural, com fotos que mostram o padrão de qualidade esperado.
- **Escopo:** só as fotos em `apps/achados-web/public/exemplos/rancho-portugues/` e `apps/achados-web/public/exemplos/choperia-pinguim/`, tiradas dos sites desses estabelecimentos, feitos pelo responsável. Ficaram de fora as que mostram letreiro, logotipo ou marca. Os nomes são os reais (Rancho Português e Choperia Pinguim), por decisão do responsável; notas, pareceres e benefícios do seed são fictícios. Desde 17/10/2026 o ambiente Neon + Vercel é tratado como homologação (`APP_ENV=homolog`) até a produção inaugural, e o seed pode rodar lá para a validação com os parceiros.
- **Responsável:** Ricardo Alfaia Barbosa (decisão de 17/10/2026).
- **Condição de retirada:** antes da produção inaugural, ou quando o admin cadastrar esses lugares com fotos enviadas ao bucket (R2). As fotos saem da pasta e do seed nesse momento. O histórico do git continua com elas; se for preciso apagá-las de vez, é preciso reescrever o histórico.

## Curadoria na ficha: critérios, selo e parecer estruturado (proposto)

Decisão do responsável em 17/10/2026, pendente de revisão como as demais:

- **Sete critérios públicos**, de 0 a 5: higiene, apresentação do prato, sabor, sofisticação, atendimento, ambiente e custo-benefício (colunas em `editorial_review`, migração `0001_criterios_da_curadoria`, só aditiva). O que não se aplica à casa fica nulo e sai da média (pousada sem "apresentação do prato"), na linha dos critérios por categoria de docs/produto/08.
- **Selo Achados na Rota**: média 4,5 ou mais, nenhum critério abaixo de 4 e pelo menos quatro critérios avaliados (`ganhaOSelo` em `features/catalogo/domain/curadoria.ts`, com testes). A regra é a mesma para todas as casas e não lê nada comercial (ADR-004 de produto). Os selos editoriais de destaque (`featured`, `beloved`, `verified`, `new`) continuam separados.
- **Parecer em blocos fixos**: "O achado imperdível" (`highlight`), "O que provamos" (`summary`), "Dicas da curadoria" (`tips`) e "Bom saber" (`caveats`), com a data da visita.
- **Na ficha**, o resumo da curadoria (certificado do selo, nota geral e achado imperdível) fica no corpo da página, antes das abas; a avaliação completa fica na aba.
- Pendências: versão da metodologia, visitas e evidências (F2); a nota geral gravada (`score`) ainda é a média calculada por quem publica, não pelo banco.

## Resgate: regra de uso e código validado pelo garçom (proposto)

Decisões do responsável em 18/10/2026, aplicando o ADR-005 de produto (ainda proposto):

- **Regra de uso por benefício**: `limit_per_user` dentro de `usage_period` (dia, semana, mês ou ano do calendário de Brasília, ou sem limite). "2 por 1 uma vez por ano" é limite 1 no ano; benefícios recorrentes usam semana ou mês. Novo tipo `two_for_one` ("2 por 1"). Migração `0002_resgates`, só aditiva.
- **Emissão no app** (`emitirResgate`, `@achados/db`): dentro do escopo da pessoa (RLS), exige passaporte vigente, oferta visível e limite disponível; cancela o código anterior não usado; gera 6 caracteres sem ambíguos, válidos por 10 minutos, e grava só o SHA-256. O código aparece uma vez na tela (Action `gerarCodigoDoBeneficio`) e não vai para log, URL nem cache.
- **Consumo pelo operador** (`consumirResgate`): só acha código da casa dele, recusa expirado, confere o limite de novo sob trava por pessoa e oferta e troca `issued → redeemed` com atualização condicional. Testes de integração provam que dois garçons ao mesmo tempo não usam o mesmo código e que o segundo 2 por 1 no ano é recusado.
- **Modo balcão no app** (decisão de 18/10/2026, no lugar do painel do admin): a tela `/balcao` do próprio PWA, para contas vinculadas a uma casa em `partner_operator` (migração `0003_operadores_do_balcao`). O vínculo é escrito pela equipe; o operador só lê os dele.
- **Consumo sob RLS, com o papel do app**: `consumirResgate` roda dentro de `withUser(operador)`. Políticas próprias deixam o operador ler e tirar de "emitido" só os códigos das casas que opera; a checagem de escrita repete o vínculo (as políticas permissivas de UPDATE se somam, e sem isso a pessoa poderia marcar o próprio código como usado) e proíbe validar o próprio código. Testes A/B provam os dois casos.
- **Limite de tentativas**: 5 códigos errados em 15 minutos bloqueiam o operador (`redemption_attempt`, sem o código digitado). O operador só registra e lê as próprias tentativas; não apaga nem altera.
- **No app do cliente**: o ticket mostra "Usado · volta em dd/mm/aaaa" quando o limite da janela acabou (`usosDosBeneficios`), e as abas "Utilizados" e "Expirados" do passaporte e os números (cupons, casas, cidades) vêm do histórico real (`historicoDeResgates`).
- **Pendente**: tela de vínculo de operadores no admin (hoje pelo seed), papel de escrita da equipe e auditoria (`audit_events`).
