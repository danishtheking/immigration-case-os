import { loadPrompt } from '../../loadPrompt.js';

export const CLIENT_INTAKE_PROMPT = loadPrompt(import.meta.url);

export const clientIntakeMeta = {
  name: 'client-intake',
  description:
    'Conduct structured immigration client intake interviews. Asks relevant questions based on visa type, captures key information, generates intake summary, and identifies required documents.',
  tags: ['immigration', 'intake', 'client', 'onboarding', 'questionnaire'] as const,
  inputTypes: ['raw-inquiry'] as const,
  outputTypes: ['client-profile', 'case-assessment'] as const,
  consumedInSprint: 5,
} as const;
