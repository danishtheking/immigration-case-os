# @ico/immigration-prompts

Reusable immigration-law prompt templates and structured knowledge.

## Attribution

The six prompt files in `src/prompts/` were originally authored for **StitchBoat CounselAI** (https://github.com/danishtheking/stitchboat-counselai), released under the Apache License 2.0. They are reused here under the same license. See [LICENSE](./LICENSE) for the full text.

Both projects are owned by StitchBoat Immigration. The two trees may diverge over time. Re-syncing happens deliberately, not automatically — see [docs/counselai-inventory.md](../../docs/counselai-inventory.md) in the repo root for the porting strategy.

## Contents

| Prompt | Purpose | Used in sprint |
|---|---|---|
| `case-analyzer` | EB-1A / EB-2 NIW / H-1B case strength rubric + visa decision tree | Sprint 4 |
| `client-intake` | 4-phase structured intake interview | Sprint 5 |
| `petition-drafter` | O-1A / EB-1A / EB-2 NIW petition templates with Kazarian + Dhanasar | Sprint 10 |
| `rfe-response` | Point-by-point RFE response process + per-visa common issues | Sprint 10 |
| `immigration-forms` | Form catalog, filing fees, packet checklists | Sprint 6 |
| `cover-letter` | USCIS cover/transmittal letter templates + filing addresses | Sprint 10 |

## Verify before shipping

- **Filing fees** in `immigration-forms/prompt.md` are labeled "2025" but USCIS adjusted some fees in 2024. Cross-check against USCIS.gov before any number ships in a real packet.
- **Form editions** are not tracked in the upstream catalog; our `forms_library` table tracks them. Add edition dates when consuming.
- **Case law citations** (Kazarian v. USCIS, Matter of Dhanasar) need verification before any brief goes out.

## Structure

Each prompt directory contains:

- `prompt.md` — the system prompt (verbatim from counselai)
- `meta.ts` — TypeScript object exporting frontmatter (name, description, tags, input/output types)

Knowledge tables (filing fees, form catalog, case law citations) live in `src/knowledge/` and are populated incrementally as each consumer sprint needs them.

## Usage

```typescript
import { CASE_ANALYZER_PROMPT, caseAnalyzerMeta } from '@ico/immigration-prompts';
```
