import { loadPrompt } from '../../loadPrompt.js';

export const CASE_ANALYZER_PROMPT = loadPrompt(import.meta.url);

export const caseAnalyzerMeta = {
  name: 'case-analyzer',
  description:
    'Evaluate immigration case strength and eligibility. Analyzes client qualifications against visa requirements, identifies strengths and weaknesses, and recommends the best visa strategy.',
  tags: ['immigration', 'analysis', 'eligibility', 'strategy', 'visa'] as const,
  inputTypes: ['client-profile'] as const,
  outputTypes: ['case-assessment', 'visa-recommendation'] as const,
  consumedInSprint: 4,
} as const;
