-- Sprint 2 migration: candidates, cases, documents, assessments, criteria_scores.

DO $$ BEGIN CREATE TYPE case_stage AS ENUM (
  'lead', 'consultation', 'engaged', 'intake', 'preparation',
  'attorney_review', 'filed', 'in_adjudication', 'rfe_noid', 'decision',
  'post_decision', 'closed'
); EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE document_status AS ENUM (
  'uploading', 'uploaded', 'scanning', 'scanned', 'classifying',
  'classified', 'failed'
); EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE assessment_layer AS ENUM (
  'ai', 'professional', 'roadmap'
); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- candidates
CREATE TABLE IF NOT EXISTS candidates (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  user_id              uuid REFERENCES users(id) ON DELETE SET NULL,
  first_name           varchar(128) NOT NULL,
  last_name            varchar(128) NOT NULL,
  email                varchar(320),
  phone                varchar(32),
  country_of_birth     varchar(64),
  country_of_citizenship varchar(64),
  current_status       varchar(64),
  linkedin_url         varchar(512),
  source               varchar(64) NOT NULL DEFAULT 'intake_link',
  visa_interest        jsonb NOT NULL DEFAULT '[]'::jsonb,
  status               varchar(32) NOT NULL DEFAULT 'lead',
  owner_user_id        uuid REFERENCES users(id),
  preferred_language   varchar(8) NOT NULL DEFAULT 'en',
  notes                text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  deleted_at           timestamptz
);
CREATE INDEX IF NOT EXISTS candidates_tenant_idx ON candidates(tenant_id);
CREATE INDEX IF NOT EXISTS candidates_owner_idx ON candidates(owner_user_id);
CREATE INDEX IF NOT EXISTS candidates_email_idx ON candidates(tenant_id, email);

-- cases
CREATE TABLE IF NOT EXISTS cases (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  case_number          varchar(64) NOT NULL,
  candidate_id         uuid NOT NULL REFERENCES candidates(id) ON DELETE RESTRICT,
  case_type_code       varchar(64) NOT NULL,
  stage                case_stage NOT NULL DEFAULT 'lead',
  attorney_user_id     uuid REFERENCES users(id),
  case_manager_user_id uuid REFERENCES users(id),
  priority_date        timestamp,
  receipt_number       varchar(32),
  filing_date          timestamptz,
  decision_date        timestamptz,
  decision_status      varchar(32),
  overall_score        integer,
  score_label          varchar(32),
  legal_hold           boolean NOT NULL DEFAULT false,
  notes                text,
  closed_at            timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  deleted_at           timestamptz,
  CONSTRAINT cases_tenant_number_uq UNIQUE (tenant_id, case_number)
);
CREATE INDEX IF NOT EXISTS cases_candidate_idx ON cases(candidate_id);
CREATE INDEX IF NOT EXISTS cases_stage_idx ON cases(tenant_id, stage);
CREATE INDEX IF NOT EXISTS cases_attorney_idx ON cases(attorney_user_id);

-- documents
CREATE TABLE IF NOT EXISTS documents (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  case_id              uuid REFERENCES cases(id) ON DELETE RESTRICT,
  candidate_id         uuid REFERENCES candidates(id),
  uploaded_by_user_id  uuid REFERENCES users(id),
  filename             varchar(512) NOT NULL,
  mime_type            varchar(128) NOT NULL,
  size_bytes           integer NOT NULL,
  storage_key          varchar(1024) NOT NULL,
  category             varchar(64),
  criterion_tags       jsonb NOT NULL DEFAULT '[]'::jsonb,
  ai_metadata          jsonb NOT NULL DEFAULT '{}'::jsonb,
  ai_confidence        varchar(8),
  ocr_text             text,
  page_count           integer,
  status               document_status NOT NULL DEFAULT 'uploading',
  virus_scanned_at     timestamptz,
  classified_at        timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  deleted_at           timestamptz
);
CREATE INDEX IF NOT EXISTS documents_case_idx ON documents(case_id);
CREATE INDEX IF NOT EXISTS documents_tenant_idx ON documents(tenant_id);

-- assessments
CREATE TABLE IF NOT EXISTS assessments (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  case_id              uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  layer                assessment_layer NOT NULL,
  case_type_code       varchar(64) NOT NULL,
  version              integer NOT NULL DEFAULT 1,
  doc_set_hash         varchar(64),
  overall_score        integer,
  fit_label            varchar(32),
  reasoning_trace      jsonb NOT NULL DEFAULT '[]'::jsonb,
  alternate_paths      jsonb NOT NULL DEFAULT '[]'::jsonb,
  model_version        varchar(64) NOT NULL DEFAULT 'stub-v1',
  generated_at         timestamptz NOT NULL DEFAULT now(),
  attorney_approved    boolean NOT NULL DEFAULT false,
  approved_by_user_id  uuid REFERENCES users(id),
  approved_at          timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS assessments_case_layer_idx ON assessments(case_id, layer);

-- criteria_scores
CREATE TABLE IF NOT EXISTS criteria_scores (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  assessment_id        uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  case_id              uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  criterion_code       varchar(64) NOT NULL,
  met                  boolean NOT NULL,
  confidence           varchar(8) NOT NULL,
  rationale            text NOT NULL,
  evidence_doc_ids     jsonb NOT NULL DEFAULT '[]'::jsonb,
  gaps                 jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommendations      jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS criteria_scores_assessment_idx ON criteria_scores(assessment_id);
