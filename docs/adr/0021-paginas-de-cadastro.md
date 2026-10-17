# ADR-0021 — Páginas de cadastro: listagem e formulário em seções

**Estado:** Proposto  
**Data:** 2026-10-16  
**Princípios relacionados:** P01, P03, P04, P07  
**Responsável pela proposta:** Ricardo Alfaia Barbosa  
**Aceitação:** pendente; padrão sem implementação neste repositório. O exemplo da base de origem (um cadastro do domínio de origem) foi removido.

## Contexto

O Meuproduto precisa de telas de cadastro para clientes, modelos, equipe e configurações ([01 — Produto](../produto/01-produto-e-escopo.md), MVP P0). A base de origem trouxe um padrão de tela de cadastro (listagem, formulário, pendências, regras puras) e as partes visuais em `@meuproduto/ui` (`GradeDeCadastro`, `Visoes`, `BarraDoFormulario`, `Abas`, `Tabela`; [ADR-0008](0008-design-system.md)). O padrão continua válido; o domínio de origem, não.

Diferenças do Meuproduto que mudam o desenho:

- O menu tem itens planos ([ADR-0018](0018-casca-do-sistema.md)); não há hub de cadastros nem mega menu.
- O tenant ativo está na URL e é conferido no servidor ([ADR-0020](0020-autenticacao-e-sessao.md)).
- Dados de clientes são confidenciais e mínimos ([03 — Domínio](../produto/03-modelo-de-dominio.md); [05 — LGPD](../produto/05-lgpd.md): coletar somente campos necessários).
- Modelos publicados são imutáveis; editar cria versão nova ([ADR-004 de produto](../produto/adr/ADR-004.md)).

## Decisão proposta

### Endereços

- **Uma área é uma página:** `Clientes`, `Modelos`, `Equipe` e `Configurações` têm rota própria sob o tenant ([A CONFIRMAR — ADR-0020] prefixo `/t/[slug]/`). Uma área com sub-cadastros (por exemplo, Configurações) os mostra como abas em links (`?aba=<chave>`), não como estado do cliente.
- **O registro aberto fica no endereço** por identificador opaco: `?cliente=<id>` edita e `?novo=1` inclui. Nunca CPF, CNPJ, nome ou outro dado pessoal no endereço ([README de produto](../produto/README.md), princípio 2). O voltar do navegador e um link para o registro funcionam.
- **Identificador na URL não é autorização:** o servidor lê o registro pelo `id` **dentro do tenant ativo** (`withTenant`); um `id` de outro tenant responde como não encontrado.
- **Busca e filtros:** filtros de valor fechado (situação, tipo, página) podem ir para a URL; texto livre de busca não, enquanto a pendência do [ADR-0006](0006-estado-http-e-cache.md) não for decidida.

### Composição

| Parte                 | Onde                                                                                  | Responsabilidade                                     |
| --------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Rota da área          | `app/.../<area>/page.tsx`                                                             | Confere sessão e tenant; escolhe lista ou formulário |
| Capacidade            | `features/<area>` (por exemplo, `features/clientes`)                                  | Domínio (tipo, regras, validação) e componentes      |
| Listagem e formulário | `@meuproduto/ui` (`GradeDeCadastro`, `Visoes`, `BarraDoFormulario`, `Abas`, `Tabela`) | Apresentação, sem regra de negócio                   |
| Leitura e gravação    | Consulta no servidor e Server Action                                                  | `Result` do core; autorização e tenant no servidor   |

### Regras como funções puras

O que a tela decide vira função sem React, com teste. Exemplo ilustrativo para clientes:

- `cliente.ts`: o tipo `Cliente` com os campos mínimos e `novoCliente` (padrões da inclusão).
- `validacao.ts`: `pendenciasDoCliente` devolve campo, seção e motivo; o texto do motivo fica nas traduções.
- `documento.ts`: validação de CPF e CNPJ (inclusive o CNPJ alfanumérico).

A validação no cliente é conveniência; o servidor valida de novo e é a autoridade ([ADR-0004](0004-result-error.md), [ADR-0006](0006-estado-http-e-cache.md)).

### Experiência

- **Seções por assunto**, com grupos com título dentro de cada uma.
- **Um formulário só para incluir e editar.**
- **Pendências depois da primeira tentativa de gravar:** mensagem no campo, contador em cada seção, salto para a primeira seção com problema.
- **Campos que não se aplicam são escondidos ou travados** com o motivo ao lado.
- **Nada é gravado até "Salvar"** (Ctrl+S). Sair com alterações pede confirmação; excluir usa a exclusão em duas etapas, e a exclusão de cliente respeita retenção e LGPD ([03 — Domínio](../produto/03-modelo-de-dominio.md), invariante 6).
- **Modelos:** um modelo publicado abre somente para leitura; "editar" cria um rascunho de nova versão.

### Dados provisórios

Enquanto não houver API, uma tela pode usar dados sintéticos marcados como provisórios, sem nome, CPF ou documento real.

## Alternativas consideradas

- **Hub por grupo com abas para cada cadastro (desenho da base):** fazia sentido com dezenas de cadastros; o Meuproduto tem poucas áreas e menu plano.
- **Formulário em rota própria** (`/clientes/<id>`): carregamento por registro no servidor, que é o desenho certo com API. A troca na mesma página preserva busca e filtros; revisar quando a leitura vier do servidor.
- **Biblioteca de formulário (react-hook-form):** reavaliar na primeira integração com Actions e erros por campo vindos do servidor.
- **Exportação da listagem em CSV no navegador:** a base tinha; para dados de clientes, exportação é feita no servidor, autorizada e auditada ([ADR-0015](0015-tabela-de-dados.md)).

## Consequências

Há um padrão para as telas de cadastro sem um motor genérico. O custo é que cada área escreve suas regras e textos; o ganho é que eles são testáveis sem a tela.

## Verificação de aderência

| Regra                                           | Evidência                                                | Estado    |
| ----------------------------------------------- | -------------------------------------------------------- | --------- |
| Registro de outro tenant não abre               | Teste de integração A/B e E2E trocando o `id` na URL     | Planejado |
| URL sem dado pessoal                            | Revisão e E2E: endereço depois de abrir, buscar e salvar | Planejado |
| Regras do cadastro testadas sem a tela          | Testes unitários da capacidade                           | Planejado |
| Editar, descartar, salvar, incluir e pendências | E2E da primeira área implementada                        | Planejado |
| Modelo publicado não é editado no lugar         | Teste de integração da gravação                          | Planejado |
| Idiomas em paridade                             | `mensagens.test.ts`                                      | Planejado |

## Pendências e exceções

- Escolher a primeira área implementada (clientes é a candidata, por ser pré-requisito de documentos).
- Campos mínimos do cliente, a validar com o piloto ([01 — Produto](../produto/01-produto-e-escopo.md), premissas).
- Pendência de busca na URL do ADR-0006.

Nenhuma exceção registrada.

## Referências

- [ADR-0008](0008-design-system.md), [ADR-0015](0015-tabela-de-dados.md), [ADR-0018](0018-casca-do-sistema.md), [ADR-0020](0020-autenticacao-e-sessao.md)
- ADRs de produto: [ADR-003](../produto/adr/ADR-003.md), [ADR-004](../produto/adr/ADR-004.md), [ADR-006](../produto/adr/ADR-006.md)
