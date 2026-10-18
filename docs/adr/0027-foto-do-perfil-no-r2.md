# ADR-0027 — Foto do perfil: ajuste no navegador, regravação no servidor e R2

**Estado:** Proposto  
**Data:** 2026-10-18  
**Princípios relacionados:** P02, P03, P05, P06  
**Responsável pela proposta:** Ricardo Alfaia Barbosa  
**Aceitação:** pendente; implementado em `apps/achados-web` (`features/perfil`, `shared/armazenamento`).

## Contexto

O avatar do app do assinante mostrava a foto de `user.image` (Better Auth), mas não havia como enviá-la. O [02 — Arquitetura](../produto/02-arquitetura.md) pede CDN para imagens, upload assinado e sanitização de metadados, com credenciais só no servidor. O bucket do R2 (Cloudflare) já tinha chaves S3 no ambiente (`R2_*`). O Better Auth expõe `POST /api/auth/update-user`, que aceita `image` vindo do navegador.

## Decisão proposta

- **Ajuste no navegador, conferência no servidor.** A pessoa arrasta, dá zoom (controle, roda, pinça, teclado) e o navegador recorta o quadrado de 512px num canvas. As contas do enquadramento são funções puras (`domain/enquadramento.ts`). O servidor não confia no recorte: decodifica com o `sharp`, aceita só JPEG, PNG e WebP pelo conteúdo, limita a 8000 × 8000 pixels, corta ao centro se não vier quadrada e regrava em WebP 512px **sem metadados** (EXIF, GPS).
- **Envio pela Action, não por URL pré-assinada.** O arquivo já recortado tem centenas de KB, abaixo do limite de 1 MB das Server Actions; passar pelo servidor é o que permite regravar e tirar os metadados antes de qualquer byte chegar ao bucket. O servidor assina as requisições S3 (SigV4, `aws4fetch`); as chaves nunca saem dele. É um comando ([ADR-0006](0006-estado-http-e-cache.md)), coordenado por `useMutation` com o adaptador `executarAcao` ([ADR-0004](0004-result-error.md)).
- **Nome sem dado pessoal.** `avatares/{ULID}.webp` ([ADR-0024](0024-identificadores-ulid.md)); nunca nome, e-mail ou id. Cada foto tem nome novo, então o objeto é servido com `Cache-Control: immutable` pela URL pública do bucket.
- **Só a Action grava `user.image`.** Ela lê a foto atual com `FOR UPDATE` e grava a nova na mesma transação, e depois da resposta apaga a anterior se for uma chave de avatar deste app. O gancho `databaseHooks.user.update.before` descarta `image` de qualquer atualização feita pelo Better Auth: pelo endpoint público, alguém apontaria a própria foto para um endereço externo (rastreio) ou para a foto de outra pessoa, que a troca seguinte apagaria.
- **Ambiente.** `R2_ACCOUNT_ID`, `R2_API_KEY` (Access Key ID), `R2_SECRET`, `R2_BUCKET` e `R2_PUBLIC_URL` (https), todas ou nenhuma. Sem elas o app sobe e a troca avisa que está indisponível. `R2_TOKEN` (token da API da Cloudflare) não é usado.

## Consequências

- A foto é pública para quem tiver o endereço, como um avatar em qualquer rede; o endereço é imprevisível e não identifica a pessoa.
- Uma falha ao apagar a foto antiga deixa um arquivo órfão (registrado no log só com o código do erro).
- O E2E envia ao bucket configurado no `.env.local`; sem as chaves (CI), o teste do envio se pula ao ver o aviso de indisponível.

## Pendências

- Bucket separado para local e homologação; hoje o `.env.local` aponta para o mesmo bucket de produção.
- Domínio próprio na frente do bucket em produção: o `*.r2.dev` tem limite de requisições e não é para produção.
- Limite de envios por pessoa (hoje só o limite de corpo da Action).
- Exclusão da conta precisa apagar a foto do bucket, quando a exclusão existir.
