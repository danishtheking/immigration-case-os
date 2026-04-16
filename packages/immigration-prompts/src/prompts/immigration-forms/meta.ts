import { loadPrompt } from '../../loadPrompt.js';

export const IMMIGRATION_FORMS_PROMPT = loadPrompt(import.meta.url);

export const immigrationFormsMeta = {
  name: 'immigration-forms',
  description:
    'Comprehensive guide to USCIS immigration forms. Covers filing requirements, fees, supporting documents, and instructions for I-140, I-130, I-485, I-765, I-131, I-129, G-28, and more.',
  tags: ['immigration', 'forms', 'uscis', 'filing', 'fees', 'checklist'] as const,
  inputTypes: ['visa-type'] as const,
  outputTypes: ['forms-checklist', 'filing-instructions'] as const,
  consumedInSprint: 6,
} as const;
