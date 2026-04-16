/**
 * @ico/immigration-prompts — registry of immigration prompt templates.
 *
 * Six prompts ported from StitchBoat CounselAI (Apache-2.0). See README.md
 * for attribution and the porting strategy.
 *
 * Sprint 1 only exposes metadata. Sprints 4, 5, 6, 10 wire up the consumers.
 */

export {
  caseAnalyzerMeta,
  CASE_ANALYZER_PROMPT,
} from './prompts/case-analyzer/meta.js';
export {
  clientIntakeMeta,
  CLIENT_INTAKE_PROMPT,
} from './prompts/client-intake/meta.js';
export {
  petitionDrafterMeta,
  PETITION_DRAFTER_PROMPT,
} from './prompts/petition-drafter/meta.js';
export {
  rfeResponseMeta,
  RFE_RESPONSE_PROMPT,
} from './prompts/rfe-response/meta.js';
export {
  immigrationFormsMeta,
  IMMIGRATION_FORMS_PROMPT,
} from './prompts/immigration-forms/meta.js';
export {
  coverLetterMeta,
  COVER_LETTER_PROMPT,
} from './prompts/cover-letter/meta.js';

export interface PromptMeta {
  name: string;
  description: string;
  tags: readonly string[];
  inputTypes: readonly string[];
  outputTypes: readonly string[];
  /** The sprint that first consumes this prompt. */
  consumedInSprint: number;
}

import { caseAnalyzerMeta } from './prompts/case-analyzer/meta.js';
import { clientIntakeMeta } from './prompts/client-intake/meta.js';
import { petitionDrafterMeta } from './prompts/petition-drafter/meta.js';
import { rfeResponseMeta } from './prompts/rfe-response/meta.js';
import { immigrationFormsMeta } from './prompts/immigration-forms/meta.js';
import { coverLetterMeta } from './prompts/cover-letter/meta.js';

export const PROMPT_REGISTRY: Record<string, PromptMeta> = {
  'case-analyzer': caseAnalyzerMeta,
  'client-intake': clientIntakeMeta,
  'petition-drafter': petitionDrafterMeta,
  'rfe-response': rfeResponseMeta,
  'immigration-forms': immigrationFormsMeta,
  'cover-letter': coverLetterMeta,
};

export function listPrompts(): PromptMeta[] {
  return Object.values(PROMPT_REGISTRY);
}
