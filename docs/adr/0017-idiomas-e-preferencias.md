# ADR-0017 — Idiomas com next-intl e preferências do usuário

**Estado:** Proposto  
**Data:** 2026-10-16  
**Princípios relacionados:** P01, P07, P10  
**Responsável pela proposta:** Ricardo Alfaia Barbosa  
**Aceitação:** pendente; o mecanismo veio da base de origem e foi mantido por decisão do responsável.

## Contexto

O Meuproduto atende pequenos escritórios no Brasil; o português é o idioma principal. A base de origem já trazia o sistema em dois idiomas, e o responsável pediu manter essa capacidade. As escolhas de quem usa (tema, idioma, menu recolhido) precisam valer em todas as telas e continuar valendo ao voltar.

O tema é guardado em cookie e aplicado no servidor ([ADR-0008](0008-design-system.md)). A sessão real vem do [ADR-0020](0020-autenticacao-e-sessao.md); ainda não há lugar no servidor para gravar preferências por pessoa.

## Decisão proposta

### Idiomas

A biblioteca é o `next-intl` 4.14.9, sem prefixo de idioma no endereço. O idioma vem da preferência de quem usa (`src/i18n/request.ts`), e uma mesma URL serve nos dois idiomas. Para um sistema com login, não há ganho em `/pt-BR/...` e há custo em toda rota.

- Idiomas: `pt-BR` (padrão) e `en`. Os textos ficam em `messages/<idioma>.json`, organizados por área da tela.
- As chaves são conferidas pelo TypeScript (`src/i18n/tipos.d.ts`): chave inexistente não compila.
- `mensagens.test.ts` garante que os idiomas têm as mesmas chaves, as mesmas variáveis em cada texto e nenhum texto vazio.
- O fuso horário é fixo em `America/Sao_Paulo`. Escritórios em outros fusos são uma decisão aberta: datas de documentos e assinaturas são registros com valor de prova, e o fuso exibido precisa ser explícito ([06 — Assinaturas](../produto/06-assinaturas-e-creditos.md)).

Os componentes de `@meuproduto/ui` têm textos em português. Para outro idioma, o componente recebe os textos por props, com o português como padrão; o `SeletorDeTema` (`rotulos`) é o primeiro. `@meuproduto/ui` não depende do `next-intl`.

O conteúdo dos documentos gerados (modelos, procurações, contratos) não passa por este mecanismo: é dado do escritório, no idioma em que o modelo foi escrito.

### Preferências do usuário

`src/shared/preferencias` reúne tema, idioma e menu recolhido.

- **Onde ficam:** um cookie por preferência (`meuproduto-tema`, `meuproduto-idioma`, `meuproduto-menu`), válido por um ano. São escolhas visuais, sem dado sensível, e por isso legíveis pelo navegador.
- **Leitura no servidor:** o layout raiz lê os cookies e o HTML já sai no tema e no idioma escolhidos, sem piscar no padrão.
- **Mudança:** `usePreferencias().mudar(chave, valor)` grava o cookie e vale na hora. Trocar de idioma pede a página de novo ao servidor, dentro de uma transição (`useTransition`), para a tela atual continuar utilizável enquanto a nova chega.
- **Regras puras** em `preferencias.ts`, com teste: valor ausente ou desconhecido no cookie cai no padrão em vez de chegar à tela.
- **Onde se escolhe:** tema e idioma ficam no menu do usuário da casca (`SeletorDeTema` e `SeletorDeIdioma`, [ADR-0018](0018-casca-do-sistema.md)), e não em uma página própria: duas preferências visuais não justificam uma tela.
- **Menu recolhido:** a preferência `menuRecolhido` é lida no servidor e usada pelo menu lateral ([ADR-0018](0018-casca-do-sistema.md)).

Preferência em cookie vale por navegador, não por pessoa. Quando houver uma API de preferências, o cookie passa a ser a cópia local para a primeira pintura, e o servidor, a fonte.

## Alternativas consideradas

- **Idioma no endereço (`/en/...`):** padrão em sites públicos, útil para indexação e para compartilhar um link em um idioma. Aqui o idioma é escolha de quem usa, não do link.
- **Só português:** menos custo de manutenção. Rejeitado por decisão do responsável, que quer a base pronta para outros idiomas; a paridade é cobrada por teste.
- **Detectar o idioma pelo navegador (`Accept-Language`):** evita a primeira escolha, mas a pessoa passa a depender da configuração da máquina. Pode ser acrescentado como padrão inicial quando não houver cookie.
- **Gravar preferências com Server Action:** permitiria cookie `HttpOnly`, mas o tema precisa ser aplicado antes de qualquer resposta do servidor, e não há dado a proteger.
- **Guardar em `localStorage`:** o servidor não lê, e a primeira pintura viria no padrão.
- **`@meuproduto/ui` com `next-intl`:** traduziria os componentes direto, mas prenderia a biblioteca de UI a um framework e a uma biblioteca de idiomas, contra o [ADR-0011](0011-estrutura-monorepo.md).

## Consequências

Toda tela nova é traduzível e respeita as preferências. O custo é manter os arquivos de idioma em paridade, o que o teste cobra, e passar textos por props aos componentes de `@meuproduto/ui` usados em telas traduzidas.

Limites desta versão:

- Os componentes de `@meuproduto/ui` além do `SeletorDeTema` continuam só em português.
- As traduções para inglês foram feitas sem glossário e precisam de revisão.
- As rotas seguem dinâmicas, como registrado no ADR-0008, porque o layout raiz lê cookies.
- O `next-intl` traz dependências com script de instalação, marcadas para não executar em `pnpm-workspace.yaml`.

## Verificação de aderência

| Regra                                      | Evidência                                                                           | Estado                     |
| ------------------------------------------ | ----------------------------------------------------------------------------------- | -------------------------- |
| Tema vale na hora e vem pronto do servidor | E2E `preferencias.spec.ts`                                                          | Pendente neste repositório |
| Idioma traduz a tela e persiste            | E2E `preferencias.spec.ts`: título e `lang` em inglês, antes e depois de recarregar | Pendente neste repositório |
| Idiomas em paridade                        | `mensagens.test.ts`: chaves, variáveis e textos não vazios                          | Pendente neste repositório |
| Cookie inválido cai no padrão              | `preferencias.test.ts`                                                              | Pendente neste repositório |

## Pendências e exceções

- API de preferências por pessoa, depois da sessão real.
- Decisão sobre fuso horário por escritório.
- Textos de `@meuproduto/ui` por props nos demais componentes, à medida que entrarem em telas traduzidas.
- Revisão das traduções com quem conhece os termos em inglês.

Nenhuma exceção registrada.

## Referências

- [ADR-0008](0008-design-system.md) — tokens, tema e componentes
- [ADR-0013](0013-ambientes-e-configuracao.md) — configuração por ambiente
- [ADR-0016](0016-recursos-do-react-19.md) — `useTransition` e demais recursos do React
- [next-intl: uso sem rotas por idioma](https://next-intl.dev/docs/getting-started/app-router/without-i18n-routing)
