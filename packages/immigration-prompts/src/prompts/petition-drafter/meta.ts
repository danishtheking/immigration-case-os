import { loadPrompt } from '../../loadPrompt.js';

export const PETITION_DRAFTER_PROMPT = loadPrompt(import.meta.url);

export const petitionDrafterMeta = {
  name: 'petition-drafter',
  description:
    'Draft immigration petition letters for O-1A, O-1B, EB-1A, EB-1B, EB-2 NIW, and other visa categories. Generates structured petition letters with proper legal arguments, evidence organization, and USCIS-compliant formatting.',
  tags: [
    'immigration',
    'petition',
    'uscis',
    'eb1',
    'o1',
    'drafting',
    'legal-writing',
  ] as const,
  inputTypes: ['client-profile', 'case-assessment', 'supporting-evidence'] as const,
  outputTypes: ['petition-document'] as const,
  consumedInSprint: 10,
} as const;
