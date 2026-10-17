-- Papel usado pela aplicação (web e jobs). Roda uma vez, quando o volume do
-- Postgres é criado (/docker-entrypoint-initdb.d). Em volume já existente, ou
-- fora do docker-compose, use packages/db/scripts/setup-app-role.mjs.
--
-- achados_app NÃO é dono das tabelas, então as policies de Row Level Security
-- valem para ele. O papel "achados" (dono, POSTGRES_USER) roda migrations e
-- seeds e não é filtrado. Senha fixa só para desenvolvimento local.
CREATE ROLE achados_app LOGIN PASSWORD 'achados_app'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;

GRANT CONNECT ON DATABASE achados TO achados_app;
GRANT USAGE ON SCHEMA public TO achados_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO achados_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO achados_app;

-- Tabelas que as migrations criarem depois (como dono) já nascem acessíveis.
ALTER DEFAULT PRIVILEGES FOR ROLE achados IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO achados_app;
ALTER DEFAULT PRIVILEGES FOR ROLE achados IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO achados_app;
