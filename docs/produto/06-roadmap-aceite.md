# Roadmap e critérios de aceite

## Fase 0 — validação

Entrevistar consumidores e parceiros; testar intenção de compra e margem das ofertas; definir critérios de curadoria e governança. Go/no-go antes de investir em cobertura nacional.

## Fase 1 — fundação

Repo, CI, migrations, autenticação, RBAC, catálogo e SEO. Aceite: páginas de cidade/local indexáveis, zero acesso cruzado entre parceiros, testes automatizados e staging funcional.

## Fase 2 — curadoria

Workflow editorial, critérios versionados, publicação e auditoria. Aceite: parceiro sem permissão de editar nota; histórico de alterações; dados de avaliação não publicados sem aprovação.

## Fase 3 — passaporte

Checkout sandbox, webhook, assinatura e conta. Aceite: ativação somente por evento validado; eventos duplicados sem efeito; cancelamento/estorno tratado.

## Fase 4 — benefícios

Ofertas, regras, emissão e validação de código, limites. Aceite: dois operadores concorrentes não conseguem resgatar o mesmo token; usuário inelegível não emite; token expirado não resgata.

## Fase 5 — piloto

Uma região, número pequeno de parceiros reais, curadoria auditável, suporte, termos e privacidade revisados, métricas. Sem expansão antes de retenção e CAC minimamente validados.

## Testes mínimos

Unitários para elegibilidade, estados e cálculo de validade; integração para DB e webhooks; E2E para descoberta, assinatura sandbox e resgate; segurança para IDOR/RBAC, replay, brute force, CSRF/XSS e concorrência. Auditoria manual de acessibilidade e SEO.

## Critérios de pronto por tarefa

Migração reversível ou plano de rollback, teste relevante, documentação atualizada, logs sem dados sensíveis, review de segurança, estados de erro e critérios de aceite demonstrados.
