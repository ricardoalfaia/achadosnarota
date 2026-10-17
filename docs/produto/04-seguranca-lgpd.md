# Segurança, LGPD e confiança

Este documento é um checklist de engenharia e não substitui revisão jurídica.

## Papéis e finalidade

Mapear controlador(es), operadores, fornecedores, finalidades e bases legais por tratamento antes do lançamento. Não usar consentimento como base universal: separar execução contratual, obrigações legais, legítimo interesse quando justificável e consentimento quando necessário. Registro de operações de tratamento e contratos com fornecedores.

## Dados mínimos

Coletar nome, email e autenticação para conta; dados de cobrança estritamente necessários; telefone apenas quando justificado. Não solicitar CPF no cadastro por padrão. Não armazenar cartão. Geolocalização somente opcional e com permissão contextual. Não vender histórico de visitas individualizado.

## Direitos e retenção

Portal de solicitações: acesso, correção, exclusão quando cabível, portabilidade e oposição; processos para validação de identidade. Política de retenção por categoria e exigência legal; anonimização ou eliminação ao término. Backups com ciclo de expiração e procedimento documentado.

## Controles

TLS, criptografia em repouso provida pela infraestrutura, gestão de segredos, RBAC e checagem de ownership em todas as rotas, rate limit, CSRF quando aplicável, CSP, cookies seguros, sanitização, proteção contra enumeração e abuso, MFA para administradores e curadores, logs de auditoria, backups e restauração testada. Revisão OWASP ASVS nível apropriado e testes de autorização horizontal.

## Pagamentos

Checkout hospedado/tokenizado por provedor; validar assinatura de webhook, timestamp/replay e idempotência; jamais aceitar confirmação do frontend como prova de pagamento. Revisar obrigações consumeristas de renovação, cancelamento, reembolso e direito de arrependimento com assessoria jurídica.

## Curadoria e publicidade

Critérios públicos, metodologia versionada, data da visita, conflito de interesses declarado, correções e contestação pelo estabelecimento. Parceiro não compra selo/nota; identificar benefícios e publicidade de modo inequívoco. Não prometer 'avaliação imparcial' sem controles verificáveis.

## Incidentes

Plano de resposta: classificação, contenção, preservação de evidências, comunicação conforme normas aplicáveis da ANPD, recuperação e retrospectiva. Canal de contato de privacidade e responsável definido.
