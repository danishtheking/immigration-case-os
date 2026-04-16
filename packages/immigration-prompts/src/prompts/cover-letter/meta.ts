import { loadPrompt } from '../../loadPrompt.js';

export const COVER_LETTER_PROMPT = loadPrompt(import.meta.url);

export const coverLetterMeta = {
  name: 'cover-letter',
  description:
    'Generate USCIS cover letters and transmittal letters for immigration filings. Creates properly formatted cover letters with receipt tracking, document indexing, and filing instructions.',
  tags: ['immigration', 'cover-letter', 'filing', 'uscis', 'transmittal'] as const,
  inputTypes: ['petition-document', 'forms-checklist'] as const,
  outputTypes: ['cover-letter-document'] as const,
  consumedInSprint: 10,
} as const;
