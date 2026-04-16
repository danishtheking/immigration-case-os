# Data Model

> The complete database schema for Immigration Case OS. Every business table has `tenant_id` and an RLS policy. Schema is Drizzle ORM (TypeScript). RLS policies are SQL applied as a migration alongside the schema.
>
> This doc is the source of truth — `packages/db/src/schema.ts` should match it line-for-line.

---

## Table of contents

1. [Conventions](#1-conventions)
2. [Core / tenancy](#2-core--tenancy)
3. [Case management](#3-case-management)
4. [Documents and evidence](#4-documents-and-evidence)
5. [Forms engine](#5-forms-engine)
6. [Deadlines and agency notices](#6-deadlines-and-agency-notices)
7. [AI assessment](#7-ai-assessment)
8. [Intake (PAQ)](#8-intake-paq)
9. [Support letters and drafting](#9-support-letters-and-drafting)
10. [Legal research RAG](#10-legal-research-rag)
11. [Opportunity bank](#11-opportunity-bank)
12. [Contracts and e-signature](#12-contracts-and-e-signature)
13. [Billing and trust ledger](#13-billing-and-trust-ledger)
14. [Communications](#14-communications)
15. [Agent (Brenda)](#15-agent-brenda)
16. [Audit and compliance](#16-audit-and-compliance)
17. [Reference data](#17-reference-data)
18. [RLS policies (template)](#18-rls-policies-template)
19. [Audit triggers](#19-audit-triggers)
20. [Indexing strategy](#20-indexing-strategy)

---

## 1. Conventions

- **All IDs are `uuid` (v7)** — sortable, no leakage of insert order beyond ms.
- **Timestamps**: `created_at`, `updated_at` (`timestamptz` not null default `now()`).
- **Soft delete**: `deleted_at timestamptz` on tables that support it. Hard delete only via right-to-erasure flow.
- **Currency**: `numeric(15, 2)` for money, with a separate `currency char(3)` column. Never `float`.
- **JSONB**: when the shape varies per case type (e.g. `forms_filled.fields_json`). Always validated by Zod at the API layer.
- **Naming**: `snake_case` columns, `plural_snake_case` tables.
- **Foreign keys**: explicit `ON DELETE` rules. Default to `RESTRICT` for case data, `CASCADE` for derived data (audit rows, file versions).
- **Tenant column**: `tenant_id uuid not null references tenants(id)` on EVERY business table. The CI cross-tenant test would fail without it.

```typescript
// packages/db/src/schema.ts -- helpers used throughout
import { uuid, timestamp, varchar, text, boolean, integer, numeric, jsonb, pgTable, index, unique, foreignKey, pgEnum } from 'drizzle-orm/pg-core';

const id = () => uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID());
const timestamps = () => ({
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
const tenantId = () => uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'restrict' });
```

---

## 2. Core / tenancy

### `tenants`
The firms.

```typescript
export const tenants = pgTable('tenants', {
  id: id(),
  slug: varchar('slug', { length: 64 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  clerk_org_id: varchar('clerk_org_id', { length: 255 }).notNull().unique(),
  custom_domain: varchar('custom_domain', { length: 255 }),
  branding: jsonb('branding').notNull().default({}),  // { logo_url, primary_color, agent_persona }
  plan: varchar('plan', { length: 32 }).notNull().default('starter'),
  region: varchar('region', { length: 16 }).notNull().default('us-east-1'),
  kms_data_key_arn: varchar('kms_data_key_arn', { length: 512 }),
  brenda_enabled: boolean('brenda_enabled').notNull().default(true),
  brenda_config: jsonb('brenda_config').notNull().default({}),  // policy gates per action type
  case_types_enabled: jsonb('case_types_enabled').notNull().default([]),
  data_retention_days: integer('data_retention_days').notNull().default(2555),  // 7 years
  ...timestamps(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
});
```

### `users`
Mirrored from Clerk via webhook.

```typescript
export const userRole = pgEnum('user_role', [
  'firm_admin', 'attorney', 'case_manager', 'paralegal', 'candidate', 'recommender', 'observer',
]);

export const users = pgTable('users', {
  id: id(),
  tenant_id: tenantId(),
  clerk_user_id: varchar('clerk_user_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 320 }).notNull(),
  first_name: varchar('first_name', { length: 128 }),
  last_name: varchar('last_name', { length: 128 }),
  role: userRole('role').notNull(),
  phone: varchar('phone', { length: 32 }),
  preferred_language: varchar('preferred_language', { length: 8 }).notNull().default('en'),
  last_login_at: timestamp('last_login_at', { withTimezone: true }),
  ...timestamps(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
}, (t) => ({
  emailIdx: unique().on(t.tenant_id, t.email),
}));
```

---

## 3. Case management

### `case_type_definitions`
A snapshot/version of each case type loaded from `packages/case-types`.

```typescript
export const caseCategory = pgEnum('case_category', [
  'family', 'employment', 'nonimmigrant', 'humanitarian', 'naturalization',
  'removal_defense', 'corporate_compliance', 'other',
]);

export const caseTypeDefinitions = pgTable('case_type_definitions', {
  id: id(),
  code: varchar('code', { length: 64 }).notNull(),  // e.g. "EB1A", "I130_SPOUSE"
  version: integer('version').notNull(),
  category: caseCategory('category').notNull(),
  display_name: varchar('display_name', { length: 255 }).notNull(),
  definition: jsonb('definition').notNull(),  // full CaseTypeDefinition object
  is_current: boolean('is_current').notNull().default(true),
  ...timestamps(),
}, (t) => ({
  codeVersionIdx: unique().on(t.code, t.version),
}));
```

Note: `case_type_definitions` is NOT tenant-scoped — they're global definitions. Per-tenant enable/disable is on `tenants.case_types_enabled`.

### `candidates`
The people. Distinct from `users` because not every candidate logs in.

```typescript
export const candidates = pgTable('candidates', {
  id: id(),
  tenant_id: tenantId(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),  // null until they create a portal account
  first_name: varchar('first_name', { length: 128 }).notNull(),
  last_name: varchar('last_name', { length: 128 }).notNull(),
  email: varchar('email', { length: 320 }),
  phone: varchar('phone', { length: 32 }),
  country_of_birth: varchar('country_of_birth', { length: 2 }),
  country_of_citizenship: varchar('country_of_citizenship', { length: 2 }),
  date_of_birth: timestamp('date_of_birth', { withTimezone: false }),
  a_number: varchar('a_number', { length: 16 }),  // alien registration number
  source: varchar('source', { length: 64 }),  // 'intake_link', 'referral', 'manual', etc.
  current_visa_focus: jsonb('current_visa_focus').notNull().default([]),  // array of case_type_codes
  status: varchar('status', { length: 32 }).notNull().default('lead'),
  owner_user_id: uuid('owner_user_id').references(() => users.id),  // case manager
  preferred_language: varchar('preferred_language', { length: 8 }).notNull().default('en'),
  ...timestamps(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
}, (t) => ({
  tenantIdx: index().on(t.tenant_id),
  ownerIdx: index().on(t.owner_user_id),
}));
```

### `cases`
The unit of work.

```typescript
export const caseStage = pgEnum('case_stage', [
  'lead', 'consultation', 'engaged', 'intake', 'preparation',
  'attorney_review', 'filed', 'in_adjudication', 'rfe_noid', 'decision',
  'post_decision', 'closed',
]);

export const cases = pgTable('cases', {
  id: id(),
  tenant_id: tenantId(),
  case_number: varchar('case_number', { length: 64 }).notNull(),  // human-friendly, e.g. "NIW-2026-0317"
  candidate_id: uuid('candidate_id').notNull().references(() => candidates.id, { onDelete: 'restrict' }),
  case_type_code: varchar('case_type_code', { length: 64 }).notNull(),
  case_type_snapshot: jsonb('case_type_snapshot').notNull(),  // frozen at case creation; insulates from upstream changes
  stage: caseStage('stage').notNull().default('lead'),
  attorney_user_id: uuid('attorney_user_id').references(() => users.id),
  case_manager_user_id: uuid('case_manager_user_id').references(() => users.id),
  priority_date: timestamp('priority_date', { withTimezone: false }),
  receipt_number: varchar('receipt_number', { length: 32 }),
  filing_venue: varchar('filing_venue', { length: 16 }),
  filing_date: timestamp('filing_date', { withTimezone: true }),
  decision_date: timestamp('decision_date', { withTimezone: true }),
  decision_status: varchar('decision_status', { length: 32 }),
  legal_hold: boolean('legal_hold').notNull().default(false),
  closed_at: timestamp('closed_at', { withTimezone: true }),
  ...timestamps(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
}, (t) => ({
  caseNumberIdx: unique().on(t.tenant_id, t.case_number),
  candidateIdx: index().on(t.candidate_id),
  attorneyIdx: index().on(t.attorney_user_id),
  stageIdx: index().on(t.tenant_id, t.stage),
  receiptIdx: index().on(t.receipt_number),
}));
```

### `case_beneficiaries`
For multi-party petitions (employer petitioner + employee beneficiary, principal + derivatives).

```typescript
export const beneficiaryRole = pgEnum('beneficiary_role', [
  'principal', 'spouse', 'child', 'parent', 'sibling', 'employer_petitioner', 'attorney_of_record', 'other',
]);

export const caseBeneficiaries = pgTable('case_beneficiaries', {
  id: id(),
  tenant_id: tenantId(),
  case_id: uuid('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  candidate_id: uuid('candidate_id').references(() => candidates.id),
  organization_name: varchar('organization_name', { length: 255 }),  // for petitioning employer
  role: beneficiaryRole('role').notNull(),
  is_primary: boolean('is_primary').notNull().default(false),
  details: jsonb('details').notNull().default({}),
  ...timestamps(),
});
```

---

## 4. Documents and evidence

### `documents`

```typescript
export const documents = pgTable('documents', {
  id: id(),
  tenant_id: tenantId(),
  case_id: uuid('case_id').references(() => cases.id, { onDelete: 'restrict' }),
  candidate_id: uuid('candidate_id').references(() => candidates.id),
  uploaded_by_user_id: uuid('uploaded_by_user_id').references(() => users.id),
  filename: varchar('filename', { length: 512 }).notNull(),
  mime_type: varchar('mime_type', { length: 128 }).notNull(),
  size_bytes: integer('size_bytes').notNull(),
  r2_key: varchar('r2_key', { length: 1024 }).notNull(),  // tenants/{tid}/documents/{id}.enc
  encryption_data_key: text('encryption_data_key').notNull(),  // wrapped DEK base64
  category: varchar('category', { length: 64 }),  // ai-classified high-level
  criterion_tags: jsonb('criterion_tags').notNull().default([]),  // ['eb1a_authorship', 'eb1a_citations']
  ai_metadata: jsonb('ai_metadata').notNull().default({}),  // { publication_name, year, citations, ... }
  ai_confidence: numeric('ai_confidence', { precision: 4, scale: 3 }),
  ocr_text: text('ocr_text'),
  ocr_text_tsv: text('ocr_text_tsv'),  // generated tsvector for fts
  page_count: integer('page_count'),
  virus_scanned_at: timestamp('virus_scanned_at', { withTimezone: true }),
  ocr_completed_at: timestamp('ocr_completed_at', { withTimezone: true }),
  classified_at: timestamp('classified_at', { withTimezone: true }),
  attorney_confirmed: boolean('attorney_confirmed').notNull().default(false),
  ...timestamps(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
}, (t) => ({
  caseIdx: index().on(t.case_id),
  ftsIdx: index('documents_ocr_fts').using('gin', sql`to_tsvector('english', ${t.ocr_text})`),
}));
```

### `document_versions`
For supersession (old draft -> new draft) and the original-vs-translated split.

```typescript
export const documentVersions = pgTable('document_versions', {
  id: id(),
  tenant_id: tenantId(),
  document_id: uuid('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  version_number: integer('version_number').notNull(),
  r2_key: varchar('r2_key', { length: 1024 }).notNull(),
  encryption_data_key: text('encryption_data_key').notNull(),
  notes: text('notes'),
  ...timestamps(),
});
```

### `exhibits`
Drag-orderable, tabbed exhibit packages.

```typescript
export const exhibits = pgTable('exhibits', {
  id: id(),
  tenant_id: tenantId(),
  case_id: uuid('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  exhibit_letter: varchar('exhibit_letter', { length: 8 }).notNull(),  // 'A', 'B', 'C-1', etc.
  title: varchar('title', { length: 512 }).notNull(),
  description: text('description'),
  document_id: uuid('document_id').notNull().references(() => documents.id),
  bates_start: integer('bates_start'),
  bates_end: integer('bates_end'),
  sort_order: integer('sort_order').notNull(),
  ...timestamps(),
}, (t) => ({
  caseOrderIdx: unique().on(t.case_id, t.sort_order),
}));
```

### `evidence_checklist_items`
Per-case, derived from the case type definition + manually editable.

```typescript
export const evidenceChecklistItems = pgTable('evidence_checklist_items', {
  id: id(),
  tenant_id: tenantId(),
  case_id: uuid('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  item_code: varchar('item_code', { length: 64 }).notNull(),
  label: varchar('label', { length: 512 }).notNull(),
  required: boolean('required').notNull().default(true),
  fulfilled: boolean('fulfilled').notNull().default(false),
  fulfilled_by_document_id: uuid('fulfilled_by_document_id').references(() => documents.id),
  fulfilled_at: timestamp('fulfilled_at', { withTimezone: true }),
  notes: text('notes'),
  sort_order: integer('sort_order').notNull(),
  ...timestamps(),
});
```

---

## 5. Forms engine

### `forms_library`
Master list of supported USCIS / DOL / EOIR / DOS forms. Global, not tenant-scoped.

```typescript
export const formsLibrary = pgTable('forms_library', {
  id: id(),
  form_code: varchar('form_code', { length: 32 }).notNull(),  // 'I-140', 'G-28', 'N-400'
  edition_date: varchar('edition_date', { length: 16 }).notNull(),  // '04/01/2026'
  agency: varchar('agency', { length: 16 }).notNull(),  // 'USCIS' | 'DOL' | 'EOIR' | 'DOS'
  template_r2_key: varchar('template_r2_key', { length: 1024 }).notNull(),
  field_map_yaml: text('field_map_yaml').notNull(),
  validation_rules_zod: text('validation_rules_zod').notNull(),
  notes: text('notes'),
  is_current: boolean('is_current').notNull().default(true),
  ...timestamps(),
}, (t) => ({
  formEditionIdx: unique().on(t.form_code, t.edition_date),
}));
```

### `forms_filled`

```typescript
export const formStatus = pgEnum('form_status', [
  'draft', 'filled', 'validated', 'attorney_approved', 'rendered', 'filed', 'superseded',
]);

export const formsFilled = pgTable('forms_filled', {
  id: id(),
  tenant_id: tenantId(),
  case_id: uuid('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  forms_library_id: uuid('forms_library_id').notNull().references(() => formsLibrary.id),
  form_code: varchar('form_code', { length: 32 }).notNull(),
  edition_date: varchar('edition_date', { length: 16 }).notNull(),
  fields_json: jsonb('fields_json').notNull().default({}),
  validation_errors: jsonb('validation_errors').notNull().default([]),
  rendered_pdf_r2_key: varchar('rendered_pdf_r2_key', { length: 1024 }),
  rendered_at: timestamp('rendered_at', { withTimezone: true }),
  status: formStatus('status').notNull().default('draft'),
  approved_by_user_id: uuid('approved_by_user_id').references(() => users.id),
  approved_at: timestamp('approved_at', { withTimezone: true }),
  ...timestamps(),
}, (t) => ({
  caseFormIdx: index().on(t.case_id, t.form_code),
}));
```

### `filing_packets`

```typescript
export const filingPackets = pgTable('filing_packets', {
  id: id(),
  tenant_id: tenantId(),
  case_id: uuid('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  manifest_jsonb: jsonb('manifest_jsonb').notNull(),  // ordered list of forms + exhibits + cover
  combined_pdf_r2_key: varchar('combined_pdf_r2_key', { length: 1024 }),
  filing_fees: jsonb('filing_fees').notNull().default([]),
  shipping_label_r2_key: varchar('shipping_label_r2_key', { length: 1024 }),
  filed_at: timestamp('filed_at', { withTimezone: true }),
  receipt_number: varchar('receipt_number', { length: 32 }),
  ...timestamps(),
});
```

---

## 6. Deadlines and agency notices

### `deadlines`

```typescript
export const deadlineKind = pgEnum('deadline_kind', [
  'rfe_response', 'noid_response', 'noir_response', 'i751_window',
  'naturalization_early_file', 'priority_date_current', 'h1b_amendment',
  'stem_opt_extension', 'eoir_master', 'eoir_individual', 'mtr_30_day',
  'bia_appeal', 'circuit_appeal', 'lca_posting', 'one_year_asylum_bar',
  'biometrics', 'interview', 'oath', 'visa_bulletin_watch', 'custom',
]);

export const deadlineStatus = pgEnum('deadline_status', [
  'open', 'in_progress', 'met', 'missed', 'cancelled',
]);

export const deadlines = pgTable('deadlines', {
  id: id(),
  tenant_id: tenantId(),
  case_id: uuid('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  kind: deadlineKind('kind').notNull(),
  title: varchar('title', { length: 512 }).notNull(),
  due_at: timestamp('due_at', { withTimezone: true }).notNull(),
  source: varchar('source', { length: 64 }),  // 'agency_notice', 'rule_engine', 'manual'
  source_notice_id: uuid('source_notice_id').references(() => agencyNotices.id),
  status: deadlineStatus('status').notNull().default('open'),
  owner_user_id: uuid('owner_user_id').references(() => users.id),
  escalated_at: timestamp('escalated_at', { withTimezone: true }),
  completed_at: timestamp('completed_at', { withTimezone: true }),
  ...timestamps(),
}, (t) => ({
  dueIdx: index().on(t.tenant_id, t.due_at),
  caseIdx: index().on(t.case_id),
  statusIdx: index().on(t.tenant_id, t.status),
}));
```

### `agency_notices`
Parsed RFE/NOID/NOIR/approval notices.

```typescript
export const noticeKind = pgEnum('notice_kind', [
  'rfe', 'noid', 'noir', 'approval', 'denial', 'request_for_initial_evidence',
  'biometrics_appointment', 'interview_notice', 'fee_receipt', 'other',
]);

export const agencyNotices = pgTable('agency_notices', {
  id: id(),
  tenant_id: tenantId(),
  case_id: uuid('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  document_id: uuid('document_id').references(() => documents.id),
  kind: noticeKind('kind').notNull(),
  notice_date: timestamp('notice_date', { withTimezone: false }),
  response_due_date: timestamp('response_due_date', { withTimezone: false }),
  issues_extracted: jsonb('issues_extracted').notNull().default([]),
  raw_text: text('raw_text'),
  parsed_by_model: varchar('parsed_by_model', { length: 64 }),
  parsed_at: timestamp('parsed_at', { withTimezone: true }),
  ...timestamps(),
});
```

---

## 7. AI assessment

### `assessments`

```typescript
export const assessmentLayer = pgEnum('assessment_layer', [
  'ai', 'professional', 'roadmap',
]);

export const assessments = pgTable('assessments', {
  id: id(),
  tenant_id: tenantId(),
  case_id: uuid('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  layer: assessmentLayer('layer').notNull(),
  case_type_code: varchar('case_type_code', { length: 64 }).notNull(),
  version: integer('version').notNull(),
  doc_set_hash: varchar('doc_set_hash', { length: 64 }).notNull(),
  overall_score: integer('overall_score'),  // 0-100
  fit_label: varchar('fit_label', { length: 32 }),  // 'strong', 'marginal', 'weak'
  reasoning_trace: jsonb('reasoning_trace').notNull().default([]),
  alternate_paths: jsonb('alternate_paths').notNull().default([]),  // [{case_type, score, label}]
  model_version: varchar('model_version', { length: 64 }).notNull(),
  generated_at: timestamp('generated_at', { withTimezone: true }).notNull().defaultNow(),
  attorney_approved: boolean('attorney_approved').notNull().default(false),
  attorney_approved_by: uuid('attorney_approved_by').references(() => users.id),
  attorney_approved_at: timestamp('attorney_approved_at', { withTimezone: true }),
  ...timestamps(),
}, (t) => ({
  caseLayerIdx: index().on(t.case_id, t.layer),
  cacheIdx: unique().on(t.case_id, t.layer, t.doc_set_hash, t.model_version),
}));
```

### `criteria_scores`
Per-criterion scoring within an assessment.

```typescript
export const criteriaScores = pgTable('criteria_scores', {
  id: id(),
  tenant_id: tenantId(),
  assessment_id: uuid('assessment_id').notNull().references(() => assessments.id, { onDelete: 'cascade' }),
  case_id: uuid('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  criterion_code: varchar('criterion_code', { length: 64 }).notNull(),  // 'eb1a_authorship', 'dhanasar_prong_3'
  met: boolean('met').notNull(),
  confidence: numeric('confidence', { precision: 4, scale: 3 }).notNull(),
  rationale: text('rationale').notNull(),
  evidence_doc_ids: jsonb('evidence_doc_ids').notNull().default([]),  // uuids of documents
  gaps: jsonb('gaps').notNull().default([]),
  recommendations: jsonb('recommendations').notNull().default([]),
  ...timestamps(),
}, (t) => ({
  assessmentIdx: index().on(t.assessment_id),
}));
```

---

## 8. Intake (PAQ)

### `paq_forms`
Generated questionnaires.

```typescript
export const paqForms = pgTable('paq_forms', {
  id: id(),
  tenant_id: tenantId(),
  case_id: uuid('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  case_type_code: varchar('case_type_code', { length: 64 }).notNull(),
  schema_jsonb: jsonb('schema_jsonb').notNull(),  // dynamic form schema (questions + conditional logic)
  prefill_jsonb: jsonb('prefill_jsonb').notNull().default({}),  // AI-prefilled answers w/ source citations
  language: varchar('language', { length: 8 }).notNull().default('en'),
  completion_pct: integer('completion_pct').notNull().default(0),
  generated_by_model: varchar('generated_by_model', { length: 64 }),
  ...timestamps(),
});
```

### `paq_responses`

```typescript
export const paqResponses = pgTable('paq_responses', {
  id: id(),
  tenant_id: tenantId(),
  paq_form_id: uuid('paq_form_id').notNull().references(() => paqForms.id, { onDelete: 'cascade' }),
  candidate_id: uuid('candidate_id').notNull().references(() => candidates.id),
  answers_jsonb: jsonb('answers_jsonb').notNull().default({}),
  attachments_jsonb: jsonb('attachments_jsonb').notNull().default([]),
  saved_at: timestamp('saved_at', { withTimezone: true }).notNull().defaultNow(),
  submitted_at: timestamp('submitted_at', { withTimezone: true }),
  ...timestamps(),
});
```

---

## 9. Support letters and drafting

### `recommenders`

```typescript
export const recommenders = pgTable('recommenders', {
  id: id(),
  tenant_id: tenantId(),
  case_id: uuid('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  full_name: varchar('full_name', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }),
  affiliation: varchar('affiliation', { length: 255 }),
  email: varchar('email', { length: 320 }),
  relationship_to_candidate: text('relationship_to_candidate'),
  source: varchar('source', { length: 64 }),  // 'openalex', 'linkedin', 'manual'
  ai_match_score: numeric('ai_match_score', { precision: 4, scale: 3 }),
  status: varchar('status', { length: 32 }).notNull().default('suggested'),
  ...timestamps(),
});
```

### `support_letters`

```typescript
export const supportLetterStatus = pgEnum('support_letter_status', [
  'drafting', 'draft_ready', 'sent_to_recommender', 'returned', 'finalized', 'attorney_approved',
]);

export const supportLetters = pgTable('support_letters', {
  id: id(),
  tenant_id: tenantId(),
  case_id: uuid('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  recommender_id: uuid('recommender_id').notNull().references(() => recommenders.id),
  criterion_code: varchar('criterion_code', { length: 64 }).notNull(),
  draft_docx_r2_key: varchar('draft_docx_r2_key', { length: 1024 }),
  final_docx_r2_key: varchar('final_docx_r2_key', { length: 1024 }),
  prompt_used: text('prompt_used'),
  model_version: varchar('model_version', { length: 64 }),
  version: integer('version').notNull().default(1),
  status: supportLetterStatus('status').notNull().default('drafting'),
  requires_attorney_approval: boolean('requires_attorney_approval').notNull().default(true),
  approved_by_user_id: uuid('approved_by_user_id').references(() => users.id),
  approved_at: timestamp('approved_at', { withTimezone: true }),
  ...timestamps(),
});
```

### `drafted_artifacts`
Generic table for AI-drafted documents (cover briefs, RFE responses, declarations, personal statements).

```typescript
export const draftedArtifactKind = pgEnum('drafted_artifact_kind', [
  'cover_brief', 'rfe_response', 'noid_response', 'declaration',
  'personal_statement', 'support_letter', 'g28_addendum', 'memo',
]);

export const draftedArtifacts = pgTable('drafted_artifacts', {
  id: id(),
  tenant_id: tenantId(),
  case_id: uuid('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  kind: draftedArtifactKind('kind').notNull(),
  title: varchar('title', { length: 512 }).notNull(),
  body_md: text('body_md'),
  docx_r2_key: varchar('docx_r2_key', { length: 1024 }),
  pdf_r2_key: varchar('pdf_r2_key', { length: 1024 }),
  prompt_used: text('prompt_used'),
  context_doc_ids: jsonb('context_doc_ids').notNull().default([]),
  citations: jsonb('citations').notNull().default([]),
  model_version: varchar('model_version', { length: 64 }),
  requires_attorney_approval: boolean('requires_attorney_approval').notNull().default(true),
  approved_by_user_id: uuid('approved_by_user_id').references(() => users.id),
  approved_at: timestamp('approved_at', { withTimezone: true }),
  ...timestamps(),
});
```

---

## 10. Legal research RAG

### `legal_sources`
Provenance for the legal corpus. Global, not tenant-scoped.

```typescript
export const legalSources = pgTable('legal_sources', {
  id: id(),
  source_type: varchar('source_type', { length: 32 }).notNull(),  // 'uscis_pm', 'aao_decision', 'cfr', 'precedent_decision', 'federal_register', 'eoir_decision'
  source_url: varchar('source_url', { length: 2048 }).notNull(),
  title: varchar('title', { length: 1024 }).notNull(),
  citation: varchar('citation', { length: 512 }),  // bluebook-ish
  jurisdiction: varchar('jurisdiction', { length: 64 }),
  decided_at: timestamp('decided_at', { withTimezone: false }),
  retrieved_at: timestamp('retrieved_at', { withTimezone: true }).notNull().defaultNow(),
  last_modified: timestamp('last_modified', { withTimezone: false }),
  metadata: jsonb('metadata').notNull().default({}),
  ...timestamps(),
}, (t) => ({
  urlIdx: unique().on(t.source_url),
}));
```

### `legal_chunks`
Embedded chunks for retrieval. Global.

```typescript
import { vector } from 'pgvector/drizzle-orm';

export const legalChunks = pgTable('legal_chunks', {
  id: id(),
  source_id: uuid('source_id').notNull().references(() => legalSources.id, { onDelete: 'cascade' }),
  chunk_index: integer('chunk_index').notNull(),
  text: text('text').notNull(),
  embedding: vector('embedding', { dimensions: 3072 }).notNull(),  // text-embedding-3-large
  metadata: jsonb('metadata').notNull().default({}),
  ...timestamps(),
}, (t) => ({
  sourceChunkIdx: unique().on(t.source_id, t.chunk_index),
  embeddingIdx: index('legal_chunks_embedding_hnsw').using('hnsw', t.embedding.op('vector_cosine_ops')),
}));
```

### `legal_research_memos`

```typescript
export const legalResearchMemos = pgTable('legal_research_memos', {
  id: id(),
  tenant_id: tenantId(),
  case_id: uuid('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  query: text('query').notNull(),
  body_md: text('body_md').notNull(),
  citations: jsonb('citations').notNull(),  // [{source_id, chunk_id, url, citation, retrieved_at}]
  retrieval_threshold: numeric('retrieval_threshold', { precision: 4, scale: 3 }).notNull(),
  no_answer_returned: boolean('no_answer_returned').notNull().default(false),
  generated_at: timestamp('generated_at', { withTimezone: true }).notNull().defaultNow(),
  model_version: varchar('model_version', { length: 64 }).notNull(),
  requires_attorney_approval: boolean('requires_attorney_approval').notNull().default(true),
  approved_by_user_id: uuid('approved_by_user_id').references(() => users.id),
  approved_at: timestamp('approved_at', { withTimezone: true }),
  ...timestamps(),
});
```

---

## 11. Opportunity bank

### `opportunities`
Curated CFPs, awards, judging slots. Global.

```typescript
export const opportunityType = pgEnum('opportunity_type', [
  'cfp', 'award', 'judging', 'speaking', 'membership', 'editorial', 'fellowship', 'other',
]);

export const opportunities = pgTable('opportunities', {
  id: id(),
  source: varchar('source', { length: 64 }).notNull(),  // 'wikicfp', 'sessionize', 'manual', etc.
  source_url: varchar('source_url', { length: 2048 }).notNull(),
  type: opportunityType('type').notNull(),
  title: varchar('title', { length: 512 }).notNull(),
  organization: varchar('organization', { length: 512 }),
  description: text('description'),
  domain_tags: jsonb('domain_tags').notNull().default([]),
  career_stage_tags: jsonb('career_stage_tags').notNull().default([]),
  geography: varchar('geography', { length: 64 }),
  remote_ok: boolean('remote_ok'),
  deadline: timestamp('deadline', { withTimezone: false }),
  embedding: vector('embedding', { dimensions: 3072 }),
  active: boolean('active').notNull().default(true),
  last_seen_at: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
  ...timestamps(),
}, (t) => ({
  urlIdx: unique().on(t.source_url),
  embeddingIdx: index('opportunities_embedding_hnsw').using('hnsw', t.embedding.op('vector_cosine_ops')),
  deadlineIdx: index().on(t.deadline),
}));
```

### `opportunity_matches`

```typescript
export const opportunityMatchStatus = pgEnum('opportunity_match_status', [
  'suggested', 'sent_to_portal', 'client_acted', 'client_dismissed', 'criterion_credit_applied',
]);

export const opportunityMatches = pgTable('opportunity_matches', {
  id: id(),
  tenant_id: tenantId(),
  case_id: uuid('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  opportunity_id: uuid('opportunity_id').notNull().references(() => opportunities.id),
  match_score: numeric('match_score', { precision: 4, scale: 3 }).notNull(),
  matched_criteria: jsonb('matched_criteria').notNull().default([]),
  status: opportunityMatchStatus('status').notNull().default('suggested'),
  sent_to_portal_at: timestamp('sent_to_portal_at', { withTimezone: true }),
  client_acted_at: timestamp('client_acted_at', { withTimezone: true }),
  ...timestamps(),
}, (t) => ({
  caseScoreIdx: index().on(t.case_id, t.match_score),
}));
```

---

## 12. Contracts and e-signature

### `contracts`

```typescript
export const contractStatus = pgEnum('contract_status', [
  'draft', 'sent', 'viewed', 'signed', 'declined', 'voided', 'expired',
]);

export const contracts = pgTable('contracts', {
  id: id(),
  tenant_id: tenantId(),
  case_id: uuid('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  candidate_id: uuid('candidate_id').notNull().references(() => candidates.id),
  template_name: varchar('template_name', { length: 255 }),
  provider: varchar('provider', { length: 16 }).notNull(),  // 'docusign' | 'boldsign' | 'internal'
  envelope_id: varchar('envelope_id', { length: 255 }),
  status: contractStatus('status').notNull().default('draft'),
  unsigned_pdf_r2_key: varchar('unsigned_pdf_r2_key', { length: 1024 }),
  signed_pdf_r2_key: varchar('signed_pdf_r2_key', { length: 1024 }),
  sent_at: timestamp('sent_at', { withTimezone: true }),
  signed_at: timestamp('signed_at', { withTimezone: true }),
  ...timestamps(),
});
```

---

## 13. Billing and trust ledger

### `invoices`

```typescript
export const invoiceStatus = pgEnum('invoice_status', [
  'draft', 'sent', 'partially_paid', 'paid', 'overdue', 'void',
]);

export const invoices = pgTable('invoices', {
  id: id(),
  tenant_id: tenantId(),
  case_id: uuid('case_id').references(() => cases.id),
  candidate_id: uuid('candidate_id').notNull().references(() => candidates.id),
  number: varchar('number', { length: 64 }).notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),
  description: text('description'),
  due_at: timestamp('due_at', { withTimezone: true }),
  status: invoiceStatus('status').notNull().default('draft'),
  stripe_invoice_id: varchar('stripe_invoice_id', { length: 255 }),
  airwallex_invoice_id: varchar('airwallex_invoice_id', { length: 255 }),
  ...timestamps(),
}, (t) => ({
  numberIdx: unique().on(t.tenant_id, t.number),
}));
```

### `payments`

```typescript
export const payments = pgTable('payments', {
  id: id(),
  tenant_id: tenantId(),
  invoice_id: uuid('invoice_id').references(() => invoices.id),
  candidate_id: uuid('candidate_id').notNull().references(() => candidates.id),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),
  amount_usd_normalized: numeric('amount_usd_normalized', { precision: 15, scale: 2 }),
  fx_rate: numeric('fx_rate', { precision: 12, scale: 6 }),
  provider: varchar('provider', { length: 16 }).notNull(),
  provider_payment_id: varchar('provider_payment_id', { length: 255 }),
  paid_at: timestamp('paid_at', { withTimezone: true }).notNull(),
  ...timestamps(),
});
```

### `trust_ledger`
A per-client running balance. NOT IOLTA-compliant by itself — see ADR-0013.

```typescript
export const trustLedger = pgTable('trust_ledger', {
  id: id(),
  tenant_id: tenantId(),
  candidate_id: uuid('candidate_id').notNull().references(() => candidates.id),
  case_id: uuid('case_id').references(() => cases.id),
  balance: numeric('balance', { precision: 15, scale: 2 }).notNull().default('0'),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  last_reconciled_at: timestamp('last_reconciled_at', { withTimezone: true }),
  ...timestamps(),
}, (t) => ({
  candidateUq: unique().on(t.tenant_id, t.candidate_id, t.currency),
}));
```

### `trust_transactions`

```typescript
export const trustTransactionKind = pgEnum('trust_transaction_kind', [
  'deposit', 'invoice_application', 'refund', 'fee_payment', 'transfer', 'adjustment',
]);

export const trustTransactions = pgTable('trust_transactions', {
  id: id(),
  tenant_id: tenantId(),
  trust_ledger_id: uuid('trust_ledger_id').notNull().references(() => trustLedger.id, { onDelete: 'restrict' }),
  invoice_id: uuid('invoice_id').references(() => invoices.id),
  payment_id: uuid('payment_id').references(() => payments.id),
  kind: trustTransactionKind('kind').notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  running_balance: numeric('running_balance', { precision: 15, scale: 2 }).notNull(),
  description: text('description'),
  created_by_user_id: uuid('created_by_user_id').references(() => users.id),
  ...timestamps(),
});
```

---

## 14. Communications

### `messages`
Threads between firm and clients.

```typescript
export const messageChannel = pgEnum('message_channel', [
  'in_app', 'email', 'sms', 'whatsapp',
]);

export const messages = pgTable('messages', {
  id: id(),
  tenant_id: tenantId(),
  thread_id: uuid('thread_id').notNull(),
  case_id: uuid('case_id').references(() => cases.id),
  candidate_id: uuid('candidate_id').references(() => candidates.id),
  from_user_id: uuid('from_user_id').references(() => users.id),
  to_user_id: uuid('to_user_id').references(() => users.id),
  channel: messageChannel('channel').notNull(),
  subject: varchar('subject', { length: 512 }),
  body: text('body').notNull(),
  attachments: jsonb('attachments').notNull().default([]),
  external_message_id: varchar('external_message_id', { length: 512 }),
  is_inbound: boolean('is_inbound').notNull(),
  read_at: timestamp('read_at', { withTimezone: true }),
  sent_at: timestamp('sent_at', { withTimezone: true }).notNull().defaultNow(),
  ...timestamps(),
}, (t) => ({
  threadIdx: index().on(t.thread_id),
  caseIdx: index().on(t.case_id),
}));
```

### `meetings`

```typescript
export const meetings = pgTable('meetings', {
  id: id(),
  tenant_id: tenantId(),
  case_id: uuid('case_id').references(() => cases.id),
  candidate_id: uuid('candidate_id').references(() => candidates.id),
  organizer_user_id: uuid('organizer_user_id').notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  starts_at: timestamp('starts_at', { withTimezone: true }).notNull(),
  ends_at: timestamp('ends_at', { withTimezone: true }).notNull(),
  location: varchar('location', { length: 512 }),
  conference_url: varchar('conference_url', { length: 1024 }),
  external_calendar_event_id: varchar('external_calendar_event_id', { length: 512 }),
  notes: text('notes'),
  ...timestamps(),
});
```

---

## 15. Agent (Brenda)

### `agent_actions`
Every Brenda tool call, logged BEFORE execution.

```typescript
export const agentActionStatus = pgEnum('agent_action_status', [
  'queued', 'pending_approval', 'approved', 'rejected', 'executed', 'failed', 'cancelled',
]);

export const agentActions = pgTable('agent_actions', {
  id: id(),
  tenant_id: tenantId(),
  agent_name: varchar('agent_name', { length: 64 }).notNull(),  // 'brenda'
  case_id: uuid('case_id').references(() => cases.id),
  candidate_id: uuid('candidate_id').references(() => candidates.id),
  trigger: varchar('trigger', { length: 128 }).notNull(),
  action_type: varchar('action_type', { length: 64 }).notNull(),  // 'draft_email', 'send_sms', 'update_status', ...
  prompt: text('prompt'),
  tool_calls: jsonb('tool_calls').notNull().default([]),
  result: jsonb('result'),
  policy_gate_passed: boolean('policy_gate_passed').notNull(),
  upl_filter_passed: boolean('upl_filter_passed').notNull(),
  confidence: numeric('confidence', { precision: 4, scale: 3 }),
  model_version: varchar('model_version', { length: 64 }),
  requires_approval: boolean('requires_approval').notNull(),
  approved_by_user_id: uuid('approved_by_user_id').references(() => users.id),
  approved_at: timestamp('approved_at', { withTimezone: true }),
  rejected_by_user_id: uuid('rejected_by_user_id').references(() => users.id),
  rejected_reason: text('rejected_reason'),
  status: agentActionStatus('status').notNull().default('queued'),
  executed_at: timestamp('executed_at', { withTimezone: true }),
  ...timestamps(),
}, (t) => ({
  caseIdx: index().on(t.case_id),
  statusIdx: index().on(t.tenant_id, t.status),
}));
```

---

## 16. Audit and compliance

### `audit_logs`
Append-only. Trigger-driven on every business table.

```typescript
export const auditAction = pgEnum('audit_action', [
  'insert', 'update', 'delete', 'access', 'export', 'approve', 'reject', 'send', 'login', 'logout',
]);

export const auditLogs = pgTable('audit_logs', {
  id: id(),
  tenant_id: uuid('tenant_id').notNull(),  // not FK so we never lose history
  actor_user_id: uuid('actor_user_id'),
  actor_kind: varchar('actor_kind', { length: 16 }).notNull(),  // 'user' | 'agent' | 'system' | 'webhook'
  action: auditAction('action').notNull(),
  table_name: varchar('table_name', { length: 64 }).notNull(),
  record_id: uuid('record_id'),
  before_jsonb: jsonb('before_jsonb'),
  after_jsonb: jsonb('after_jsonb'),
  ip: varchar('ip', { length: 64 }),
  user_agent: text('user_agent'),
  request_id: varchar('request_id', { length: 64 }),
  occurred_at: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  tenantTimeIdx: index().on(t.tenant_id, t.occurred_at),
  recordIdx: index().on(t.table_name, t.record_id),
}));
```

### `data_erasure_requests`

```typescript
export const dataErasureRequests = pgTable('data_erasure_requests', {
  id: id(),
  tenant_id: tenantId(),
  candidate_id: uuid('candidate_id').notNull().references(() => candidates.id),
  requested_by_user_id: uuid('requested_by_user_id').references(() => users.id),
  reason: text('reason'),
  legal_hold: boolean('legal_hold').notNull().default(false),
  legal_hold_reason: text('legal_hold_reason'),
  status: varchar('status', { length: 32 }).notNull().default('pending'),
  completed_at: timestamp('completed_at', { withTimezone: true }),
  ...timestamps(),
});
```

---

## 17. Reference data

### `visa_bulletin`
Monthly snapshot from DOS. Global.

```typescript
export const visaBulletin = pgTable('visa_bulletin', {
  id: id(),
  bulletin_month: varchar('bulletin_month', { length: 7 }).notNull(),  // '2026-04'
  category: varchar('category', { length: 16 }).notNull(),  // 'EB-1', 'EB-2', 'F-2A'
  country: varchar('country', { length: 64 }).notNull(),  // 'India', 'China', 'Mexico', 'All Chargeability'
  cutoff_date: timestamp('cutoff_date', { withTimezone: false }),  // null = current
  is_current: boolean('is_current').notNull().default(false),
  ...timestamps(),
}, (t) => ({
  uq: unique().on(t.bulletin_month, t.category, t.country),
}));
```

### `uscis_status_snapshots`

```typescript
export const uscisStatusSnapshots = pgTable('uscis_status_snapshots', {
  id: id(),
  tenant_id: tenantId(),
  case_id: uuid('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  receipt_number: varchar('receipt_number', { length: 32 }).notNull(),
  status_text: text('status_text').notNull(),
  status_date: timestamp('status_date', { withTimezone: false }),
  fetched_at: timestamp('fetched_at', { withTimezone: true }).notNull().defaultNow(),
  ...timestamps(),
}, (t) => ({
  receiptIdx: index().on(t.receipt_number),
}));
```

### `eoir_hearings`

```typescript
export const eoirHearings = pgTable('eoir_hearings', {
  id: id(),
  tenant_id: tenantId(),
  case_id: uuid('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  hearing_type: varchar('hearing_type', { length: 32 }).notNull(),  // 'master', 'individual', 'bond'
  hearing_at: timestamp('hearing_at', { withTimezone: true }).notNull(),
  court_location: varchar('court_location', { length: 255 }),
  judge_name: varchar('judge_name', { length: 255 }),
  outcome: varchar('outcome', { length: 64 }),
  ...timestamps(),
});
```

---

## 18. RLS policies (template)

Applied as a Drizzle migration. Every business table gets the same shape; the master template:

```sql
-- Run once
CREATE ROLE app_tenant NOLOGIN;
CREATE ROLE app_admin NOLOGIN BYPASSRLS;
GRANT app_tenant TO appuser;  -- the connection role used by the API
GRANT app_admin  TO migrationuser;  -- the connection role used by Drizzle Kit only

-- For every business table:
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;
ALTER TABLE {table} FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON {table}
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

GRANT SELECT, INSERT, UPDATE, DELETE ON {table} TO app_tenant;
```

The `current_setting('app.current_tenant', true)` form returns NULL if the setting isn't set. Since `tenant_id = NULL` is FALSE in SQL, the policy fails closed: **no rows visible if the tenant context is missing**.

A migration helper iterates every business table and applies the policy. The list of business tables lives in `packages/db/src/rls-tables.ts`:

```typescript
export const RLS_TABLES = [
  'users', 'candidates', 'cases', 'case_beneficiaries',
  'documents', 'document_versions', 'exhibits', 'evidence_checklist_items',
  'forms_filled', 'filing_packets',
  'deadlines', 'agency_notices',
  'assessments', 'criteria_scores',
  'paq_forms', 'paq_responses',
  'recommenders', 'support_letters', 'drafted_artifacts',
  'legal_research_memos',
  'opportunity_matches',
  'contracts',
  'invoices', 'payments', 'trust_ledger', 'trust_transactions',
  'messages', 'meetings',
  'agent_actions',
  'data_erasure_requests',
  'uscis_status_snapshots', 'eoir_hearings',
] as const;
```

Tables that are explicitly **global** (not tenant-scoped):
`tenants`, `case_type_definitions`, `forms_library`, `legal_sources`, `legal_chunks`, `opportunities`, `visa_bulletin`, `audit_logs`.

---

## 19. Audit triggers

A single Postgres trigger function applied to every tracked table:

```sql
CREATE OR REPLACE FUNCTION write_audit_log() RETURNS TRIGGER AS $$
DECLARE
  v_tenant uuid := current_setting('app.current_tenant', true)::uuid;
  v_actor uuid := current_setting('app.current_actor', true)::uuid;
  v_actor_kind text := COALESCE(current_setting('app.current_actor_kind', true), 'user');
  v_request_id text := current_setting('app.current_request_id', true);
  v_ip text := current_setting('app.current_ip', true);
BEGIN
  INSERT INTO audit_logs(
    tenant_id, actor_user_id, actor_kind, action,
    table_name, record_id, before_jsonb, after_jsonb,
    ip, request_id, occurred_at
  )
  VALUES (
    COALESCE(v_tenant, NEW.tenant_id, OLD.tenant_id),
    v_actor,
    v_actor_kind,
    TG_OP::text::audit_action,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) END,
    v_ip,
    v_request_id,
    now()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to every tracked table:
CREATE TRIGGER {table}_audit
  AFTER INSERT OR UPDATE OR DELETE ON {table}
  FOR EACH ROW EXECUTE FUNCTION write_audit_log();
```

The trigger uses `SECURITY DEFINER` so it can write to `audit_logs` (which has its own RLS policy that only the admin role can write to).

---

## 20. Indexing strategy

Beyond the explicit `index()` calls in the schema:

- **Composite (tenant_id, *)** indexes on every list-view column to keep RLS-scoped queries fast.
- **GIN indexes** on every `jsonb` column that is filtered (e.g. `documents.criterion_tags`).
- **HNSW vector indexes** on `legal_chunks.embedding` and `opportunities.embedding`.
- **Partial indexes** on hot stages (e.g. `WHERE status = 'open'` on `deadlines`).
- **`tsvector` full-text indexes** on `documents.ocr_text`.

Performance budget: 95th percentile case-list query under 50ms with 100k cases per tenant. Re-evaluate at 1M.

---

## What this doc does NOT cover (yet)

- **Sequence diagrams** — see [sequence-diagrams.md](sequence-diagrams.md).
- **API endpoints** — derived from the modules in [architecture.md §4.2](architecture.md). Documented per-module in `docs/features/` as they're built.
- **Drizzle relations** — the `relations()` calls that enable `db.query.cases.findFirst({ with: { documents: true } })`. Derivable from FKs above; will be in the actual `schema.ts`.
- **Seed data** — `scripts/seed/` will populate SwagatUSA + 5 demo cases on request.
