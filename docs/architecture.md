# Architecture

> System design for Immigration Case OS. Read [decisions.md](decisions.md) first for the *why* behind every choice; this doc explains the *what* and the *how*.

---

## 1. The product, in one paragraph

Immigration Case OS is a multi-tenant SaaS web application that immigration law firms use to run their practice end-to-end. Each firm gets a branded intake link, a CRM pipeline, a case workspace, an AI assessment engine for high-skill visas (EB-1A / EB-2 NIW / O-1), automated legal research, an opportunity bank, contract + payment + e-signature flows, and an autonomous agent ("Brenda") that nudges clients and drafts communications under human-in-the-loop policy gates. SwagatUSA is the first tenant; the system supports unlimited additional firms with strict data isolation.

## 2. The three personas

| Persona | URL | Auth | Capabilities |
|---|---|---|---|
| **Firm staff** (attorney, case manager, firm admin) | `app.{firm-slug}.io` | Clerk SSO | Full case access, billing, agent console, admin |
| **Candidate / client** | `my.{firm-slug}.io` | Magic link / Clerk passwordless | Their own cases + dependents only, document upload, e-sign, pay |
| **Public visitor** | `apply.{firm-slug}.io` | None (rate-limited) | Branded intake form |

All three live in the same Next.js app, routed by subdomain. Per-tenant custom domains via CNAME in Phase 10.

## 3. High-level system diagram

```
                 ┌────────────────────────────────────────────────────┐
                 │                  EDGE LAYER                        │
                 │  Cloudflare DNS → custom domains per tenant        │
                 │  Vercel CDN + Edge Middleware (subdomain routing)  │
                 └─────────────────────┬──────────────────────────────┘
                                       │
              ┌────────────────────────┼─────────────────────────┐
              │                        │                         │
    ┌─────────▼────────┐    ┌──────────▼──────────┐    ┌────────▼─────────┐
    │ apps/web         │    │ apps/web            │    │ apps/web         │
    │ apply.* subdomain│    │ app.* subdomain     │    │ my.* subdomain   │
    │ (public intake)  │    │ (firm console)      │    │ (client portal)  │
    └─────────┬────────┘    └──────────┬──────────┘    └────────┬─────────┘
              │                        │                         │
              │   tRPC / REST over HTTPS                          │
              └────────────────────────┼─────────────────────────┘
                                       │
                            ┌──────────▼──────────────┐
                            │  apps/api (NestJS)      │
                            │  • Tenant interceptor   │
                            │  • Auth guard (Clerk)   │
                            │  • RLS context setter   │
                            │  • CRUD / business logic│
                            │  • Inngest event sender │
                            └─────┬───────────┬───────┘
                                  │           │
              ┌───────────────────┘           └─────────────┐
              │                                              │
   ┌──────────▼─────────┐                       ┌────────────▼──────────┐
   │ Inngest            │                       │ services/ml (FastAPI) │
   │ • Durable workflows│                       │ • OCR (Textract)      │
   │ • Cron schedules   │◄──── HTTP webhook ────┤ • Doc classification  │
   │ • Event bus        │                       │ • Embeddings          │
   │ • Retries          │                       │ • RAG retrieval       │
   └──────────┬─────────┘                       │ • Memo generation     │
              │                                 └────────────┬──────────┘
              │                                              │
   ┌──────────▼──────────────────────────────────────────────▼──────────┐
   │              packages/db (Drizzle ORM)                             │
   │   tenant-scoped query client + RLS context + audit triggers       │
   └──────────┬──────────────────────────────────────────────┬──────────┘
              │                                              │
   ┌──────────▼─────────┐                       ┌────────────▼──────────┐
   │  Postgres 16       │                       │  Cloudflare R2        │
   │  + pgvector        │                       │  per-tenant prefix    │
   │  + RLS policies    │                       │  envelope encryption  │
   │  + audit_logs      │                       │  pre-signed PUT/GET   │
   │  (Neon)            │                       └───────────────────────┘
   └─────────┬──────────┘
             │
             │ event triggers (NOTIFY)
             ▼
   ┌────────────────────┐
   │ Audit log stream   │
   │ → Sentry           │
   │ → Langfuse (LLM)   │
   │ → OpenTelemetry    │
   └────────────────────┘
```

## 4. Service responsibilities

### 4.1 `apps/web` — Next.js 15 (App Router)

One Next.js app, three subdomains. A Vercel Edge Middleware function sniffs the host header and rewrites to the right route group:

```
/apps/web/src/app/
├── (firm)/              ← app.{firm-slug}.io
│   ├── dashboard/
│   ├── cases/
│   ├── clients/
│   ├── leads/
│   ├── forms/
│   ├── deadlines/
│   ├── agent/
│   ├── billing/
│   ├── reports/
│   └── admin/
├── (portal)/            ← my.{firm-slug}.io
│   ├── cases/
│   ├── documents/
│   ├── messages/
│   ├── invoices/
│   └── opportunities/
├── (public)/            ← apply.{firm-slug}.io
│   ├── start/
│   ├── thank-you/
│   └── languages/
└── api/                 ← Next.js API routes for SSR-only concerns
```

The middleware also resolves `tenant_id` from the subdomain and injects it into the request context as a header (`x-tenant-id`) consumed downstream.

The web app uses **TanStack Query** to call the NestJS API over tRPC. Server Components pre-render whatever is cacheable; mutations go through tRPC client.

### 4.2 `apps/api` — NestJS (Node 20)

The main backend. Owns:

- Authentication (verifying Clerk JWTs)
- Tenant context (extracting `org_id` from JWT, mapping to `tenant_id`, setting `app.current_tenant` on the Postgres session)
- Authorization (role-based, plus per-resource ownership checks)
- All CRUD over Drizzle
- Business logic that doesn't need ML
- Sending events to Inngest
- Webhooks from Stripe, DocuSign, Postmark inbound, USCIS receipts (when available)

NestJS module layout:

```
/apps/api/src/
├── main.ts
├── app.module.ts
├── common/
│   ├── tenant.interceptor.ts     ← sets app.current_tenant from JWT
│   ├── audit.interceptor.ts      ← writes audit_logs entries
│   ├── auth.guard.ts             ← Clerk JWT validation
│   └── role.guard.ts
├── modules/
│   ├── tenants/
│   ├── users/
│   ├── candidates/
│   ├── cases/
│   ├── case-types/
│   ├── documents/
│   ├── forms/
│   ├── exhibits/
│   ├── deadlines/
│   ├── assessments/
│   ├── support-letters/
│   ├── research/
│   ├── opportunities/
│   ├── contracts/
│   ├── billing/
│   ├── trust-ledger/
│   ├── messages/
│   ├── meetings/
│   ├── agent/
│   └── audit/
└── webhooks/
    ├── clerk.controller.ts
    ├── stripe.controller.ts
    ├── docusign.controller.ts
    ├── postmark-inbound.controller.ts
    └── inngest.controller.ts
```

### 4.3 `services/ml` — FastAPI (Python 3.12)

Stateless. Receives JSON over HTTP from Inngest workers. Owns:

- OCR (AWS Textract for production, Tesseract for dev)
- Document classification (which evidence criteria does this support?)
- Metadata extraction (publication name, citation count, dates)
- Embeddings (OpenAI `text-embedding-3-large` initially)
- RAG retrieval (queries Postgres pgvector via shared connection)
- Memo generation (calls Claude with retrieval context, validates citations)
- LLM observability (Langfuse)

```
/services/ml/
├── pyproject.toml
├── src/
│   ├── main.py                  ← FastAPI app
│   ├── routers/
│   │   ├── ocr.py
│   │   ├── classify.py
│   │   ├── embed.py
│   │   ├── retrieve.py
│   │   └── generate.py
│   ├── pipelines/
│   │   ├── document.py          ← OCR → classify → metadata → embed
│   │   └── research.py          ← retrieve → generate → validate citations
│   ├── llm/
│   │   ├── client.py            ← Claude + OpenAI abstraction
│   │   └── prompts/
│   ├── db.py                    ← psycopg connection w/ tenant context
│   └── observability.py
└── tests/
```

The ML service does NOT bypass RLS. Every request from Inngest carries a tenant context token; the service verifies it and sets `app.current_tenant` on its own DB connection before any query.

### 4.4 Inngest — workflow + event bus

The glue between everything. Used for:

| Trigger | Function | Outcome |
|---|---|---|
| `document.uploaded` | `processDocument` | OCR → classify → embed → re-trigger assessment |
| `case.created` | `bootstrapCase` | Generate intake checklist, assign default tasks |
| `case.stage_changed` | `recordAuditAndNotify` | Audit log + notify case manager |
| `assessment.requested` | `runAssessment` | Pull docs → call ML service → write criteria_scores |
| `cron: every 6h` | `brendaTick` | Iterate cases needing nudge → draft outbound → log |
| `cron: daily 4am` | `pollUscisReceipts` | Scrape USCIS case status for every active receipt |
| `cron: monthly 1st` | `scrapeVisaBulletin` | Update visa_bulletin table |
| `stripe.webhook.invoice_paid` | `processPayment` | Apply to trust ledger, mark installment |
| `docusign.webhook.envelope_signed` | `markContractSigned` | Update contract, kick off intake stage |
| `postmark.inbound.email` | `routeInboundEmail` | Match to thread, attach to case, notify owner |
| `cron: every 15 min` | `escalateOverdueDeadlines` | Find <7d deadlines with no progress, ping attorney |

Inngest functions live in `apps/api/src/inngest/` and are invoked by the Inngest service via webhook. Each function gets retries, durability, and built-in observability. Brenda is just one of these functions.

### 4.5 `packages/db` — Drizzle schema

The single source of truth for the database. Exports:

- `schema.ts` — every table, every column, every relation
- `migrations/` — generated SQL files
- `rls.sql` — row-level security policies (applied as a migration)
- `tenant-client.ts` — wrapper that requires a tenant context and refuses to query without one
- `audit-trigger.sql` — Postgres trigger that writes to `audit_logs` on every INSERT/UPDATE/DELETE for tracked tables

```typescript
// packages/db/src/tenant-client.ts
export function getTenantDb(tenantId: string) {
  return {
    async withTransaction<T>(fn: (tx: TenantTx) => Promise<T>): Promise<T> {
      return db.transaction(async (tx) => {
        await tx.execute(sql`SELECT set_config('app.current_tenant', ${tenantId}, true)`);
        return fn(tx as TenantTx);
      });
    },
  };
}
```

Every API request handler grabs the tenant DB once and threads it through. Bypassing this requires the `app_admin` role, which is only available in migration scripts — never in a request handler.

### 4.6 `packages/case-types` — case type registry

TypeScript+Zod definitions for every case type. Loaded at boot, validated, exposed as a registry. Adding a new case type is a code change, not a schema change. See [decisions.md ADR-0014](decisions.md#adr-0014).

### 4.7 `packages/forms` — USCIS form library

Each supported form has:

- The original PDF template (committed to the repo, edition-tagged)
- A field map (YAML) — USCIS field name → case data path + transform
- A Zod validator for the data shape that fills it
- A renderer that produces a flattened, fillable PDF on demand

Phase 1 ships 10 forms: G-28, I-130, I-130A, I-485, I-765, I-131, I-129, I-140, N-400, I-589, I-751.

### 4.8 `packages/shared` — shared types & utilities

- TypeScript types shared between `apps/web` and `apps/api`
- Zod schemas (single source of truth for validation)
- `llm.ts` — the LLM abstraction layer (Anthropic primary, OpenAI fallback)
- `auth.ts` — `getCurrentUser()`, `getCurrentTenant()` (the Clerk-isolation layer per ADR-0002)
- `errors.ts` — typed error classes

### 4.9 `packages/ui` — shadcn/ui component library

Pre-themed for the firm console. Per-tenant theming via CSS variables resolved from `tenants.branding`.

## 5. Data flow examples

### 5.1 Candidate uploads a CV via branded intake

1. Visitor lands on `apply.swagatusa.io/start`. Edge middleware resolves `swagatusa` → `tenant_id`. The page is rendered with that tenant's branding.
2. Visitor fills the form, drops a CV (PDF), clicks Continue.
3. Browser asks `apps/api` for a pre-signed R2 PUT URL: `POST /api/intake/upload-url`. The handler creates a `documents` row with `status=uploading`, encrypts a DEK with the tenant's KMS key, returns `{put_url, document_id}`.
4. Browser uploads the encrypted bytes directly to R2.
5. Browser POSTs the form data + `document_id` to `POST /api/intake/submit`.
6. Handler creates `candidate`, `case` (with case type chosen by AI based on form answers + CV preview), and dispatches `document.uploaded` to Inngest.
7. Inngest function `processDocument` calls the ML service: OCR, classify (which criteria does this support?), extract metadata, embed, write back.
8. After processing, Inngest triggers `assessment.requested` for the case. `runAssessment` pulls all docs, calls Claude with the EB-1A rubric (or whatever case type), writes `criteria_scores`.
9. Case appears in the firm console dashboard with a live AI score. Case manager gets a Slack-like notification.

### 5.2 Attorney drafts a support letter

1. Attorney opens a case, clicks "Draft support letter" in the support letters tab.
2. They pick a recommender from the AI-suggested list (sourced from OpenAlex + LinkedIn).
3. `POST /api/cases/:id/support-letters` with `{recommender_id, criterion_code}`. Handler creates a `support_letters` row in `status=drafting`, dispatches `letter.draft_requested` to Inngest.
4. Inngest function calls ML service `/generate/support-letter` with retrieval over the case's evidence + recommender's publications.
5. ML service builds the prompt, calls Claude Opus, validates citations against retrieved chunks, returns DOCX content as base64.
6. NestJS uploads the DOCX to R2 (encrypted), updates the row `status=draft_ready`, marks `requires_attorney_approval=true`.
7. Attorney sees a notification, opens the draft in the UI with the yellow ribbon `DRAFT — REQUIRES ATTORNEY REVIEW`.
8. Attorney edits, clicks Approve → `POST /api/support-letters/:id/approve`. Server validates the user's role, removes the watermark, generates a final-version DOCX, writes an audit entry.

### 5.3 Brenda nudges a stale candidate

1. Cron `every 6h` triggers `brendaTick` Inngest function.
2. Function queries: cases in stage `intake` or `preparation` with no client activity in 7+ days, where Brenda is enabled for the tenant, where the case has at least one open task assigned to the client.
3. For each match, function calls Claude with the case context + per-firm Brenda persona + a tool list: `[draft_email, draft_sms, escalate_to_human, do_nothing]`.
4. Claude returns a structured response choosing a tool with arguments.
5. Function logs a row to `agent_actions` with the prompt, model, tools used, output, and the policy gate result.
6. If the firm's policy allows auto-send for this action type AND the UPL filter passes AND the kill switch is off → send immediately. Otherwise → save as a draft, surface in `/agent` queue, attorney must approve.
7. Audit log entry written either way.

### 5.4 Cross-tenant isolation, in code

```typescript
// apps/api/src/modules/cases/cases.controller.ts
@Controller('cases')
export class CasesController {
  @UseGuards(AuthGuard)
  @UseInterceptors(TenantInterceptor)  // <-- sets app.current_tenant
  @Get(':id')
  async getCase(@Req() req, @Param('id') id: string) {
    const db = getTenantDb(req.tenant.id);  // <-- enforces tenant scope
    return db.withTransaction(async (tx) => {
      const result = await tx.select().from(cases).where(eq(cases.id, id));
      // Even if `id` is from a different tenant, RLS returns 0 rows
      // because `app.current_tenant` is set to req.tenant.id.
      return result[0] ?? null;  // -> 404 if cross-tenant
    });
  }
}
```

The `TenantInterceptor` runs BEFORE the handler. The `getTenantDb` call FAILS LOUD if the interceptor didn't set the context. The RLS policy on `cases` is `USING (tenant_id = current_setting('app.current_tenant', true)::uuid)`. Three layers of defense.

## 6. Security and privacy

### 6.1 At rest
- Postgres encrypted at rest by Neon (AES-256, AWS KMS).
- R2 documents encrypted with **per-tenant data keys** wrapped by a master KMS key (envelope encryption). Even a stolen R2 bucket leaks ciphertext.
- Backups encrypted, retention 30 days.

### 6.2 In transit
- TLS 1.2+ everywhere.
- Internal service-to-service calls use mutual TLS or signed tokens.

### 6.3 Authentication
- Clerk for staff (SSO via SAML on Pro plan).
- Passwordless magic-link for candidates.
- MFA enforced for all firm admin and attorney roles.

### 6.4 Authorization
- Role-based: `firm_admin`, `attorney`, `case_manager`, `paralegal`, `candidate`, `recommender`.
- Resource-based: candidates see only their own cases; case managers see only assigned cases; attorneys see firm-wide; firm admins see firm-wide + admin.
- Enforced in the API layer via NestJS guards. RLS is the second line of defense, not the only one.

### 6.5 PII handling
- Candidate documents are stored encrypted, accessed via signed URLs that expire in 5 minutes.
- Logs scrub PII before shipping to Sentry.
- Langfuse traces redact prompt inputs that match PII patterns (SSN, A-numbers, email addresses) before storage.
- Right-to-erasure endpoint deletes a candidate's data on request, subject to attorney legal-hold override.

### 6.6 Audit
- `audit_logs` table append-only, with a Postgres trigger on every business table.
- Every API mutation produces an entry: `{actor_user_id, tenant_id, table, record_id, action, before, after, ip, user_agent, ts}`.
- Retention: 10 years (immigration cases have long tails).

## 7. Observability

| Layer | Tool | What we measure |
|---|---|---|
| App errors | Sentry | Unhandled exceptions, performance, releases |
| LLM calls | Langfuse | Model, prompt hash, tokens, latency, cost, output, eval scores |
| Traces | OpenTelemetry → Grafana Cloud | Request spans across web → api → ml |
| Logs | Pino → Better Stack (or Grafana Loki) | Structured JSON, tenant-tagged |
| Uptime | Better Stack | All public endpoints |
| Postgres | Neon dashboard + custom SQL views | Slow queries, connection counts |
| Inngest | Inngest dashboard | Function runs, failures, retries |

## 8. CI/CD

```
GitHub push → GitHub Actions:
  1. install (pnpm)
  2. lint (eslint, prettier)
  3. typecheck (tsc -b)
  4. unit tests (vitest)
  5. integration tests (vitest + testcontainers Postgres)
  6. cross-tenant isolation test (REQUIRED, blocks merge)
  7. build (turbo)
  8. preview deploy (Vercel preview, Fly.io review app)
  9. on main: production deploy
```

The cross-tenant isolation test is the gate. It spins up a Postgres in Testcontainers, creates two tenants, every entity for each, then loops: log in as tenant A, attempt every endpoint with tenant B's IDs, assert 0 rows or 403. **No PR merges if this test fails.**

## 9. Local development

```bash
# Prereqs: Node 20+, pnpm 10+, Docker, Python 3.12+
pnpm install
docker compose up -d                # Postgres 16 + pgvector + Inngest dev server
pnpm db:migrate                     # apply schema + RLS policies
pnpm db:seed                        # SwagatUSA tenant + demo users + 5 demo cases
pnpm dev                            # turbo runs web (3000) + api (4000) + ml (5000)
```

A `compose.yaml` at the root brings up Postgres with pgvector pre-installed and an Inngest dev server. The `seed` script creates a complete demo environment in <30 seconds.

## 10. What changes when we add a tenant

Adding a new firm to production:

1. Firm admin signs up via `app.example.io/onboarding` (Clerk-hosted).
2. Webhook from Clerk (`organization.created`) hits our API → creates a `tenants` row, generates a per-tenant KMS data key, sets up branding defaults.
3. We provision a custom subdomain `app.{slug}.io` automatically (Vercel DNS API).
4. For custom domains (`app.firmname.com`), the firm admin completes a CNAME setup flow that updates Vercel and our `tenants.custom_domain` field.
5. Firm admin invites users via Clerk's UI (mirrored to `users` table by webhook).
6. No deploys, no migrations, no engineer involvement. Self-serve.

## 11. What we are NOT doing in v1

These are explicitly deferred:

- USCIS form auto-submission (we generate the packet; the firm files it manually or via USCIS online tools).
- Court e-filing outside ECAS.
- Native mobile apps.
- Non-U.S. immigration.
- An accounting suite (we integrate, not replace).
- WebSocket realtime for the dashboard (TanStack Query polling is fine until v2).
- Complex multi-region deployment (US-East only at launch).
- A marketplace for co-counsel referrals.
- Fine-tuning Claude (we use prompts + RAG + structured output).

## 12. Open questions for the human

These need decisions before Phase 0:

1. **Custom domain for SwagatUSA in production** — `app.swagatusa.io`? Or a subdomain of a parent product domain like `app.immcaseos.com/swagatusa`?
2. **Anthropic, OpenAI, Clerk, Stripe, DocuSign, Postmark, Twilio API keys** — who creates the accounts? Test mode for v1 is fine but production needs real accounts.
3. **R2 vs S3** — locked to R2 in ADR-0007, but if you already have AWS infrastructure we can switch.
4. **Hosting budget** — is the $150-300/mo run rate for pre-launch acceptable?
5. **Existing folders** (`stitch-flow`, `stitchboat-counselai`) — read these before Phase 0?
