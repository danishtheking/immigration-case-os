# StitchBoat CounselAI — Reusable Assets Inventory

> Inventory of immigration assets in the sibling project `D:\Danish\STITCH BOAT\stitchboat-counselai\` and how they map into Immigration Case OS sprints.
>
> **Source project**: StitchBoat CounselAI v1.9.12 — an Electron desktop AI agent application for immigration attorneys, forked from AionUi (Apache-2.0).
>
> **Bottom line**: counselai's Phase 1 ("Immigration AI Prompts & Knowledge Base") has *partial* output that we can port directly. Six high-quality skill files exist. They save us roughly **2-3 weeks** of prompt-engineering work in Sprints 4, 5, 6, and 10.

---

## 1. The six immigration skill files

All six live under `stitchboat-counselai/src/process/resources/skills/_builtin/`. They are markdown files with frontmatter, modeled after Claude / Anthropic skill format.

| # | Skill | File | Counselai license | Quality |
|---|---|---|---|---|
| 1 | **case-analyzer** | `case-analyzer/SKILL.md` | Apache-2.0 (project license) | High — attorney-grade rubrics for O-1A/EB-1A, EB-2 NIW, H-1B with structured output template and decision tree |
| 2 | **client-intake** | `client-intake/SKILL.md` | Apache-2.0 | High — 4-phase intake (screening → visa-specific → background → checklist) with templated summary |
| 3 | **petition-drafter** | `petition-drafter/SKILL.md` | Apache-2.0 | High — O-1A, EB-1A, EB-2 NIW petition structure with Kazarian + Dhanasar frameworks, key case law citations |
| 4 | **rfe-response** | `rfe-response/SKILL.md` | Apache-2.0 | High — point-by-point response process, common RFE issues by visa type, 87-day deadline rules |
| 5 | **immigration-forms** | `immigration-forms/SKILL.md` | Apache-2.0 | High — fee schedule, processing times, form package checklists for O-1A, EB-1A, EB-2 NIW, I-485 |
| 6 | **cover-letter** | `cover-letter/SKILL.md` | Apache-2.0 | High — full cover letter template with filing address quick reference per form type |

All six files share a consistent shape:
- YAML frontmatter (`name`, `description`, `tags`, `input_types`, `output_types`)
- Role/persona definition
- "How to use" section with example user inputs
- Structured output template (markdown block)
- Important notes / disclaimers (always include "DRAFT — attorney must review")

This shape is compatible with both Anthropic's skill model and how we plan to load prompts in `packages/immigration-prompts`.

---

## 2. What's NOT in counselai (yet)

Counselai's ROADMAP sets these as future work that has **not yet been written**:

- Document templates (Phase 1.3 of counselai roadmap) — petition support letter, expert opinion letter, employer support letter, client questionnaires, evidence checklists. **Empty.**
- Client database tables (Phase 2) — schema only described in ROADMAP, no SQL/Drizzle code.
- USCIS form auto-fill code (Phase 3) — no PDF templates committed.
- USCIS API integration (Phase 4) — not started.
- Client questionnaires UI (Phase 5) — not started.
- Analytics dashboard (Phase 6) — not started.

The Apache-2.0 license file at the project root governs all of these (existing and future) outputs that are part of the counselai repo.

---

## 3. License and porting strategy

**License:** counselai is Apache-2.0 (see `stitchboat-counselai/LICENSE`). The six skill files are part of the project source and inherit that license.

**Both projects have the same owner (you).** That makes Apache-2.0 compatibility a non-issue — you can use the files however you want. But to keep the projects clean for any future open-source release of either side, we should:

1. **Copy the files into a new package** `packages/immigration-prompts/` in the immigration-case-os monorepo.
2. **Preserve attribution** in the package's README: "Originally authored for StitchBoat CounselAI (Apache-2.0). Used here under the same license."
3. **Add the package's own LICENSE file** that references Apache-2.0.
4. **Do not modify the originals in counselai** as part of porting — counselai keeps its own copies and continues to evolve them. The two trees may diverge over time; we'll re-sync deliberately.

If counselai is ever open-sourced separately and the prompts get a new contributor, we re-port from upstream.

---

## 4. Mapping skills to immigration-case-os sprints

| Sprint | What we're building | Counselai assets to port |
|---|---|---|
| **Sprint 4** — Real EB-1A assessment + criteria scoring | Per-criterion scoring functions, structured output, eval harness | **case-analyzer** (the rubric and decision tree become the basis of `scoreEB1A()` and the alternate-path comparison logic). Adapt the markdown template into a Zod schema for structured Claude output. |
| **Sprint 5** — PAQ + client portal v1 | Per-case-type questionnaires, AI prefill | **client-intake** (the 4-phase question bank becomes the seed PAQ schema for EB-1A, EB-2 NIW, H-1B, I-130). Convert each phase to a JSON Schema form definition with conditional logic. |
| **Sprint 6** — Forms engine v1 (10 forms) | Form library, packet assembly, fee schedule | **immigration-forms** (the fee table, processing time table, and per-visa packet checklists seed `packages/forms` metadata. The 10 forms we ship match the ones counselai documents.) |
| **Sprint 10** — AI drafting (cover letters, RFE responses, support letters, briefs) | Cover brief generator, RFE response generator, support letter drafter | **petition-drafter** (becomes `draftPetitionLetter()` for cover briefs). **rfe-response** (becomes `draftRfeResponse()`). **cover-letter** (becomes `generateCoverLetter()`). All three keep their Kazarian/Dhanasar/case-law citations baked in. |

### Skills NOT used (yet)
- **Counselai-only skills** (architecture, i18n, testing, oss-pr, etc.) under `.claude/skills/` are project-conventions for the counselai contributors, not immigration content. **Do not port.**
- **AionUi inherited features** (Telegram channels, AI Cowork mode, mobile foundation, electron build scripts) are out of scope for immigration-case-os.

---

## 5. The new package: `packages/immigration-prompts`

In Sprint 1 (Phase 0), we add this to the monorepo:

```
packages/immigration-prompts/
├── package.json
├── README.md                          ← attribution, sync-with-counselai notes
├── LICENSE                            ← Apache-2.0
├── src/
│   ├── index.ts                       ← exports the prompt registry
│   ├── prompts/
│   │   ├── case-analyzer/
│   │   │   ├── prompt.md              ← ported from counselai (verbatim)
│   │   │   ├── output-schema.ts       ← Zod schema for structured output
│   │   │   └── meta.ts                ← name, description, tags, input/output types
│   │   ├── client-intake/
│   │   │   ├── prompt.md
│   │   │   ├── question-bank.ts       ← TypeScript export of the 4-phase questions
│   │   │   └── meta.ts
│   │   ├── petition-drafter/
│   │   │   ├── prompt.md
│   │   │   ├── visa-templates/        ← O-1A, EB-1A, EB-2 NIW outline templates
│   │   │   └── meta.ts
│   │   ├── rfe-response/
│   │   │   ├── prompt.md
│   │   │   ├── common-issues.ts       ← TS lookup table by visa type
│   │   │   └── meta.ts
│   │   └── cover-letter/
│   │       ├── prompt.md
│   │       ├── filing-addresses.ts    ← TS lookup by form code
│   │       └── meta.ts
│   └── knowledge/
│       ├── forms-catalog.ts           ← from immigration-forms skill, structured
│       ├── filing-fees.ts             ← from immigration-forms skill, structured
│       ├── packet-checklists.ts       ← from immigration-forms skill, structured
│       └── case-law.ts                ← Kazarian, Dhanasar, NYSDOT, etc. with citations
└── tests/
    └── prompts.test.ts                ← snapshot tests so prompts don't drift silently
```

The package exports a typed registry:

```typescript
// packages/immigration-prompts/src/index.ts
export { caseAnalyzerPrompt } from './prompts/case-analyzer';
export { clientIntakePrompt, eb1aIntakeQuestions, niwIntakeQuestions } from './prompts/client-intake';
export { petitionDrafterPrompt, eb1aPetitionTemplate } from './prompts/petition-drafter';
export { rfeResponsePrompt, commonRfeIssues } from './prompts/rfe-response';
export { coverLetterPrompt, filingAddresses } from './prompts/cover-letter';
export { formsCatalog, filingFees, packetChecklists, caseLaw } from './knowledge';
```

Both `apps/api` and `services/ml` import from this package. Sprints 4, 5, 6, and 10 each consume the relevant exports.

---

## 6. Concrete sprint changes

### Sprint 1 (Foundations) — additions
- [ ] Create `packages/immigration-prompts` package
- [ ] Copy six SKILL.md files from `stitchboat-counselai/src/process/resources/skills/_builtin/{name}/SKILL.md` to `packages/immigration-prompts/src/prompts/{name}/prompt.md`
- [ ] Add Apache-2.0 LICENSE + attribution README
- [ ] Add `meta.ts` for each prompt extracting the frontmatter into a TypeScript object
- [ ] No code consumes them yet; they're just available for Sprint 4

### Sprint 4 — additions
- [ ] Read `case-analyzer` prompt.md, derive the per-criterion Zod schema
- [ ] Implement `scoreEB1A(case)` to call Claude with the case-analyzer prompt + that schema as `responseSchema`
- [ ] Use the alternate-path decision tree from case-analyzer to seed the `alternate_paths` array on `assessments`
- [ ] Snapshot test: known-good candidate produces same scoring across runs

### Sprint 5 — additions
- [ ] Convert client-intake's 4-phase question bank into a JSON Schema form definition for the PAQ
- [ ] Auto-pick which Phase 2 visa-specific block to include based on `case.case_type_code`
- [ ] Use the LLM only for *prefilling* answers from CV/LinkedIn — the questions themselves come from this seed

### Sprint 6 — additions
- [ ] Use `immigration-forms` knowledge to populate `packages/case-types/{visa}.ts` evidence checklists
- [ ] Use the fee table for `forms_library.fee_amount` and the per-visa packet lists for default `case_type_definitions.forms[]`
- [ ] **Verify all fee amounts against current USCIS.gov before shipping** — counselai's table says "2025" but USCIS fees changed in 2024/2025; this is an attorney liability if wrong

### Sprint 10 — additions
- [ ] Implement `draftPetitionLetter(case, visa_type)` using `petition-drafter` prompt
- [ ] Implement `draftRfeResponse(case, rfe_text)` using `rfe-response` prompt + `commonRfeIssues` lookup
- [ ] Implement `generateCoverLetter(case, packet)` using `cover-letter` prompt + `filingAddresses` lookup
- [ ] All outputs default to `requires_attorney_approval = true` per ADR-0016
- [ ] Eval harness includes the case law citations (Kazarian, Dhanasar) — any drift breaks tests

---

## 7. Counselai integration (the desktop sidekick story)

Per ADR-0021 (added in this update), counselai will eventually be an external client of immigration-case-os's API. The desktop app authenticates against the SaaS, fetches cases the attorney owns, and operates on them locally with the same prompts. Two clients, one source of truth.

**What this means for the API design starting in Sprint 1:**

1. The NestJS API exposes a stable REST/tRPC surface from day one, not a moving internal-only contract.
2. JWT authentication accepts both Clerk session tokens (web) and personal access tokens (desktop / API).
3. Pagination, error shapes, and field naming are documented per endpoint — counselai will consume them.
4. Schema-versioned response bodies (`api_version: "2026-04-16"` in headers) so we can evolve without breaking the desktop client.

**What this does NOT mean:**
- We are not building counselai right now.
- We are not blocking on counselai integration to ship Sprint 1-6.
- Counselai continues to evolve independently as an Electron desktop app.

The integration is "API stability + shared prompts package" only. We revisit a deeper integration after immigration-case-os Sprint 6 is in production at SwagatUSA.

---

## 8. Things to verify before porting

- [ ] **Filing fees are current.** Counselai's table is labeled "2025" but a few of the amounts look stale (the I-485 fee and N-400 fee were changed in 2024). Cross-check against USCIS.gov before any of these ship to a real client. The fee schedule should be a Sprint 1 deliverable in `packages/immigration-prompts/src/knowledge/filing-fees.ts` with a "last verified" date and a CI reminder.
- [ ] **Form editions.** counselai's catalog doesn't track edition dates. Our `forms_library` table does (per data-model.md §5). Add edition dates when porting.
- [ ] **Filing addresses.** Same — verify against USCIS.gov before shipping.
- [ ] **Case law citations.** Verify Kazarian and Dhanasar reporter citations are correct (they look right — Kazarian v. USCIS, 596 F.3d 1115 9th Cir. 2010; Matter of Dhanasar, 26 I&N Dec. 884 AAO 2016). But verify before printing them in any outbound brief.
- [ ] **Disclaimers.** Every counselai skill includes "this is not legal advice, attorney must review." Our system enforces this at the API level (per ADR-0016) — make sure the ported prompts still include the language even though the API enforcement is the real safeguard.

---

## 9. What we are NOT porting

For clarity, here's everything in counselai we are deliberately leaving behind:

- All AionUi infrastructure (Electron, the renderer/process/preload split, tmux integration, channel adapters)
- The Skills Market UI
- All code outside `src/process/resources/skills/_builtin/`
- The `.aionui/FEATURE_*.md` files (they're feature specs for AionUi's own development, not immigration content)
- The `.claude/skills/` directory (project-conventions for counselai contributors, not immigration)
- The roadmap-only items (Phase 2-7 of counselai's roadmap that have no code yet)

---

## 10. One-time port action list (Sprint 1)

Run this in Sprint 1 alongside the rest of the foundations work:

```bash
# Create the package
mkdir -p packages/immigration-prompts/src/prompts
mkdir -p packages/immigration-prompts/src/knowledge

# Copy the six SKILL files
COUNSELAI=../../../stitchboat-counselai/src/process/resources/skills/_builtin
for skill in case-analyzer client-intake petition-drafter rfe-response immigration-forms cover-letter; do
  mkdir -p "packages/immigration-prompts/src/prompts/$skill"
  cp "$COUNSELAI/$skill/SKILL.md" "packages/immigration-prompts/src/prompts/$skill/prompt.md"
done

# Copy the LICENSE
cp ../../stitchboat-counselai/LICENSE packages/immigration-prompts/LICENSE
```

Then write the meta.ts files, the README with attribution, and the snapshot tests. Stop. Don't write any consumer code in Sprint 1 — just have the assets available.
