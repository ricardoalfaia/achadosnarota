# Achados na Rota — documentação de produto

**Status:** proposta para MVP; decisões sujeitas à validação. **Versão:** 0.1, outubro de 2026.

Plataforma PWA de descoberta de restaurantes, hospedagens e experiências, com curadoria editorial independente e passaporte anual de benefícios financiado pelo consumidor. Estabelecimentos podem participar comercialmente, sem comprar notas, selos ou posições editoriais.

Estes documentos são a fonte do produto. Os [princípios do frontend](../arquitetura.md) e os [ADRs de frontend](../adr/README.md) dizem como o código é construído e não redefinem nada daqui.

## Princípios inegociáveis

1. **Confiança acima de monetização editorial.** Avaliação, visitas e critérios ficam isolados de ofertas e contratos comerciais; parceiro não escreve no editorial ([ADR-004](adr/ADR-004.md)).
2. **Conteúdo público indexável e conversão sem instalar aplicativo** ([ADR-001](adr/ADR-001.md), [ADR-008](adr/ADR-008.md)).
3. **Assinatura não garante economia.** Ofertas e condições são explícitas antes do pagamento e antes do resgate; nenhuma alegação de economia sem comprovação.
4. **MVP regional com arquitetura expansível** ([ADR-009](adr/ADR-009.md)).
5. **Dados, avaliações e benefícios são domínios separados.**
6. **Nada de avaliação, nota, estabelecimento ou economia fictícios em produção.** Dados do protótipo e do seed são sintéticos e só existem em desenvolvimento.
7. **Autorização no servidor, a cada pedido; dados mínimos; nada sensível em logs** ([04](04-seguranca-lgpd.md), [ADR-007](adr/ADR-007.md)).
8. **Código de resgate imprevisível, em hash, de uso único e consumido em transação** ([ADR-005](adr/ADR-005.md)).
9. **Webhook de pagamento assinado, idempotente e reconciliado; nenhuma cobrança real sem aprovação humana** ([ADR-006](adr/ADR-006.md)).

## Índice

| Documento                                        | Assunto                                          |
| ------------------------------------------------ | ------------------------------------------------ |
| [01 — Produto](01-produto.md)                    | Visão, públicos, MVP, jornadas e métricas        |
| [02 — Arquitetura](02-arquitetura.md)            | Stack, contextos, infraestrutura e PWA           |
| [03 — Domínio](03-dominio.md)                    | Entidades, invariantes, estados e transações     |
| [04 — Segurança e LGPD](04-seguranca-lgpd.md)    | Privacidade, controles, pagamentos e curadoria   |
| [05 — UI e design system](05-ui-design-system.md) | Identidade, telas e acessibilidade               |
| [06 — Roadmap e aceite](06-roadmap-aceite.md)    | Fases, critérios de aceite e testes mínimos      |
| [07 — API](07-api-contratos.md)                  | Contratos preliminares                           |
| [08 — Operação comercial](08-operacao-comercial.md) | Receita, regras comerciais, curadoria e riscos |
| [09 — Supervisão](09-supervisao.md)              | O que toda entrega apresenta                     |
| [ADRs de produto](adr/README.md)                 | `ADR-001` a `ADR-010`                            |
| [Marca](marca/README.md)                         | Logotipo, mockups e protótipo de referência      |
| [Prompts](prompts/00-claude-mestre.md)           | Prompt mestre e prompt de auditoria              |

## Fases como portões

As fases do [roadmap](06-roadmap-aceite.md) são portões: uma fase só começa com o aceite da anterior demonstrado por evidência executada neste repositório.

| Fase | Entrega                                         | Aceite resumido                                                                          |
| ---- | ----------------------------------------------- | ---------------------------------------------------------------------------------------- |
| F0   | Validação com consumidores e parceiros          | Go/no-go registrado                                                                      |
| F1   | Fundação: repo, CI, migrações, auth, catálogo, SEO | Páginas de cidade/local indexáveis, zero acesso cruzado, testes e staging funcional   |
| F2   | Curadoria                                       | Parceiro sem escrita em nota; histórico; nada publicado sem aprovação                    |
| F3   | Passaporte                                      | Ativação só por evento validado; eventos duplicados sem efeito; cancelamento e estorno   |
| F4   | Benefícios                                      | Resgate concorrente impossível; inelegível não emite; token expirado não resgata         |
| F5   | Piloto regional                                 | Parceiros reais, termos revisados, métricas; sem expansão antes de retenção e CAC        |

## Pendências antes de produção

- Provedor de pagamento e homologação em sandbox ([ADR-006](adr/ADR-006.md)).
- Preço do passaporte: R$ 129/ano é hipótese de teste, não tabela aprovada.
- Revisão jurídica de termos, privacidade, renovação, cancelamento e direito de arrependimento.
- Metodologia de curadoria publicada e versionada.
- Paleta e logotipo validados contra a arte final ([05](05-ui-design-system.md)).
