-- Initial Drizzle migration. Sprint 1 surface: tenants, users, audit_logs.
-- Generated to mirror packages/db/src/schema.ts.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================================
-- enums
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'firm_admin', 'attorney', 'case_manager', 'paralegal',
    'candidate', 'recommender', 'observer'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE audit_action AS ENUM (
    'insert', 'update', 'delete', 'access', 'export',
    'approve', 'reject', 'send', 'login', 'logout'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =============================================================================
-- tenants — global, not RLS-scoped
-- =============================================================================

CREATE TABLE IF NOT EXISTS tenants (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                varchar(64) NOT NULL UNIQUE,
  name                varchar(255) NOT NULL,
  clerk_org_id        varchar(255) NOT NULL UNIQUE,
  custom_domain       varchar(255),
  branding            jsonb NOT NULL DEFAULT '{}'::jsonb,
  plan                varchar(32) NOT NULL DEFAULT 'starter',
  region              varchar(16) NOT NULL DEFAULT 'us-east-1',
  kms_data_key_arn    varchar(512),
  brenda_enabled      boolean NOT NULL DEFAULT true,
  brenda_config       jsonb NOT NULL DEFAULT '{}'::jsonb,
  case_types_enabled  jsonb NOT NULL DEFAULT '[]'::jsonb,
  data_retention_days integer NOT NULL DEFAULT 2555,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  deleted_at          timestamptz
);

-- =============================================================================
-- users — RLS-scoped
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  clerk_user_id      varchar(255) NOT NULL UNIQUE,
  email              varchar(320) NOT NULL,
  first_name         varchar(128),
  last_name          varchar(128),
  role               user_role NOT NULL,
  phone              varchar(32),
  preferred_language varchar(8) NOT NULL DEFAULT 'en',
  last_login_at      timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  deleted_at         timestamptz,
  CONSTRAINT users_tenant_email_uq UNIQUE (tenant_id, email)
);

CREATE INDEX IF NOT EXISTS users_tenant_idx ON users (tenant_id);

-- =============================================================================
-- audit_logs — append-only, written by triggers
-- =============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL,
  actor_user_id uuid,
  actor_kind    varchar(16) NOT NULL,
  action        audit_action NOT NULL,
  table_name    varchar(64) NOT NULL,
  record_id     uuid,
  before_jsonb  jsonb,
  after_jsonb   jsonb,
  ip            varchar(64),
  user_agent    text,
  request_id    varchar(64),
  occurred_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_tenant_time_idx ON audit_logs (tenant_id, occurred_at);
CREATE INDEX IF NOT EXISTS audit_logs_record_idx ON audit_logs (table_name, record_id);
