/**
 * Drizzle schema for Immigration Case OS — Sprint 1 surface only.
 *
 * Sprint 1 ships just `tenants`, `users`, and `audit_logs` so the
 * "create tenant -> invite user -> log in -> see dashboard" flow
 * works end-to-end with RLS enforced.
 *
 * Future tables (cases, documents, forms, deadlines, assessments,
 * agent_actions, etc.) are documented in docs/data-model.md and
 * added in subsequent sprints.
 */

import { sql } from 'drizzle-orm';
import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
  unique,
  index,
} from 'drizzle-orm/pg-core';

// =============================================================================
// Helpers
// =============================================================================

const id = () =>
  uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`);

const createdAt = () =>
  timestamp('created_at', { withTimezone: true }).notNull().defaultNow();

const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true }).notNull().defaultNow();

// =============================================================================
// Enums
// =============================================================================

export const userRoleEnum = pgEnum('user_role', [
  'firm_admin',
  'attorney',
  'case_manager',
  'paralegal',
  'candidate',
  'recommender',
  'observer',
]);

export const auditActionEnum = pgEnum('audit_action', [
  'insert',
  'update',
  'delete',
  'access',
  'export',
  'approve',
  'reject',
  'send',
  'login',
  'logout',
]);

// =============================================================================
// tenants — global, not RLS-scoped (this IS the tenant table)
// =============================================================================

export const tenants = pgTable('tenants', {
  id: id(),
  slug: varchar('slug', { length: 64 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  clerk_org_id: varchar('clerk_org_id', { length: 255 }).notNull().unique(),
  custom_domain: varchar('custom_domain', { length: 255 }),
  branding: jsonb('branding').notNull().default({}),
  plan: varchar('plan', { length: 32 }).notNull().default('starter'),
  region: varchar('region', { length: 16 }).notNull().default('us-east-1'),
  kms_data_key_arn: varchar('kms_data_key_arn', { length: 512 }),
  brenda_enabled: boolean('brenda_enabled').notNull().default(true),
  brenda_config: jsonb('brenda_config').notNull().default({}),
  case_types_enabled: jsonb('case_types_enabled').notNull().default([]),
  data_retention_days: integer('data_retention_days').notNull().default(2555),
  created_at: createdAt(),
  updated_at: updatedAt(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
});

// =============================================================================
// users — RLS-scoped to tenant_id
// =============================================================================

export const users = pgTable(
  'users',
  {
    id: id(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    clerk_user_id: varchar('clerk_user_id', { length: 255 }).notNull().unique(),
    email: varchar('email', { length: 320 }).notNull(),
    first_name: varchar('first_name', { length: 128 }),
    last_name: varchar('last_name', { length: 128 }),
    role: userRoleEnum('role').notNull(),
    phone: varchar('phone', { length: 32 }),
    preferred_language: varchar('preferred_language', { length: 8 })
      .notNull()
      .default('en'),
    last_login_at: timestamp('last_login_at', { withTimezone: true }),
    created_at: createdAt(),
    updated_at: updatedAt(),
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => ({
    tenantEmailUq: unique('users_tenant_email_uq').on(t.tenant_id, t.email),
    tenantIdx: index('users_tenant_idx').on(t.tenant_id),
  }),
);

// =============================================================================
// audit_logs — append-only, written by Postgres triggers via SECURITY DEFINER
// =============================================================================

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: id(),
    tenant_id: uuid('tenant_id').notNull(),
    actor_user_id: uuid('actor_user_id'),
    actor_kind: varchar('actor_kind', { length: 16 }).notNull(),
    action: auditActionEnum('action').notNull(),
    table_name: varchar('table_name', { length: 64 }).notNull(),
    record_id: uuid('record_id'),
    before_jsonb: jsonb('before_jsonb'),
    after_jsonb: jsonb('after_jsonb'),
    ip: varchar('ip', { length: 64 }),
    user_agent: text('user_agent'),
    request_id: varchar('request_id', { length: 64 }),
    occurred_at: timestamp('occurred_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    tenantTimeIdx: index('audit_logs_tenant_time_idx').on(
      t.tenant_id,
      t.occurred_at,
    ),
    recordIdx: index('audit_logs_record_idx').on(t.table_name, t.record_id),
  }),
);

// =============================================================================
// Sprint 2 enums
// =============================================================================

export const caseStageEnum = pgEnum('case_stage', [
  'lead', 'consultation', 'engaged', 'intake', 'preparation',
  'attorney_review', 'filed', 'in_adjudication', 'rfe_noid', 'decision',
  'post_decision', 'closed',
]);

export const documentStatusEnum = pgEnum('document_status', [
  'uploading', 'uploaded', 'scanning', 'scanned', 'classifying',
  'classified', 'failed',
]);

export const assessmentLayerEnum = pgEnum('assessment_layer', [
  'ai', 'professional', 'roadmap',
]);

// =============================================================================
// candidates — RLS-scoped
// =============================================================================

export const candidates = pgTable(
  'candidates',
  {
    id: id(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    user_id: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    first_name: varchar('first_name', { length: 128 }).notNull(),
    last_name: varchar('last_name', { length: 128 }).notNull(),
    email: varchar('email', { length: 320 }),
    phone: varchar('phone', { length: 32 }),
    country_of_birth: varchar('country_of_birth', { length: 64 }),
    country_of_citizenship: varchar('country_of_citizenship', { length: 64 }),
    current_status: varchar('current_status', { length: 64 }),
    linkedin_url: varchar('linkedin_url', { length: 512 }),
    source: varchar('source', { length: 64 }).notNull().default('intake_link'),
    visa_interest: jsonb('visa_interest').notNull().default([]),
    status: varchar('status', { length: 32 }).notNull().default('lead'),
    owner_user_id: uuid('owner_user_id').references(() => users.id),
    preferred_language: varchar('preferred_language', { length: 8 }).notNull().default('en'),
    notes: text('notes'),
    created_at: createdAt(),
    updated_at: updatedAt(),
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => ({
    tenantIdx: index('candidates_tenant_idx').on(t.tenant_id),
    ownerIdx: index('candidates_owner_idx').on(t.owner_user_id),
    emailIdx: index('candidates_email_idx').on(t.tenant_id, t.email),
  }),
);

// =============================================================================
// cases — RLS-scoped
// =============================================================================

export const cases = pgTable(
  'cases',
  {
    id: id(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    case_number: varchar('case_number', { length: 64 }).notNull(),
    candidate_id: uuid('candidate_id')
      .notNull()
      .references(() => candidates.id, { onDelete: 'restrict' }),
    case_type_code: varchar('case_type_code', { length: 64 }).notNull(),
    stage: caseStageEnum('stage').notNull().default('lead'),
    attorney_user_id: uuid('attorney_user_id').references(() => users.id),
    case_manager_user_id: uuid('case_manager_user_id').references(() => users.id),
    priority_date: timestamp('priority_date', { withTimezone: false }),
    receipt_number: varchar('receipt_number', { length: 32 }),
    filing_date: timestamp('filing_date', { withTimezone: true }),
    decision_date: timestamp('decision_date', { withTimezone: true }),
    decision_status: varchar('decision_status', { length: 32 }),
    overall_score: integer('overall_score'),
    score_label: varchar('score_label', { length: 32 }),
    legal_hold: boolean('legal_hold').notNull().default(false),
    notes: text('notes'),
    closed_at: timestamp('closed_at', { withTimezone: true }),
    created_at: createdAt(),
    updated_at: updatedAt(),
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => ({
    caseNumberUq: unique('cases_tenant_number_uq').on(t.tenant_id, t.case_number),
    candidateIdx: index('cases_candidate_idx').on(t.candidate_id),
    stageIdx: index('cases_stage_idx').on(t.tenant_id, t.stage),
    attorneyIdx: index('cases_attorney_idx').on(t.attorney_user_id),
  }),
);

// =============================================================================
// documents — RLS-scoped
// =============================================================================

export const documents = pgTable(
  'documents',
  {
    id: id(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    case_id: uuid('case_id').references(() => cases.id, { onDelete: 'restrict' }),
    candidate_id: uuid('candidate_id').references(() => candidates.id),
    uploaded_by_user_id: uuid('uploaded_by_user_id').references(() => users.id),
    filename: varchar('filename', { length: 512 }).notNull(),
    mime_type: varchar('mime_type', { length: 128 }).notNull(),
    size_bytes: integer('size_bytes').notNull(),
    storage_key: varchar('storage_key', { length: 1024 }).notNull(),
    category: varchar('category', { length: 64 }),
    criterion_tags: jsonb('criterion_tags').notNull().default([]),
    ai_metadata: jsonb('ai_metadata').notNull().default({}),
    ai_confidence: varchar('ai_confidence', { length: 8 }),
    ocr_text: text('ocr_text'),
    page_count: integer('page_count'),
    status: documentStatusEnum('status').notNull().default('uploading'),
    virus_scanned_at: timestamp('virus_scanned_at', { withTimezone: true }),
    classified_at: timestamp('classified_at', { withTimezone: true }),
    created_at: createdAt(),
    updated_at: updatedAt(),
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => ({
    caseIdx: index('documents_case_idx').on(t.case_id),
    tenantIdx: index('documents_tenant_idx').on(t.tenant_id),
  }),
);

// =============================================================================
// assessments — RLS-scoped
// =============================================================================

export const assessments = pgTable(
  'assessments',
  {
    id: id(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    case_id: uuid('case_id')
      .notNull()
      .references(() => cases.id, { onDelete: 'cascade' }),
    layer: assessmentLayerEnum('layer').notNull(),
    case_type_code: varchar('case_type_code', { length: 64 }).notNull(),
    version: integer('version').notNull().default(1),
    doc_set_hash: varchar('doc_set_hash', { length: 64 }),
    overall_score: integer('overall_score'),
    fit_label: varchar('fit_label', { length: 32 }),
    reasoning_trace: jsonb('reasoning_trace').notNull().default([]),
    alternate_paths: jsonb('alternate_paths').notNull().default([]),
    model_version: varchar('model_version', { length: 64 }).notNull().default('stub-v1'),
    generated_at: timestamp('generated_at', { withTimezone: true }).notNull().defaultNow(),
    attorney_approved: boolean('attorney_approved').notNull().default(false),
    approved_by_user_id: uuid('approved_by_user_id').references(() => users.id),
    approved_at: timestamp('approved_at', { withTimezone: true }),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => ({
    caseLayerIdx: index('assessments_case_layer_idx').on(t.case_id, t.layer),
  }),
);

// =============================================================================
// criteria_scores — RLS-scoped
// =============================================================================

export const criteriaScores = pgTable(
  'criteria_scores',
  {
    id: id(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    assessment_id: uuid('assessment_id')
      .notNull()
      .references(() => assessments.id, { onDelete: 'cascade' }),
    case_id: uuid('case_id')
      .notNull()
      .references(() => cases.id, { onDelete: 'cascade' }),
    criterion_code: varchar('criterion_code', { length: 64 }).notNull(),
    met: boolean('met').notNull(),
    confidence: varchar('confidence', { length: 8 }).notNull(),
    rationale: text('rationale').notNull(),
    evidence_doc_ids: jsonb('evidence_doc_ids').notNull().default([]),
    gaps: jsonb('gaps').notNull().default([]),
    recommendations: jsonb('recommendations').notNull().default([]),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => ({
    assessmentIdx: index('criteria_scores_assessment_idx').on(t.assessment_id),
  }),
);

// =============================================================================
// Type exports
// =============================================================================

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type Candidate = typeof candidates.$inferSelect;
export type NewCandidate = typeof candidates.$inferInsert;
export type Case = typeof cases.$inferSelect;
export type NewCase = typeof cases.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Assessment = typeof assessments.$inferSelect;
export type NewAssessment = typeof assessments.$inferInsert;
export type CriteriaScore = typeof criteriaScores.$inferSelect;
