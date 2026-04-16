/**
 * Case type registry. Per ADR-0014, every case type is a TypeScript+Zod
 * definition loaded at boot. Adding a new visa type is a code change here,
 * not a database migration.
 *
 * Sprint 1 ships only an EB-1A stub. Sprint 4 fills in the full criterion
 * scoring rubric (seeded from counselai's case-analyzer skill — see
 * docs/counselai-inventory.md §6).
 */

import { z } from 'zod';

export const CaseCategory = z.enum([
  'family',
  'employment',
  'nonimmigrant',
  'humanitarian',
  'naturalization',
  'removal_defense',
  'corporate_compliance',
  'other',
]);
export type CaseCategory = z.infer<typeof CaseCategory>;

export const FormRef = z.object({
  code: z.string(),
  edition: z.string().optional(),
  required: z.boolean().default(true),
});

export const EvidenceItem = z.object({
  id: z.string(),
  label: z.string(),
  required: z.boolean().default(true),
});

export const CaseTypeDefinition = z.object({
  code: z.string(),
  category: CaseCategory,
  display_name: z.string(),
  description: z.string().optional(),
  forms: z.array(FormRef),
  evidence_checklist: z.array(EvidenceItem),
  workflow: z.string(),
  filing_venue: z.enum(['USCIS', 'DOS', 'DOL', 'EOIR', 'BIA', 'CBP']),
  required_roles: z.array(z.string()).default([]),
});

export type CaseTypeDefinition = z.infer<typeof CaseTypeDefinition>;

// ---------- EB-1A (stub — full rubric in Sprint 4) ----------

export const EB1A: CaseTypeDefinition = {
  code: 'EB1A',
  category: 'employment',
  display_name: 'EB-1A — Extraordinary Ability',
  description:
    'Employment-based first preference, extraordinary ability. 8 CFR 204.5(h). Self-petition allowed.',
  forms: [
    { code: 'I-140', required: true },
    { code: 'G-28', required: true },
    { code: 'I-907', required: false },
  ],
  evidence_checklist: [
    { id: 'cv', label: 'Curriculum vitae', required: true },
    { id: 'passport', label: 'Passport biographical page', required: true },
    { id: 'awards', label: 'Awards / prizes evidence', required: false },
    { id: 'memberships', label: 'Memberships in elite associations', required: false },
    { id: 'press', label: 'Published material about beneficiary', required: false },
    { id: 'judging', label: 'Evidence of judging others work', required: false },
    { id: 'contributions', label: 'Original contributions of major significance', required: false },
    { id: 'authorship', label: 'Scholarly authorship', required: false },
    { id: 'critical_role', label: 'Critical or essential capacity', required: false },
    { id: 'salary', label: 'High remuneration', required: false },
  ],
  workflow: 'employment_based_petition_v1',
  filing_venue: 'USCIS',
  required_roles: ['attorney_review_before_filing'],
};

export const REGISTRY: Record<string, CaseTypeDefinition> = {
  EB1A,
};

export function getCaseType(code: string): CaseTypeDefinition | undefined {
  return REGISTRY[code];
}

export function listCaseTypes(): CaseTypeDefinition[] {
  return Object.values(REGISTRY);
}
