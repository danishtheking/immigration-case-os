# Immigration Case OS

> A multi-tenant SaaS operating system for U.S. immigration law firms — covers every major case category (family, employment, humanitarian, nonimmigrant, naturalization, removal defense, corporate compliance) with an AI assessment layer for EB-1A / EB-2 NIW / O-1.
>
> **Status:** Pre-Phase-0. Architecture docs only. No code yet.

---

## What this is

A working clone (and superset) of:

- **Ponte / PonteMobility** — AI assessment, legal research, opportunity bank, agent
- **Docketwise / eImmigration / LollyLaw / INSZoom** — case management, forms engine, deadlines, IOLTA billing, client portal
- **LegalBridge** — AI drafting (RFE responses, support letters, briefs)

Built for **SwagatUSA** as the first tenant, designed multi-tenant from day one so additional firms can onboard without a re-architecture.

## What this is not (v1)

- Not a USCIS form-filing service (we generate the packet; the firm files it)
- Not a tax/accounting suite (we integrate with QuickBooks/Xero, we don't replace them)
- Not a non-U.S. immigration system (Canada/UK/EU is v2+)
- Not a court e-filing system outside ECAS
- Not a native mobile app (responsive web only)

## Repo layout (planned)

```
immigration-case-os/
├── README.md                  ← you are here
├── docs/
│   ├── architecture.md        ← system design, services, data flow
│   ├── data-model.md          ← full Drizzle schema, RLS policies
│   ├── sequence-diagrams.md   ← key workflows in mermaid
│   ├── decisions.md           ← index of architecture decision records
│   ├── build-plan.md          ← sprint-by-sprint roadmap
│   ├── adr/                   ← individual decision records
│   │   ├── 0001-multi-tenancy-strategy.md
│   │   ├── 0002-auth-provider.md
│   │   ├── 0003-orm-choice.md
│   │   └── ...
│   └── features/              ← per-feature design docs (added as built)
├── apps/
│   ├── web/                   ← Next.js 15 (firm console + intake + portal)
│   └── api/                   ← NestJS (Node 20)
├── services/
│   └── ml/                    ← FastAPI (Python 3.12) — OCR, embeddings, RAG
├── packages/
│   ├── db/                    ← Drizzle schema + migrations + RLS helpers
│   ├── shared/                ← shared TypeScript types, Zod schemas
│   ├── ui/                    ← shadcn/ui component library
│   ├── case-types/            ← JSON definitions for each case type
│   └── forms/                 ← PDF templates + field maps for USCIS forms
├── scripts/
│   ├── seed/                  ← demo data scripts
│   └── ops/                   ← migration helpers, isolation tests
├── infra/
│   └── terraform/             ← cloud infrastructure as code
└── .github/
    └── workflows/             ← CI: lint, test, build, isolation tests
```

## Getting started (after Phase 0 ships)

```bash
# Prereqs: Node 20+, pnpm 10+, Docker Desktop
pnpm install
docker compose up -d              # Postgres 16 with pgvector
pnpm db:migrate                   # apply Drizzle migrations + RLS policies
pnpm db:seed                      # create the SwagatUSA tenant + demo users
pnpm dev                          # runs web + api + ml in parallel
```

## Read these in order

1. [docs/decisions.md](docs/decisions.md) — why we picked this stack
2. [docs/architecture.md](docs/architecture.md) — the system in pictures + words
3. [docs/data-model.md](docs/data-model.md) — every table, every RLS policy
4. [docs/sequence-diagrams.md](docs/sequence-diagrams.md) — the workflows
5. [docs/build-plan.md](docs/build-plan.md) — what we build, in what order

## Source documents

This project is built from three source specs in `D:\Danish\STITCH BOAT\`:

- `BUILD-INSTRUCTIONS-FOR-CODING-AGENT.md` — the engineering brief
- `Case-Management-System-Spec.md` — the case-type scope (this is authoritative for case-type breadth)
- `Ponte-Competitor-Feature-Research.md` — the AI/agent feature scope
- `ui-reference-mockups.html` — 12 reference UI screens
