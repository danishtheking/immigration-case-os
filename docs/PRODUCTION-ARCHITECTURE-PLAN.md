# Production Architecture Plan — Immigration Case OS v2

> From POC demo → production-grade SaaS that is **5x better than CaseBlink**.
>
> Based on feedback: Rust/Go microservices, Svelte frontend, local LLM support, S3 storage, dockerized and scalable.

---

## 1. What CaseBlink does (our benchmark)

[CaseBlink](https://caseblink.com) raised $2M pre-seed, 50+ law firms, 1,000+ cases. Their three pillars:

| Pillar | What CaseBlink does | Where we beat them |
|---|---|---|
| **Document understanding** | AI reads docs, extracts info, tags types, organizes exhibits | We do the same + real-time classification + per-tenant encryption |
| **Research** | Agentic search across USCIS Policy Manual + AAO decisions + O*NET + DOL wages | We do the same + Opportunity Bank (CFPs, awards, judging) + Visa Bulletin auto-scrape |
| **Drafting** | RFE responses, support letters, cover letters in user's style | We do the same + full petition packets + form auto-fill + exhibit builder |
| **Client portal** | Basic — upload docs, complete intakes | We have full portal: case status, messaging, e-sign, payments, opportunities |
| **CRM / Pipeline** | None | Full leads pipeline, intake, engagement tracking |
| **Billing / IOLTA** | None | Trust ledger, multi-currency, installment plans |
| **AI Agent** | None (manual AI tools) | CounselAI — autonomous agent that OPERATES the software with screen control |
| **Messaging** | Email only | Omnichannel: WhatsApp, email, SMS, in-app (StitchFlow built-in) |
| **Multi-tenant** | Unknown | Full RLS isolation, white-label, per-firm branding |
| **Local LLM** | No (cloud-only) | Hybrid: local LLM for most tasks, cloud for complex (cost 10x lower) |

**The 5x advantage: CaseBlink is a document tool. We are the entire firm operating system.**

---

## 2. Tech stack (production)

### What changes from the POC

| Layer | POC (current) | Production | Why |
|---|---|---|---|
| **Frontend** | Next.js 15 + React 19 | **SvelteKit** + Svelte 5 | Lighter, faster, better DX per partner preference |
| **Backend** | NestJS (Node) | **Go microservices** | 10x performance, lower memory, better concurrency |
| **ML / AI** | FastAPI (Python) | **Rust service** for doc pipeline + **Go** for LLM orchestration | Rust for CPU-intensive OCR/parsing, Go for API orchestration |
| **Database** | Neon (Postgres) | **Supabase** (Postgres + Auth + Realtime + Storage) | All-in-one: auth, RLS, realtime subscriptions, file storage |
| **Storage** | Cloudflare R2 | **S3** (AWS) | Partner preference, Textract integration, KMS native |
| **LLM** | Anthropic Claude only | **Hybrid: local LLM + cloud** | Local (Llama/Mistral via Ollama) for 80% of tasks, Claude for complex |
| **Auth** | Clerk | **Supabase Auth** | Integrated with the DB, SSO via SAML, cheaper |
| **Deployment** | Vercel + Fly.io | **Docker + Kubernetes** (AWS EKS or Railway) | Scalable, each service independent, auto-scaling |
| **Messaging** | Postmark + Twilio | **StitchFlow engine** (built-in) | Our own omnichannel layer, no external dependency |

### What stays the same
- Postgres + pgvector + RLS (now via Supabase)
- Drizzle ORM for schema management
- The immigration knowledge base (counselai prompts, case type definitions)
- The overall product design and UX
- The architecture docs, data model, and sequence diagrams

---

## 3. Microservices architecture

```
                    ┌─────────────────────────────────────┐
                    │         SvelteKit Frontend           │
                    │    (SSR + client, served by CDN)     │
                    └──────────────┬──────────────────────┘
                                   │ REST / gRPC
                    ┌──────────────▼──────────────────────┐
                    │          API Gateway (Go)            │
                    │  • Auth (Supabase JWT verification)  │
                    │  • Rate limiting                     │
                    │  • Tenant context injection          │
                    │  • Request routing                   │
                    └──┬───────┬───────┬───────┬──────────┘
                       │       │       │       │
          ┌────────────┘       │       │       └────────────┐
          │                    │       │                     │
  ┌───────▼───────┐  ┌────────▼────┐  │  ┌──────────────┐  │
  │ Case Service  │  │ Doc Service │  │  │ Agent Service│  │
  │ (Go)          │  │ (Rust)      │  │  │ (Go)         │  │
  │               │  │             │  │  │              │  │
  │ • CRUD cases  │  │ • Upload    │  │  │ • CounselAI  │  │
  │ • Candidates  │  │ • OCR       │  │  │ • Brenda     │  │
  │ • Forms       │  │ • Classify  │  │  │ • Tool-use   │  │
  │ • Deadlines   │  │ • Embed     │  │  │ • Local LLM  │  │
  │ • Assessments │  │ • S3 store  │  │  │ • Cloud LLM  │  │
  └───────┬───────┘  └────────┬────┘  │  └──────┬───────┘  │
          │                    │       │         │          │
          │            ┌───────▼────┐  │         │          │
          │            │ Research   │  │         │   ┌──────▼───────┐
          │            │ Service    │  │         │   │ Comms Service│
          │            │ (Go)       │  │         │   │ (Go)         │
          │            │            │  │         │   │              │
          │            │ • RAG      │  │         │   │ • WhatsApp   │
          │            │ • pgvector │  │         │   │ • Email      │
          │            │ • Citations│  │         │   │ • SMS        │
          │            │ • V.Bulletin│ │         │   │ • In-app     │
          │            └────────┬───┘  │         │   └──────┬───────┘
          │                     │      │         │          │
  ┌───────▼─────────────────────▼──────▼─────────▼──────────▼───────┐
  │                    Supabase (Postgres + pgvector + RLS)          │
  │                    + S3 (document storage)                       │
  │                    + Redis (caching + pub/sub)                   │
  └─────────────────────────────────────────────────────────────────┘
```

### Service breakdown

| Service | Language | Responsibility | Why this language |
|---|---|---|---|
| **API Gateway** | Go | Auth, routing, rate limiting, tenant context | Go excels at high-concurrency HTTP proxying |
| **Case Service** | Go | Cases, candidates, forms, deadlines, assessments, billing | Business logic, CRUD, moderate complexity |
| **Document Service** | Rust | Upload, OCR, classification, embedding, S3 | CPU-intensive parsing, memory safety, 10x faster than Python for OCR |
| **Research Service** | Go | RAG retrieval, citation validation, Visa Bulletin scraping | Vector search orchestration, HTTP client work |
| **Agent Service** | Go | CounselAI, Brenda, LLM routing (local vs cloud) | Orchestrates tool-use, manages agent state |
| **Comms Service** | Go | WhatsApp, email, SMS, in-app messaging (StitchFlow) | Webhook handling, message routing |

### Inter-service communication

- **Synchronous**: gRPC between services (type-safe, fast, streaming)
- **Asynchronous**: Redis pub/sub for events (doc.uploaded, case.stage_changed, etc.)
- **No service depends on another being up** — each can degrade gracefully
- If Document Service is down → uploads queue in Redis → processed when it's back

---

## 4. Local LLM strategy

The key cost and privacy advantage over CaseBlink.

```
┌─────────────────────────────────────────────────────┐
│                  LLM Router (Go)                     │
│                                                      │
│  Task comes in → classify complexity → route:        │
│                                                      │
│  ┌──────────────────┐     ┌──────────────────────┐  │
│  │  Local LLM        │     │  Cloud LLM            │  │
│  │  (Ollama / vLLM)  │     │  (Claude / GPT-4o)    │  │
│  │                    │     │                        │  │
│  │  Llama 3.3 70B    │     │  Claude Sonnet 4.6    │  │
│  │  or Mistral Large │     │  Claude Opus 4.6      │  │
│  │                    │     │                        │  │
│  │  Handles 80%:     │     │  Handles 20%:          │  │
│  │  • Doc classify   │     │  • Complex assessment  │  │
│  │  • Form auto-fill │     │  • Legal research memo │  │
│  │  • Status updates │     │  • RFE response draft  │  │
│  │  • Chat responses │     │  • Petition drafting   │  │
│  │  • Metadata extract│    │  • Novel legal analysis│  │
│  │  • Simple search  │     │                        │  │
│  │                    │     │  Cost: ~$0.50/case     │  │
│  │  Cost: $0/case     │     │                        │  │
│  └──────────────────┘     └──────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Cost comparison:**
- CaseBlink (cloud-only): estimated $2-5 per case in LLM costs
- Us (hybrid): $0.10-0.50 per case (80% local, 20% cloud)
- At 1,000 cases/month: CaseBlink ~$3,000/mo LLM cost, us ~$300/mo

---

## 5. Database schema (Supabase)

Same schema as the POC (docs/data-model.md) but deployed on Supabase:
- **40+ tables** with RLS on every tenant-scoped table
- **pgvector** for embeddings (legal research, opportunity matching)
- **Supabase Realtime** for live updates (case stage changes, new messages, agent actions)
- **Supabase Auth** replaces Clerk (SSO via SAML for enterprise firms)
- **Supabase Storage** for small files; **S3** for large documents (>10MB)

---

## 6. Build phases (production)

### Phase 1 — Foundation (Weeks 1-4)
**Goal:** Monorepo setup, Supabase, API Gateway, Case Service, SvelteKit shell

- [ ] SvelteKit app with Supabase Auth (sign-up, org creation, login)
- [ ] Go API Gateway with JWT verification + tenant context
- [ ] Go Case Service: cases, candidates CRUD with RLS
- [ ] Supabase schema migration (same 40 tables from POC)
- [ ] Cross-tenant isolation test (same test, Go version)
- [ ] Docker Compose for local dev (all services + Supabase + Redis)
- [ ] CI: lint, test, isolation test on every PR

**Done when:** Create tenant → invite user → create case → see it in the dashboard.

### Phase 2 — Document Pipeline (Weeks 5-8)
**Goal:** Upload, OCR, classify, embed — in Rust for speed

- [ ] Rust Document Service: S3 upload, OCR (Tesseract + Textract), classification
- [ ] Per-tenant encryption (S3 SSE-KMS with per-tenant keys)
- [ ] LLM Router: local Ollama for classification, cloud Claude for complex
- [ ] pgvector embeddings (text-embedding-3-large or local e5-large)
- [ ] Document tab in SvelteKit frontend
- [ ] Re-trigger assessment on doc upload (Redis event → Agent Service)

### Phase 3 — AI Assessment + Research (Weeks 9-12)
**Goal:** Real EB-1A/NIW/O-1 scoring, legal research RAG

- [ ] Assessment engine in Agent Service (per-criterion scoring)
- [ ] Legal corpus ingestion (USCIS PM, AAO, 8 CFR)
- [ ] RAG retrieval with citation safety (refuse below threshold)
- [ ] Research memo generation with Bluebook citations
- [ ] Eval harness: 50 test candidates, regression on prompt change
- [ ] Assessment drill-down UI in SvelteKit

### Phase 4 — Forms + Drafting (Weeks 13-16)
**Goal:** Auto-fill USCIS forms, draft petitions and letters

- [ ] PDF form auto-fill engine (Rust: pdf-lib equivalent in Rust)
- [ ] 10 form templates with YAML field maps
- [ ] Petition cover brief drafting (Claude Opus)
- [ ] RFE response drafting with RAG context
- [ ] Support letter drafting per criterion
- [ ] Exhibit builder: drag-and-drop, bates numbering, TOC
- [ ] Filing packet assembly (combined PDF)

### Phase 5 — CounselAI Agent (Weeks 17-20)
**Goal:** Real AI agent with tool-use that operates the software

- [ ] Agent Service: Claude Agent SDK / local LLM with tool-use
- [ ] Tool definitions: search_cases, update_stage, draft_document, send_message, create_case, run_assessment
- [ ] Permission gate: destructive actions require user approval
- [ ] UPL filter: blocks legal-advice-shaped outputs
- [ ] CounselAI UI: sliding panel with real-time streaming responses
- [ ] Brenda cron: stale-case nudging with human-in-the-loop
- [ ] Eval harness: 50 scripted scenarios, regression on prompt change

### Phase 6 — Communications / StitchFlow (Weeks 21-24)
**Goal:** Omnichannel messaging integrated into every case

- [ ] Comms Service: WhatsApp Business API, Postmark, Twilio SMS
- [ ] Inbound parsing: auto-route messages to correct case thread
- [ ] Template responses per case stage
- [ ] AI-suggested replies (CounselAI + case context)
- [ ] Firm-wide inbox + per-case Messages tab
- [ ] Client portal messaging

### Phase 7 — Billing + Client Portal (Weeks 25-28)
**Goal:** Trust accounting, payments, client self-service

- [ ] Stripe Connect + Airwallex for multi-currency
- [ ] Trust ledger (IOLTA-aware, 3-way reconciliation)
- [ ] Installment plans via Stripe Billing
- [ ] Client portal: case status, doc upload, e-sign, pay invoices
- [ ] DocuSign integration for engagement letters

### Phase 8 — Hardening (Weeks 29-32)
**Goal:** Production-ready, SOC 2, performance tested

- [ ] SOC 2 Type II prep (Vanta)
- [ ] Pen test (third-party)
- [ ] Load test: 100 concurrent users, 10K cases per tenant
- [ ] Kubernetes deployment (AWS EKS or Railway)
- [ ] Auto-scaling policies per service
- [ ] Monitoring: Grafana + Prometheus + Sentry
- [ ] Disaster recovery runbook

---

## 7. What makes us 5x better than CaseBlink

| Dimension | CaseBlink | Us | Multiplier |
|---|---|---|---|
| **Scope** | Document prep tool | Full firm OS (cases + CRM + billing + messaging + agent) | 5x broader |
| **AI Agent** | Manual AI tools | Autonomous agent that operates the entire software | CaseBlink has nothing like this |
| **Cost per case** | ~$3 cloud LLM | ~$0.30 hybrid (80% local LLM) | 10x cheaper |
| **Messaging** | Email only | WhatsApp + Email + SMS + in-app | 4 channels vs 1 |
| **Client portal** | Basic upload | Full self-service (status, messages, payments, opportunities) | 5x richer |
| **Performance** | Node/Python | Rust doc pipeline + Go services | 10x faster processing |
| **Multi-tenant** | Unknown | Full RLS + per-tenant encryption + white-label | Enterprise-ready |
| **Local LLM** | No | Yes — runs on firm's own hardware for privacy | CaseBlink can't offer this |

---

## 8. Team needed

| Role | Count | Responsibility |
|---|---|---|
| **Go backend** | 2 | API Gateway, Case Service, Research Service, Agent Service |
| **Rust backend** | 1 | Document Service (OCR, parsing, embedding) |
| **Svelte frontend** | 1-2 | SvelteKit app, all UI pages, CounselAI panel |
| **ML / AI** | 1 | LLM routing, eval harness, prompt engineering, local LLM setup |
| **DevOps** | 1 | Docker, K8s, CI/CD, monitoring, SOC 2 |
| **Product / Design** | 1 | UX research, Figma, user testing |

**Total: 7-8 engineers for 8 months to production.**

Or with AI-assisted development (Claude Code / Cursor):
**4-5 engineers for 8 months.**

---

## 9. Immediate next steps

1. **Keep the POC live** at immigration-case-os-web.vercel.app — use it for demos and investor conversations
2. **Set up the production monorepo** — Go + Rust + SvelteKit + Docker Compose
3. **Supabase project** — create the project, apply the schema, set up RLS
4. **API Gateway** — first Go service, JWT auth, tenant context
5. **Case Service** — second Go service, CRUD for cases/candidates
6. **SvelteKit shell** — auth flow, dashboard, cases list (port from Next.js)
7. **Document Service** — Rust, S3 upload, OCR, classification

**The POC frontend designs, data model, and architecture docs are directly reusable.** The backend gets rebuilt; the product stays the same.

---

## 10. What we keep from the POC

| Asset | Reusable? | How |
|---|---|---|
| Architecture docs (decisions, data model, sequence diagrams) | **100%** | Same architecture, different languages |
| Database schema (40 tables, RLS policies) | **100%** | Port Drizzle → Supabase migrations |
| Immigration prompts (6 counselai skills) | **100%** | Same prompts, different LLM router |
| Case type definitions | **100%** | Same JSON/YAML, loaded by Go services |
| UI designs and page layouts | **90%** | Port from React/Next.js → Svelte/SvelteKit |
| CounselAI panel design + demo scripts | **80%** | Same UX, real AI backend instead of scripted |
| Cross-tenant isolation test logic | **100%** | Same test, Go version |
| Build plan and sprint structure | **80%** | Same phases, adjusted for new stack |

---

*This plan plus the live POC demo at immigration-case-os-web.vercel.app is the package for the next conversation.*
