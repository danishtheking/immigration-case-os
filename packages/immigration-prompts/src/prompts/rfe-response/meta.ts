import { loadPrompt } from '../../loadPrompt.js';

export const RFE_RESPONSE_PROMPT = loadPrompt(import.meta.url);

export const rfeResponseMeta = {
  name: 'rfe-response',
  description:
    'Analyze USCIS Request for Evidence (RFE) notices and draft point-by-point responses. Identifies deficiencies cited, suggests additional evidence, and generates persuasive response letters.',
  tags: [
    'immigration',
    'rfe',
    'uscis',
    'response',
    'evidence',
    'legal-writing',
  ] as const,
  inputTypes: ['case-assessment', 'rfe-notice'] as const,
  outputTypes: ['rfe-response-document'] as const,
  consumedInSprint: 10,
} as const;
