import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * Synchronously load a prompt.md file relative to the calling meta.ts.
 * The prompt files are committed to the package and ship as plain text.
 */
export function loadPrompt(metaUrl: string, file = 'prompt.md'): string {
  const here = dirname(fileURLToPath(metaUrl));
  return readFileSync(join(here, file), 'utf8');
}
