/**
 * The list of tables that must have RLS enabled and tenant_id-based policies.
 * The `apply-rls.sql` migration iterates this list to apply policies uniformly.
 *
 * As new business tables are added in subsequent sprints, append them here.
 * The cross-tenant isolation test reads this list to know what to test.
 */
export const RLS_TABLES = [
  'users',
  'candidates',
  'cases',
  'documents',
  'assessments',
  'criteria_scores',
  // Sprint 3+ adds: 'document_versions', 'exhibits',
  // Sprint 3+ adds: 'documents', 'document_versions', 'exhibits',
  // Sprint 4+ adds: 'assessments', 'criteria_scores',
  // Sprint 5+ adds: 'paq_forms', 'paq_responses',
  // Sprint 6+ adds: 'forms_filled', 'filing_packets',
  // Sprint 7+ adds: 'deadlines', 'agency_notices',
  // Sprint 8+ adds: 'messages', 'meetings',
  // Sprint 9+ adds: 'contracts', 'invoices', 'payments', 'trust_ledger', 'trust_transactions',
  // Sprint 10+ adds: 'support_letters', 'drafted_artifacts',
  // Sprint 11+ adds: 'legal_research_memos',
  // Sprint 12+ adds: 'agent_actions',
  // Sprint 13+ adds: 'opportunity_matches',
] as const;

export type RlsTable = (typeof RLS_TABLES)[number];

/**
 * Tables that are explicitly GLOBAL — not tenant-scoped, no RLS policy.
 * Adding a new table to this list is a security decision; document it in an ADR.
 */
export const GLOBAL_TABLES = [
  'tenants',
  'audit_logs',
  // Sprint 4+ adds: 'case_type_definitions',
  // Sprint 6+ adds: 'forms_library',
  // Sprint 7+ adds: 'visa_bulletin',
  // Sprint 11+ adds: 'legal_sources', 'legal_chunks',
  // Sprint 13+ adds: 'opportunities',
] as const;
