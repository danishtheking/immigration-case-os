-- Bootstrap roles. Runs once when the postgres container is initialized.
-- The app_tenant role is RLS-enforced; the app_admin role bypasses RLS for migrations.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_tenant') THEN
    CREATE ROLE app_tenant LOGIN PASSWORD 'dev';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_admin_role') THEN
    CREATE ROLE app_admin_role NOLOGIN BYPASSRLS;
    GRANT app_admin_role TO app_admin;
  END IF;
END
$$;

GRANT CONNECT ON DATABASE immcaseos TO app_tenant;
GRANT USAGE ON SCHEMA public TO app_tenant;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_tenant;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO app_tenant;

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
