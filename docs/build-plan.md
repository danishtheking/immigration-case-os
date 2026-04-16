# Build Plan

> The realistic, sprint-by-sprint roadmap for building Immigration Case OS as a solo developer working with Claude. SwagatUSA is the first tenant; multi-tenant infrastructure is in place from day one but only one tenant runs in production for the first ~6 months.
>
> This **replaces** the 14-phase plan in `Case-Management-System-Spec.md` for execution purposes. The original phases are preserved as the long-term scope; this doc tells you what to build *next*.

---

## How to read this

- Each sprint is **2 weeks** of focused work. A solo developer with AI assistance, working on this primarily, should hit each sprint goal.
- "Done" criteria are explicit. If they're not met, don't move on.
- Every sprint ends with a deployment to production. Even if production has zero customers, the system runs.
- After Sprint 6, **stop and use it for a month at SwagatUSA** before adding more features. This is non-negotiable.

---

## Pre-flight checklist (before Sprint 1)

These have to be in place before any code:

- [ ] Decisions doc reviewed and approved by the human
- [ ] Architecture doc reviewed and approved
- [ ] Data model doc reviewed and approved
- [ ] Sequence diagrams reviewed
- [ ] **Accounts created** for the services in the stack:
  - [ ] GitHub repo (`immigration-case-os`)
  - [ ] Vercel
  - [ ] Fly.io
  - [ ] Neon (Postgres)
  - [ ] Cloudflare R2
  - [ ] Clerk (Pro plan trial OK to start)
  - [ ] Anthropic API
  - [ ] OpenAI API (for embeddings)
  - [ ] Stripe (test mode)
  - [ ] DocuSign (developer sandbox)
  - [ ] Postmark (test sender domain)
  - [ ] Sentry
  - [ ] Langfuse (cloud or self-hosted)
  - [ ] Doppler (or 1Password Secrets Automation)
  - [ ] Inngest cloud account
- [ ] **Custom domain** decided for SwagatUSA: `app.swagatusa.io` and `apply.swagatusa.io` (or alternative)
- [ ] Vanta or Drata trial started (for SOC 2 control tracking from day 1)

---

## Sprint 1 — Foundations (Phase 0)

**Goal:** A monorepo. Two services. A database with RLS. Clerk auth. A working "create tenant → invite user → log in → see the dashboard" flow. Cross-tenant isolation tested in CI.

### Deliverables

1. **Monorepo skeleton**
   - pnpm workspaces + Turborepo
   - `apps/web` (Next.js 15 App Router, TypeScript strict, Tailwind, shadcn/ui base components)
   - `apps/api` (NestJS 11, Node 20+, TypeScript strict)
   - `services/ml` (FastAPI 0.115, Python 3.12) — placeholder with one `/health` route
   - `packages/db` (Drizzle schema for `tenants`, `users` only, RLS migrations, tenant client wrapper)
   - `packages/shared` (LLM stub, auth helpers, types)
   - `packages/ui` (shadcn/ui re-export package)
   - `packages/immigration-prompts` (six SKILL.md files **ported from stitchboat-counselai** under Apache-2.0 attribution — see [counselai-inventory.md](counselai-inventory.md). No consumer code yet; assets sit ready for Sprint 4.)
   - Root `compose.yaml` for local Postgres 16 + pgvector + Inngest dev server

2. **CI**
   - GitHub Actions: lint, typecheck, unit tests, **cross-tenant isolation test**, build
   - Vercel preview deploys for `apps/web`
   - Fly.io deploys for `apps/api` and `services/ml`

3. **Auth + multi-tenancy**
   - Clerk SDK in `apps/web`, JWT validation in `apps/api`
   - Webhook handler `/webhooks/clerk` mirrors `organization.created` and `user.created` to our DB
   - `TenantInterceptor` sets `app.current_tenant`, `app.current_actor`, `app.current_actor_kind` on every request
   - Two Postgres roles: `app_tenant` (RLS) and `app_admin` (BYPASSRLS, migrations only)

4. **Audit logging**
   - `audit_logs` table created
   - Postgres trigger function `write_audit_log()` defined
   - Triggers attached to `tenants`, `users` (proves the pattern; we'll attach to every business table as it's added)

5. **Observability**
   - Sentry installed in web + api + ml
   - Pino structured logging on api
   - Langfuse account ready (no traces yet — we'll start using it in Sprint 4 when assessments arrive)

6. **The proof flow** (this is the Phase 0 Definition of Done from the spec)
   - Visit `app.swagatusa.io/sign-up`
   - Create org "SwagatUSA"
   - Webhook fires → tenant + user created
   - Land on `/dashboard` showing your name and org
   - Invite a second user
   - That user logs in and lands on the same dashboard
   - **Cross-tenant test passes:** seed two tenants A and B, log in as A, attempt to GET `/api/users/{B-user-id}` → 404. Same for any other endpoint.

### Done when

- [ ] All deliverables above are in main and deployed
- [ ] Cross-tenant isolation test runs in CI on every PR and is green
- [ ] You can sign up, create an org, log in, and see your dashboard
- [ ] The audit log shows your sign-up event
- [ ] No `.env` files committed; all secrets in Doppler

### What's explicitly NOT in Sprint 1

Cases. Documents. Forms. Anything fancy. We are proving the foundations.

---

## Sprint 2 — Vertical slice: intake → case → assessment v0

**Goal:** Prove the whole stack on one realistic flow. SwagatUSA can put a real candidate into the system through the branded intake form, and a fake AI assessment appears.

### Deliverables

1. **Branded intake page** at `apply.swagatusa.io/start`
   - Subdomain routing in Vercel Edge Middleware (resolves `swagatusa` → tenant)
   - Multi-step form (visa focus, country, name/email, optional CV upload)
   - i18n stub (English only for now; structure ready for ES/HI/ZH/AR/PT)
   - shadcn/ui components throughout
   - Mobile-first layout matching the [ui-reference-mockups.html](../../ui-reference-mockups.html) Screen 06

2. **Pre-signed R2 upload**
   - `/api/intake/upload-url` returns a presigned PUT
   - Browser uploads encrypted bytes to R2 (encryption with a per-tenant DEK fetched from KMS or a local stub for dev)
   - Document row created in `documents` table with `status=uploading`

3. **`candidates` and `cases` tables**
   - Schema added per [data-model.md §3](data-model.md#3-case-management)
   - RLS + audit triggers
   - Endpoints: `POST /api/intake/submit`, `GET /api/cases`, `GET /api/cases/:id`

4. **Inngest events**
   - `document.uploaded` fires `processDocument` (stub: just marks doc as scanned)
   - `lead.created` fires `notifyFirmOfNewLead` (stub: writes a console log)
   - `assessment.requested` fires `runAssessment` (stub: writes a fake assessment row with score=70)

5. **Firm dashboard v0**
   - `/dashboard` shows: KPI tiles (active cases, deadlines stub, revenue stub, agent stub)
   - `/cases` table view of all cases for the tenant
   - `/cases/:id` shows candidate info, case stage, the fake AI score
   - Layout matches Screen 01 + Screen 02 + Screen 03 from the mockups (but with placeholder data)

### Done when

- [ ] You can fill out the intake form on `apply.swagatusa.io/start`
- [ ] A new candidate + case appears in the firm dashboard within seconds
- [ ] The dashboard shows the fake assessment score
- [ ] All cross-tenant tests still pass
- [ ] Deployed to production

### What's explicitly NOT in Sprint 2

Real assessment. Real OCR. Real document classification. Forms. Deadlines. Clients can't log into a portal yet.

---

## Sprint 3 — Document pipeline (real OCR + real classification)

**Goal:** Documents uploaded during intake actually get OCR'd, classified, and tagged. The fake assessment gets replaced with a partial real one.

### Deliverables

1. **`services/ml` real implementation**
   - `/pipeline/document` endpoint
   - Pulls encrypted doc from R2, decrypts, OCRs (Textract in prod, Tesseract in dev)
   - Calls Claude to classify into criteria categories
   - Extracts metadata (publication name, date, citation count, journal name)
   - Writes back to `documents` table

2. **LLM abstraction layer** (`packages/shared/llm.ts`)
   - Anthropic primary, OpenAI fallback
   - Structured output via Zod schemas
   - Caching by `(prompt_hash, model_version)`
   - Langfuse traces for every call
   - Rate limiting + retry policy

3. **Document tab on case detail**
   - List view of all documents on a case
   - AI-classified categories shown as chips (matching Screen 03 Documents card)
   - Click a doc → see OCR text preview + metadata + criterion tags
   - "Confirm" button for attorneys to approve the AI classification

4. **`evidence_checklist_items` per case**
   - Auto-generated from the case type definition
   - Marked fulfilled when a matching document is uploaded + classified

5. **Re-trigger assessment on document upload**
   - Inngest cascade: doc uploaded → processed → assessment.requested → (still stubbed assessment)

### Done when

- [ ] You can upload a real PDF (e.g., a journal paper) via intake or directly in case detail
- [ ] Within ~30 seconds it's OCR'd, classified, tagged, and shows in the documents tab
- [ ] You see the AI's confidence + reasoning on hover
- [ ] If the doc is misclassified, you can correct it (attorney_confirmed=true)
- [ ] Langfuse shows every LLM call with cost

---

## Sprint 4 — Real EB-1A assessment + criteria scoring

**Goal:** The fake assessment becomes real. Upload a CV + 5 publications, get a real EB-1A criterion-by-criterion breakdown.

> **Reuse counselai:** the `case-analyzer` skill ported in Sprint 1 is the prompt seed for this sprint. Its rubric (8 EB-1A criteria scored 0-3) and its visa decision tree become the basis of `scoreEB1A()` and the alternate-path comparison logic. See [counselai-inventory.md §6](counselai-inventory.md#6-concrete-sprint-changes).

### Deliverables

1. **`packages/case-types`**
   - First case type: `EB1A` with all 10 regulatory criteria from 8 CFR 204.5(h)
   - Each criterion has: code, name, description, evidence requirements, scoring prompt template
   - Loaded at API boot, validated, exposed via `/api/case-types`

2. **Per-criterion scoring functions**
   - For each EB-1A criterion: a function that takes evidence + case context, calls Claude with structured output (Zod schema derived from the counselai case-analyzer template), returns `{met, confidence, rationale, evidence_doc_ids[], gaps[], recommendations[]}`
   - Orchestrator computes overall fit score (0-100) and label (strong/marginal/weak)
   - `alternate_paths` array seeded by counselai's visa decision tree (O-1A, EB-1A, EB-2 NIW, H-1B comparison)

3. **Caching**
   - `assessments` table populated with `doc_set_hash`
   - On re-trigger, check cache before calling Claude
   - Test: upload doc → assessment runs once → re-fetch case → cache hit, no LLM call

4. **Assessment drill-down UI** (matches Screen 08)
   - Big score number, trend, model version, timestamp
   - Per-criterion bars with met/partial/missing status
   - "Reasoning trace" expandable
   - Alternate paths considered (EB-1A could also be O-1A, etc. — for now hardcode "EB-1A only")
   - The big yellow `DRAFT — REQUIRES ATTORNEY REVIEW` ribbon

5. **Eval harness scaffold** (`scripts/evals/assessment/`)
   - 5 hand-crafted candidate profiles (strong, marginal, weak, edge cases)
   - Run all through the assessment, snapshot results
   - Regression: any score that moves >10 points triggers a CI failure
   - Add to CI as a separate, slower job (allowed to be slow; doesn't block PRs but blocks releases)

### Done when

- [ ] Upload a real CV + 5 publications for a hypothetical scientist
- [ ] The assessment runs, takes <2 minutes, costs <$1 per run
- [ ] Each of the 10 criteria has a clear met/partial/missing verdict with rationale
- [ ] The reasoning trace cites specific documents
- [ ] Cache hit on re-fetch
- [ ] Eval snapshot baseline saved

---

## Sprint 5 — PAQ + client portal v1

**Goal:** A candidate can log in and see their own case, fill out the PAQ, upload more documents.

> **Reuse counselai:** the `client-intake` skill is a complete 4-phase question bank (initial screening, visa-specific, background/history, document checklist) for O-1A/EB-1A, EB-2 NIW, H-1B, and I-130. Convert it into the seed JSON Schema for the PAQ; the LLM only does *prefilling*, not question generation.

### Deliverables

1. **Client portal subdomain** `my.swagatusa.io`
   - Same Next.js app, routed by middleware
   - Clerk passwordless / magic-link auth for candidates
   - Layout matches Screen 07

2. **PAQ generator**
   - Per-case-type question bank (start with EB-1A) — **seeded from counselai's `client-intake` 4-phase structure**
   - LLM generates only the *prefill* (not the questions) based on candidate context
   - Dynamic form rendering (React Hook Form + Zod from JSON schema)
   - Autosave per field
   - Multi-step with completion %
   - Pre-filled answers carry source attribution ("from your CV" / "from your LinkedIn")

3. **Document upload from portal**
   - Same R2 presign flow
   - Categorized upload (the candidate picks "this is a publication" or "this is an award")
   - Triggers the same processing pipeline

4. **Case status visibility**
   - Stage rail (engaged → intake → preparation → review → filed → adjudicating → decision)
   - Open tasks for the client
   - Document count, PAQ %, invoice status, message count

5. **Multi-language scaffolding**
   - i18n via `next-intl`
   - English content for all strings
   - One translated locale (Spanish or Hindi) to prove the pipeline

### Done when

- [ ] Candidate gets a magic link in their email
- [ ] They can log in, see their case, fill out the PAQ
- [ ] PAQ answers feed back into the assessment
- [ ] They can upload additional documents
- [ ] Their case shows real-time status

---

## Sprint 6 — Forms engine v1 (10 forms) + filing packet assembly

**Goal:** Generate filled USCIS PDFs for the 10 most common forms. Assemble them into filing packets.

> **Reuse counselai:** the `immigration-forms` skill provides per-visa packet checklists, current-ish fee amounts, and processing time estimates. Port these into `packages/immigration-prompts/src/knowledge/` and consume from `packages/case-types`. **Verify every fee amount against USCIS.gov before shipping** — counselai's table is labeled "2025" but USCIS adjusted some fees in 2024.

### Deliverables

1. **`packages/forms`**
   - PDF templates committed for: G-28, I-130, I-130A, I-485, I-765, I-131, I-129, I-140, N-400, I-589, I-751
   - YAML field maps for each
   - Zod validators for each
   - `pdf-lib` renderer

2. **`forms_library` and `forms_filled` tables** populated (with **edition dates** that counselai's catalog doesn't track)

3. **Forms tab on case detail** (matches Screen 04)
   - Add a form to a case
   - Auto-fill from case + candidate + beneficiary data
   - Edit fields with auto-save
   - Validation errors shown inline
   - "Render PDF" produces a flattened, fillable PDF
   - Edition tracking (newer USCIS edition appearing → warning ribbon)

4. **Exhibit builder (basic version)**
   - Drag-and-drop ordering
   - Auto-pagination
   - Cover sheets with exhibit letters
   - Combined PDF export

5. **Filing packet assembly**
   - Pick forms + exhibits + cover letter → produce one combined PDF
   - Manifest stored in `filing_packets`
   - Filing fees calculated from form definitions

### Done when

- [ ] You can take a Priya Sharma case and produce a full I-140 + I-907 + G-28 packet
- [ ] The PDFs open in Adobe Reader and look correct
- [ ] Edition tracking warns when USCIS updates a form
- [ ] All forms get attorney_approved before they can be added to a packet

---

## STOP AND USE IT

After Sprint 6 you have the **MVP for SwagatUSA's own use**:

- Branded intake captures candidates
- Documents are OCR'd, classified, scored
- EB-1A assessment is real
- Candidates have a portal
- 10 forms are auto-fillable
- Filing packets are buildable

**Run real cases through it for one month.** Find what's broken. Fix bugs. Don't add features. Don't start Sprint 7 until SwagatUSA has actually filed a case using the system.

This is the most important sentence in this document.

---

## Sprint 7 — Deadlines, ticklers, USCIS receipt polling

**Goal:** Every case has tracked deadlines. RFEs trigger 87-day clocks. USCIS status polls daily.

### Deliverables

1. **`deadlines` + `agency_notices` tables**
2. **Deadlines view** (matches Screen 05) — calendar + agency clocks + Visa Bulletin watch
3. **Visa Bulletin daily scrape** (Inngest cron)
4. **USCIS receipt polling** (Inngest cron) for cases with receipt numbers
5. **RFE detection** — when an RFE notice is uploaded, parse it, create a deadline, change case stage
6. **Escalation rules** — < 7 days → ping attorney; < 3 days → daily ping

---

## Sprint 8 — Communications: email/SMS/WhatsApp + workspace messaging

**Goal:** Firm staff can message clients in-app, by email, by SMS. Inbound emails route to the right case.

### Deliverables

1. **`messages` table**
2. **In-app messaging UI** — threads, attachments, per-case
3. **Postmark outbound** — branded templates per firm
4. **Postmark inbound** — `case-{thread_id}@swagatusa.io` parses to a thread
5. **Twilio SMS** + WhatsApp Business setup
6. **Notifications** — email digest + in-app indicator

---

## Sprint 9 — Contracts (DocuSign) + billing v1

**Goal:** Send engagement letters. Collect retainers. Track installments.

### Deliverables

1. **DocuSign integration** — envelope create + webhook
2. **`contracts` table** + UI
3. **Stripe Connect onboarding** for SwagatUSA (test mode)
4. **`invoices` + `payments` tables**
5. **Payment intent flow** for client portal — pay an invoice
6. **Trust ledger v1** (NOT IOLTA-compliant; see ADR-0013)
7. **Installment plans** via Stripe Billing

---

## Sprint 10 — AI drafting (cover letters, RFE responses, support letters)

**Goal:** Replace blank-page-staring with AI drafts that attorneys edit.

> **Reuse counselai:** three of counselai's six skills feed directly into this sprint:
> - `petition-drafter` → `draftPetitionLetter()` for cover briefs (O-1A, EB-1A, EB-2 NIW templates with Kazarian + Dhanasar frameworks)
> - `rfe-response` → `draftRfeResponse()` (point-by-point process + per-visa-type common RFE issues lookup table)
> - `cover-letter` → `generateCoverLetter()` + filing-address lookup
>
> Verify Kazarian / Dhanasar / NYSDOT case citations before any of them appear in attorney-facing output.

### Deliverables

1. **`drafted_artifacts` + `support_letters` tables**
2. **Recommender suggestion** (OpenAlex search by coauthorship)
3. **Support letter drafting** with DOCX output (matches the workflow in Screen 03 Support letters tab)
4. **Petition cover brief drafting** using counselai's `petition-drafter` prompt
5. **RFE response drafting** with retrieval over USCIS Policy Manual + AAO decisions (Sprint 11 enables retrieval) — uses counselai's `rfe-response` prompt as the structure
6. **Cover letter generation** using counselai's `cover-letter` prompt with the filing address lookup
7. **Attorney approval gate** — every artifact starts as DRAFT, enforced server-side per ADR-0016

---

## Sprint 11 — Legal Research RAG

**Goal:** Per-case legal research memos with real citations.

### Deliverables

1. **Legal corpus ingestion** — USCIS Policy Manual, AAO non-precedent decisions, 8 CFR 204.5, Matter of Dhanasar/Price
2. **`legal_sources` + `legal_chunks`** populated
3. **pgvector HNSW indexes**
4. **`legal_research_memos` generation** with citation safety (refusal threshold + post-generation citation validation per ADR-0015)
5. **Research tab on case detail** with the full memo

---

## Sprint 12 — Brenda agent v1

**Goal:** Autonomous nudges with human-in-the-loop.

### Deliverables

1. **`agent_actions` table**
2. **Brenda cron** (Inngest, every 6h)
3. **Tool definitions:** `draft_email`, `draft_sms`, `update_status`, `escalate_to_human`, `do_nothing`
4. **Per-tenant config:** `brenda_enabled`, per-action-type policy gates
5. **UPL filter** (Claude prompt that scores advice-likelihood)
6. **Approval queue UI** (matches Screen 10)
7. **Eval harness:** 50 scripted candidate scenarios; baseline snapshots
8. **Audit trail** for every action

---

## Sprint 13 — Opportunity Bank v1

**Goal:** A curated list of CFPs / awards / judging slots, matched per candidate.

### Deliverables

1. **One real source crawled:** WikiCFP for CFPs (the rest can be added later)
2. **`opportunities` + `opportunity_matches` tables**
3. **Matching engine:** vector similarity + rule filters
4. **Opportunities tab** on case detail (matches Screen 09)
5. **"Send to client portal"** flow
6. **Auto credit:** when a match is marked client_acted, re-trigger assessment

---

## Sprint 14 — Trust accounting integration (LawPay or TrustBooks)

**Goal:** Real IOLTA compliance via integration, not from scratch.

### Deliverables

1. **LawPay (or TrustBooks) API integration**
2. **Trust ledger reconciliation** with the integrated provider
3. **3-way reconciliation reports**
4. **Compliance copy update** in the UI

---

## Sprint 15 — Removal defense module

**Goal:** EOIR cases work end-to-end.

### Deliverables

1. **Case types:** EOIR-42A/42B, asylum (I-589 expanded), MTR, BIA appeal
2. **`eoir_hearings` table + calendar**
3. **EOIR ACIS polling** (where available)
4. **Master + individual hearing prep workflow**
5. **Country conditions research module** for asylum cases

---

## Sprint 16 — Corporate immigration module

**Goal:** Bulk H-1B / L-1 / I-9 management for corporate clients.

### Deliverables

1. **Employer entity model**
2. **Bulk case dashboard** for an employer
3. **I-9 + E-Verify integration**
4. **PAF (Public Access File) generation** for H-1B/E-3
5. **LCA filing helper** (DOL FLAG)

---

## Sprint 17 — Reporting + analytics

**Goal:** Per-attorney caseload, pipeline forecast, RFE rates, cycle times.

### Deliverables

1. **SQL-backed metrics views**
2. **Reports tab** with charts (Recharts or Tremor)
3. **CSV/Sheets export**
4. **Pipeline forecast** by stage and case manager

---

## Sprint 18 — White-label, custom domain, SSO

**Goal:** Onboard a second firm without engineer involvement.

### Deliverables

1. **Custom domain CNAME flow** for tenants
2. **DKIM/SPF setup helper** for branded outbound emails
3. **Per-tenant agent persona** ("Brenda" → "Neha" → "Maya")
4. **Clerk SAML SSO** enabled for Pro plan tenants
5. **Tenant admin UI** (matches Screen 12)

---

## Sprint 19 — SOC 2 audit prep finalization

**Goal:** Pass a SOC 2 Type II audit window.

### Deliverables

1. **Vanta controls all green**
2. **Pen test scheduled** (third party)
3. **Vendor security questionnaires** answered
4. **DR/BCP runbook**
5. **Incident response playbook**

---

## Sprint 20 — Public launch

**Goal:** Onboard the first non-SwagatUSA customer.

### Deliverables

1. **Marketing site** (separate Next.js app or just landing pages on a different domain)
2. **Pricing page** with Stripe Checkout
3. **Self-serve onboarding** for new firms
4. **Knowledge base + support email**
5. **Status page** (Better Stack)

---

## What we are NOT building, ever (or at least not in v1)

- USCIS form auto-submission API
- Court e-filing outside ECAS
- Native iOS/Android apps
- Non-U.S. immigration (Canada/UK/EU is a v2+ conversation)
- A full accounting suite (we integrate, never replace)
- Fine-tuning Claude (RAG + prompts is enough)
- A co-counsel referral marketplace
- Cross-firm anonymized benchmarking
- A Gemini / GPT-only fork (we always use Claude as primary)

---

## Re-evaluation triggers

We reopen the build plan if any of these happen:

1. **A second firm wants to use it.** Reorder Sprint 18 to be sooner.
2. **An RFE bug bites SwagatUSA.** Pause feature work, fix it.
3. **Anthropic prices change >2x.** Revisit ADR-0008 and the assessment caching strategy.
4. **A regulatory change** (USCIS policy update, new form edition). Add an unplanned form-update sprint.
5. **Cross-tenant test fails** in production simulation. STOP. Treat it as a security incident.
