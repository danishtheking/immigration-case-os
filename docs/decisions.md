# Architecture Decision Records (ADRs)

Every irreversible technical choice in this repo has a numbered decision record. This file is the index. Individual records live in `docs/adr/`.

The format follows Michael Nygard's lightweight ADR template: **Context → Decision → Consequences**.

| # | Title | Status | Decision (in one line) |
|---|---|---|---|
| 0001 | Multi-tenancy strategy | Accepted | Single Postgres, row-level via RLS, per-tenant KMS keys for documents |
| 0002 | Auth provider | Accepted | Clerk for v1 (faster shipping); migration path to WorkOS documented |
| 0003 | Backend framework | Accepted | NestJS for the main API; FastAPI for ML/RAG only |
| 0004 | ORM and migrations | Accepted | Drizzle ORM + Drizzle Kit |
| 0005 | Workflow / event bus | Accepted | Inngest (start); Temporal escape hatch documented |
| 0006 | Vector store | Accepted | pgvector (start) — same Postgres, same RLS, same backups |
| 0007 | Object storage | Accepted | Cloudflare R2 (S3-compatible, free egress) |
| 0008 | LLM provider | Accepted | Anthropic Claude as primary, OpenAI as fallback, single abstraction layer |
| 0009 | Payments | Accepted | Stripe Connect + Stripe Billing for USD, Airwallex for non-USD |
| 0010 | E-signature | Accepted | DocuSign primary, BoldSign fallback |
| 0011 | Email | Accepted | Postmark for transactional + inbound parsing |
| 0012 | Frontend stack | Accepted | Next.js 15 App Router, React 19, TanStack Query, Tailwind, shadcn/ui |
| 0013 | IOLTA trust accounting | Accepted | Build a ledger in v1; defer compliance certification; integrate LawPay later |
| 0014 | Case type definitions | Accepted | Data-driven (TypeScript+Zod), versioned, no schema migration to add a type |
| 0015 | RAG citation safety | Accepted | Refuse below similarity threshold; validate every cited URL post-generation |
| 0016 | Agent guardrails | Accepted | Default-draft for outbound; per-firm + per-action-type enable; UPL filter; kill switch |
| 0017 | Observability | Accepted | Sentry + Langfuse + OpenTelemetry; structured logs from day one |
| 0018 | Hosting | Accepted | Vercel (web), Fly.io (api + ml), Neon (Postgres), R2 (storage) |
| 0019 | Monorepo tooling | Accepted | pnpm workspaces + Turborepo |
| 0020 | Compliance posture | Accepted | SOC 2 Type II onboarding (Vanta) starts in Phase 0, not Phase 11 |
| 0021 | Counselai integration + shared prompts package | Accepted | Port six counselai skills into `packages/immigration-prompts`; counselai becomes API-stable client later |

---

## ADR-0001 — Multi-tenancy strategy

### Context
The product is multi-tenant SaaS. Every firm's data must be invisible to every other firm. Three architectures are on the table:

| Strategy | Isolation | Ops cost | Migration cost | Per-tenant customization |
|---|---|---|---|---|
| **Row-level (single DB)** | Logical only — depends on RLS | Low | Trivial | Hard |
| **Schema-per-tenant** | Stronger | Medium | Painful (N schemas) | Medium |
| **DB-per-tenant** | Strongest | High | Trivial per tenant | Easy |

### Decision
**Row-level isolation in a single Postgres database**, enforced by Postgres Row-Level Security (RLS), with these reinforcements:

1. **Every business table** has `tenant_id uuid not null` and an RLS policy:
   ```sql
   USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
   WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid)
   ```
2. The NestJS request lifecycle sets `SET LOCAL app.current_tenant = $tenantId` from the JWT before any query runs. A failure to set it returns no rows (fail-closed).
3. Two distinct connection roles in Postgres:
   - `app_tenant` — RLS enabled, used by the API.
   - `app_admin` — RLS bypass, used **only** by migrations and offline scripts. Never by request handlers.
4. Drizzle queries go through a tenant-scoped client wrapper that throws if invoked outside a tenant context.
5. **Per-tenant envelope encryption for documents**: each tenant has a KMS data key (AWS KMS or local libsodium for dev). Document bytes are encrypted with the data key before upload to R2; the data key is wrapped by the master KMS key. This means even a stolen R2 bucket leaks ciphertext.
6. A CI job spins up two tenants and runs an exhaustive cross-read attack: every endpoint, every entity, every ID-guessing attempt. Asserts 0 cross-tenant rows. Runs on every PR.

### Consequences
- **Pro:** cheapest to operate, simplest backups, simplest schema migrations.
- **Pro:** the fail-closed pattern (no `current_tenant` set → 0 rows) is more defensible than fail-open.
- **Con:** a Postgres bug or a developer who bypasses the wrapper is a data-leak vector. The CI test is the bulwark.
- **Con:** enterprise customers (>50 attorneys) may demand schema-per-tenant or DB-per-tenant. We have a documented migration path: schema-per-tenant via a `tenant_schema_map` table, written but not deployed in v1.

---

## ADR-0002 — Auth provider

### Context
Need: SSO (SAML), MFA, per-tenant user isolation, social login for candidates, API keys, organization model. Options:

| Provider | SAML SSO | Free tier | Org model | Cost at scale | Self-hostable |
|---|---|---|---|---|---|
| **Clerk** | Pro plan | 10k MAU | Built-in | $25/mo + per-MAU | No |
| **WorkOS** | Yes | 1M users free SSO | Built-in | Higher per-MAU | No |
| **Auth.js + WorkOS SSO** | Mixed | Free | Roll your own | Cheapest | Yes |
| **Supabase Auth** | Pro plan | Generous | Roll your own | Cheap | Yes |
| **Keycloak (self-host)** | Yes | Free | Built-in | Ops cost | Yes |

### Decision
**Clerk for v1.** Reasoning:

- The dev experience is the fastest of any option. Pre-built `<SignIn />`, `<UserButton />`, `<OrganizationSwitcher />` components match exactly what we need for the firm console.
- The `Organization` primitive maps cleanly to `tenant`. We use `org_id` as the tenant identifier.
- SSO/SAML is on the Pro plan ($25/mo + per-MAU). Cheap until we have real customers.
- The webhooks let us mirror the user/org records into our Postgres `users` and `tenants` tables for joinable queries.

### Consequences
- **Pro:** ship Phase 0 in a weekend instead of a week.
- **Con:** vendor lock-in. If Clerk raises prices we're stuck.
- **Mitigation:** the auth abstraction layer in `packages/shared/auth.ts` exposes only `getCurrentUser()` and `getCurrentTenant()`. Swapping to WorkOS or Auth.js means rewriting that one file. A documented WorkOS migration plan lives in `docs/adr/0002-auth-migration-to-workos.md` (TODO).
- **Con:** Clerk's candidate-portal UX is OK but not great. Candidates may need a separate Clerk instance or a different auth path entirely (magic-link only). Decide in Phase 3.

---

## ADR-0003 — Backend framework

### Context
The spec locks NestJS for the main API and FastAPI for ML. Considered alternatives: Hono + Drizzle (Node, much lighter), Encore (TypeScript with built-in tracing), all-Python (FastAPI for everything).

### Decision
**Honor the spec.** NestJS for the main API, FastAPI for ML/RAG.

Reasoning:
- NestJS gives us dependency injection, request-scoped tenant context, and interceptors for the RLS guard. Doing this manually in Hono is more code.
- The Python service exists because the OCR + embedding + RAG ecosystem in Python is genuinely better. `langchain`, `unstructured`, `pypdf`, `sentence-transformers`, `pytesseract` are all best-in-class.
- Two services means two deploys, two CI lanes, two sets of secrets. We accept that cost.

### Consequences
- More moving parts than a single Next.js app with API routes. We need Inngest to stitch them.
- Deploys: web → Vercel, api + ml → Fly.io as separate apps.

---

## ADR-0004 — ORM and migrations

### Context
Drizzle vs Prisma vs Kysely vs raw SQL.

### Decision
**Drizzle ORM + Drizzle Kit.** Reasoning:

- TypeScript-first schema (no separate Prisma DSL).
- SQL-like query builder — what you write is what runs. Easier to add `SET LOCAL app.current_tenant` and read raw SQL EXPLAIN plans.
- Drizzle Kit migrations are plain SQL files we can version, hand-edit, and review.
- Plays well with pgvector (no Prisma plugin gymnastics).
- Drizzle Studio is a free admin UI for dev.

### Consequences
- Less mature than Prisma. Some edge cases (deeply nested relations) need raw SQL.
- The team needs to know SQL. Acceptable.

---

## ADR-0005 — Workflow / event bus

### Context
We need a durable queue with retries, scheduled jobs, and human-in-the-loop steps for: assessment re-runs on doc upload, Brenda agent ticks, USCIS receipt polling, dunning, RFE clock escalations, document classification pipelines.

### Decision
**Inngest** for v1, with **Temporal as documented escape hatch** if Brenda's state machine outgrows it.

Reasoning:
- Inngest functions are plain TypeScript and live next to the rest of the API code. Zero new infra.
- Free tier covers low volume; pay-per-step at scale.
- Built-in observability (Inngest Dashboard) is good enough that we don't need separate tracing for the queue layer.
- Cron support out of the box.

### Consequences
- Temporal would be more powerful for complex Brenda workflows but is a much bigger ops commitment.
- If we hit 1M+ events/month or need cross-language workflows, switch to Temporal.

---

## ADR-0006 — Vector store

### Context
Need: per-tenant vector search over legal documents, candidate embeddings, opportunity matching. Options: pgvector, Pinecone, Weaviate, Turbopuffer, Qdrant.

### Decision
**pgvector**, in the same Postgres instance as the rest of the data.

Reasoning:
- Same connection, same RLS policies, same backups, same migrations. One database to operate.
- pgvector is fast enough for the corpus sizes we expect (legal corpus < 1M chunks initially).
- HNSW indexing is built into pgvector 0.7+.
- We can mix vector search with SQL filters in one query (e.g., `WHERE tenant_id = $1 AND case_type = 'EB1A' ORDER BY embedding <=> $vector LIMIT 10`).

### Consequences
- At 10M+ chunks we may need Turbopuffer or Pinecone. Migration path: an `embeddings` adapter in `packages/db` with two implementations.

---

## ADR-0007 — Object storage

### Context
Documents are large, numerous (200+ page evidence packets), and per-tenant encrypted. Options: AWS S3, Cloudflare R2, Backblaze B2.

### Decision
**Cloudflare R2.**

- S3-compatible API — works with `@aws-sdk/client-s3` unchanged.
- Zero egress fees. This matters: every document download from the firm console is an egress event.
- Cheap at-rest storage.
- Per-tenant prefix isolation: `r2://immcaseos/tenants/{tenant_id}/documents/{document_id}.enc`.

### Consequences
- AWS Textract (OCR) bills extra cross-cloud bandwidth. Solution: pull the encrypted blob into the ML service, decrypt locally, OCR there, never persist plaintext.

---

## ADR-0008 — LLM provider

### Context
Need a primary LLM for assessments, drafts, and Brenda. Need a fallback for resilience and cost optimization.

### Decision
**Anthropic Claude as primary** (Sonnet 4.6 for most calls, Opus 4.6 for high-stakes legal drafting). **OpenAI GPT-4o as fallback** (and for embeddings via `text-embedding-3-large`).

A thin abstraction in `packages/shared/llm.ts`:

```typescript
type LlmCall = {
  model: 'claude-sonnet-4.6' | 'claude-opus-4.6' | 'gpt-4o';
  system: string;
  messages: Message[];
  tools?: Tool[];
  responseSchema?: ZodSchema;
  cacheKey?: string;
};

export async function llm(call: LlmCall): Promise<LlmResult> { ... }
```

Every LLM call is traced via Langfuse (model, prompt, tokens, latency, cost, output). Caching by `(prompt_hash, model_version)`.

### Consequences
- Two API keys to manage.
- Prompts are model-specific in places. We accept some per-model prompt forking.
- All cost/latency observability lives in Langfuse, not scattered across logs.

---

## ADR-0009 — Payments

### Context
Firms collect retainers from candidates worldwide, often in INR / BRL / NGN. Need installment plans, dunning, multi-currency, and IOLTA-aware rules.

### Decision
**Stripe Connect** (firms onboard as connected accounts) **+ Stripe Billing** (for installment subscriptions) **+ Airwallex** (for non-USD collections in markets Stripe doesn't serve well).

### Consequences
- Stripe Connect onboarding is a real compliance flow per firm. Multi-day. Document in onboarding wizard.
- Reconciliation: Stripe payouts land in the firm's bank; Airwallex collections land in Airwallex; both must reconcile to the trust ledger.
- LawPay or ClientPay is a possible swap-in for legal-industry-native trust handling. Re-evaluate in Phase 6.

---

## ADR-0013 — IOLTA trust accounting

### Context
IOLTA (Interest on Lawyers Trust Accounts) is required by every state bar for handling client funds. Three-way reconciliation between bank statement, trust ledger, and per-client ledger must match to the cent. A bug here is a malpractice complaint.

### Decision
**v1: build a trust *ledger* (we need it for installments per case). Do NOT claim IOLTA compliance.** Phase 6 integrates with **LawPay** or **TrustBooks** for the actual compliance work.

The product copy says: *"Trust ledger — connects to your trust account. Use alongside a compliant trust accounting system."*

### Consequences
- We don't get sued.
- We can still show installments, retainer balances, and "applied to invoice" entries.
- LawPay/TrustBooks integration becomes a sales talking point in Phase 6.

---

## ADR-0014 — Case type definitions

### Context
The spec demands 30+ case types. Adding a new visa type must not require a schema migration.

### Decision
Each case type is a TypeScript+Zod definition in `packages/case-types/`:

```typescript
export const I130_SPOUSE: CaseTypeDefinition = {
  code: 'I130_SPOUSE',
  category: 'family',
  display_name: 'I-130 Petition for Alien Relative (Spouse)',
  forms: [
    { code: 'I-130', edition: '04/01/2024', required: true },
    { code: 'I-130A', edition: '04/01/2024', required: true },
    { code: 'G-28', edition: '03/06/2023', required: true },
  ],
  evidence_checklist: [
    { id: 'marriage_cert', label: 'Marriage certificate', required: true },
    { id: 'spouse_id', label: 'USC/LPR proof for petitioner', required: true },
    // ...
  ],
  workflow: 'family_based_petition_v1',
  deadlines: [
    { kind: 'rfe_response', days_from: 'rfe_issued', days: 87 },
  ],
  filing_venue: 'USCIS',
  letter_templates: ['family_cover_letter_v1'],
  required_roles: ['attorney_review_before_filing'],
};
```

A registry validates and exposes them at runtime. The `case_type_definitions` table stores the *current* version of each (loaded from code at boot) plus historical versions for audit.

### Consequences
- Adding a new case type is a code change, not a schema change. Easy to ship.
- Version compatibility: historical cases keep their original definition snapshot in `cases.case_type_snapshot_jsonb` so changing a definition doesn't break in-flight cases.

---

## ADR-0015 — RAG citation safety

### Context
LLMs hallucinate AAO decision numbers and 8 CFR section numbers. Filing a brief with a fake citation is a sanctionable offense.

### Decision
Three-layer defense:

1. **Refusal threshold.** If the top-k similarity score is below threshold T (tuned per source), the system returns "no high-confidence basis found" and refuses to generate.
2. **Citation grounding.** Every citation in the LLM output must reference a chunk that was actually retrieved in this query. Post-generation, parse cited URLs/case numbers and validate against the retrieval set. Strip any that don't match.
3. **Source date metadata.** Every chunk carries `source_url`, `retrieval_date`, `last_modified`. Memos display all three.

The output is **always** marked `DRAFT — REQUIRES ATTORNEY REVIEW`. The API enforces this; the UI surfaces a yellow ribbon; an attorney user must click "approve" to remove the watermark.

### Consequences
- Fewer "magic" memos when the corpus doesn't have an answer. The user sees "no result" instead of a confident lie. This is the right trade.

---

## ADR-0016 — Agent guardrails

### Context
Brenda is autonomous. She drafts emails. She has access to client contact info. The risk model: she sends something that sounds like legal advice, the candidate relies on it, the firm is on the hook for UPL (unauthorized practice of law).

### Decision
Layered guardrails:

1. **Default to draft.** Every outbound action (email, SMS, WhatsApp) defaults to a draft that requires human approval. Approval is a UI action that produces a signed approval record in `agent_actions`.
2. **Per-firm + per-action-type enable.** A firm admin can enable autonomous send for *specific* action types (e.g. "auto-send portal nudges" is fine; "auto-send email to candidate" stays draft).
3. **UPL filter.** A small classifier (or a Claude prompt) checks every draft for advice-shaped language: any mention of "you should," "the law requires," "in your case," etc. If detected, the draft is locked to human approval regardless of the firm setting.
4. **Kill switch.** `tenants.brenda_enabled boolean`. False = the agent does nothing.
5. **Eval harness.** 50 scripted candidate scenarios in `scripts/evals/brenda/`. Run on every prompt change in CI. Regressions block merge.
6. **Full audit.** Every Brenda tool call is logged to `agent_actions` *before* execution with prompt, tool args, model version, and policy gate result.

### Consequences
- Brenda is slower than a human-free agent would be. That's the point.
- The eval harness is non-trivial to maintain. We accept that cost.

---

## ADR-0018 — Hosting

### Context
Where does this run?

### Decision
- **Web (Next.js)** → Vercel. Edge-friendly, integrates with Clerk, ships fast.
- **API (NestJS)** → Fly.io. Long-running, needs persistent connections to Postgres, runs Inngest functions in-process (or via Inngest's hosted service).
- **ML (FastAPI)** → Fly.io as a separate app. Sized for OCR + embedding workloads.
- **Postgres** → Neon (serverless, branching for previews, pgvector available). Migration to Supabase or RDS is documented.
- **Object storage** → Cloudflare R2.
- **Secrets** → Doppler.
- **Cron** → Inngest scheduled functions.

### Consequences
- Three hosting providers (Vercel, Fly, Neon) — three billing relationships, three dashboards.
- Trade-off accepted: each is best-in-class for its layer.
- Terraform code in `infra/terraform/` describes everything for reproducibility.

---

## ADR-0020 — Compliance posture

### Context
The spec puts SOC 2 prep in Phase 11 (week 22+). This is wrong: enterprise law firms ask for SOC 2 in the first sales call. Without it, you can't sell to anything bigger than a 5-attorney firm.

### Decision
**Vanta onboarding starts in Phase 0.** From day one:

- Every commit is signed.
- Every prod deploy goes through CI with linting, testing, and cross-tenant isolation tests.
- Every PR requires review.
- Every secret lives in Doppler, not in `.env` files in the repo.
- Audit logs are enabled from the first table.
- Encryption at rest (KMS) is the default.
- SSO is enforced for staff.
- Background checks for staff are on the to-do list.

We won't *have* SOC 2 Type II at Phase 0 — that's a 6-month observation window — but we'll have all the controls in place so the audit is a paperwork exercise.

### Consequences
- Slows Phase 0 by maybe a day. Saves three months of remediation work later.
- Vanta is ~$5k/year. Cheap for what it gets us.

---

---

## ADR-0021 — Counselai integration + shared prompts package

### Context
A sibling project, `stitchboat-counselai`, exists in `D:\Danish\STITCH BOAT\stitchboat-counselai\`. It is an Electron desktop app for immigration attorneys, forked from AionUi (Apache-2.0). Both projects have the same owner.

Counselai's Phase 1 produced six high-quality immigration skill files (case-analyzer, client-intake, petition-drafter, rfe-response, immigration-forms, cover-letter). These directly correspond to features we will build in immigration-case-os Sprints 4, 5, 6, and 10.

Three options:
1. Ignore counselai. Write all prompts from scratch. Wastes 2-3 weeks.
2. Port the prompts. Copy them once into immigration-case-os; trees diverge over time.
3. Keep prompts in counselai and have immigration-case-os import them at build time. Tighter coupling, more brittle.

### Decision
**Option 2: port the six skill files into a new `packages/immigration-prompts` package** in immigration-case-os, with attribution to counselai, in Sprint 1. Track porting deliberately (no automatic sync). Re-port if counselai upstream changes meaningfully.

**Counselai will eventually become an external client of immigration-case-os's API**: the desktop app authenticates against the SaaS, fetches the attorney's cases, and operates on them locally with the same prompts. Two clients (web + desktop), one source of truth (the SaaS).

This means starting in Sprint 1 the API is designed for *external* clients, not just our own web app:
- Stable REST/tRPC surface from day one, documented per endpoint
- JWT authentication accepts both Clerk session tokens (web) and personal access tokens (desktop)
- Schema-versioned response bodies (`api_version` header) so we can evolve without breaking the desktop client
- Clear pagination, error shapes, and field naming conventions

We do **not** build counselai integration in Sprints 1-6. Counselai continues to evolve independently. The integration is "API stability + shared prompts package" only. We revisit deeper integration after immigration-case-os Sprint 6 ships to SwagatUSA.

### Consequences
- **Pro:** save 2-3 weeks of prompt engineering by reusing counselai's Phase 1 output.
- **Pro:** API discipline from day one — when we *do* wire counselai in, no rework.
- **Pro:** counselai is unblocked — it doesn't depend on us.
- **Con:** the prompts will drift between repos over time. We accept that and re-sync deliberately.
- **Con:** if counselai is open-sourced separately, we must keep the Apache-2.0 LICENSE + attribution clean in `packages/immigration-prompts`. Documented in [counselai-inventory.md §3](counselai-inventory.md#3-license-and-porting-strategy).

See [counselai-inventory.md](counselai-inventory.md) for the full asset inventory and per-sprint mapping.

---

## How to add a new ADR

1. Copy `docs/adr/_template.md` to `docs/adr/{number}-{kebab-name}.md`.
2. Fill in Context → Decision → Consequences.
3. Add a row to the table at the top of this file.
4. Reference the ADR from any code that depends on the decision.
5. If a future decision *supersedes* an old one, mark the old ADR `Superseded by #NNNN` instead of deleting it.
