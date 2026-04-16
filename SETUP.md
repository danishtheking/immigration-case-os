# Local Development Setup

> Step-by-step guide to run Immigration Case OS Sprint 1 (Phase 0) on your local machine. Follow it top to bottom the first time. Bookmark the [Troubleshooting](#troubleshooting) section.

---

## What you should have before you start

These are already verified on this Windows machine:

| Tool | Version found | Purpose |
|---|---|---|
| Node.js | v24.14.0 | Runtime for Next.js, NestJS, scripts |
| pnpm | 10.30.3 | Package manager (workspaces) |
| Git | 2.53.0 | Version control |
| Docker Desktop | 29.2.1 | Postgres + Inngest containers |
| Python | 3.14.3 | services/ml (only needed for Sprint 3+) |

**Open Docker Desktop and make sure it's running.** All the Postgres bits depend on it.

---

## Step 1 — Install dependencies

Already done if you're following from the previous session. If not:

```bash
cd "D:/Danish/STITCH BOAT/immigration-case-os"
pnpm install
```

This pulls 541 packages and takes about a minute. You'll see one warning about deprecated subdependencies — ignore it.

---

## Step 2 — Start Postgres + Inngest

```bash
pnpm compose:up
```

What this does:
- Pulls and starts a `pgvector/pgvector:pg16` container named `ico-postgres` on port `5432`
- Mounts `packages/db/init/00-roles.sql` so on first boot it creates the `app_tenant` role and installs the `vector` and `uuid-ossp` extensions
- Pulls and starts an `inngest/inngest:latest` container named `ico-inngest` on port `8288` (you can ignore this until Sprint 7 — the dev server is just there so the API has somewhere to send events)

Verify Postgres is up:

```bash
docker ps --filter name=ico-postgres
```

You should see `ico-postgres` with status `Up` and `(healthy)`.

If you want to see the database directly:

```bash
docker exec -it ico-postgres psql -U app_admin -d immcaseos
# inside psql:
\du           -- list roles, you should see app_admin and app_tenant
\dx           -- list extensions, you should see vector and uuid-ossp
\q
```

To shut everything down later: `pnpm compose:down`.

---

## Step 3 — Apply migrations + RLS policies + audit triggers

```bash
pnpm db:migrate
```

What this does (read [packages/db/src/migrate.ts](packages/db/src/migrate.ts) for the full code):

1. Connects as `app_admin` (BYPASSRLS)
2. Applies the Drizzle migration in `packages/db/migrations/0000_initial.sql` — creates `tenants`, `users`, `audit_logs` tables and the two enums
3. Iterates `RLS_TABLES` in `packages/db/src/rls-tables.ts` (currently just `users`) and applies:
   - `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
   - `ALTER TABLE ... FORCE ROW LEVEL SECURITY`
   - `CREATE POLICY tenant_isolation ... USING (tenant_id = current_setting('app.current_tenant', true)::uuid)`
   - Grants for `app_tenant` role
4. Applies `packages/db/sql/audit-trigger.sql` — defines the `write_audit_log()` function as `SECURITY DEFINER`
5. Attaches the audit trigger to every RLS table + the `tenants` table

Expected output:

```
[migrate] connecting as app_admin (BYPASSRLS)
[migrate] applying drizzle migrations from ./migrations
[migrate] applying RLS policies for tables: [ 'users' ]
  [rls] users
[migrate] applying audit trigger function
[migrate] applying audit triggers to tenant-scoped tables
  [audit] users
[migrate] granting tenant role permissions
[migrate] done
```

If you see "permission denied to create extension" — your `00-roles.sql` didn't run because the volume already had data. Fix:

```bash
pnpm compose:down
docker volume rm immigration-case-os_ico-pgdata
pnpm compose:up
# wait 10 seconds for healthcheck
pnpm db:migrate
```

---

## Step 4 — Seed the SwagatUSA tenant

```bash
pnpm db:seed
```

This creates:
- A `tenants` row with `slug=swagatusa`, `name=SwagatUSA Immigration`, `clerk_org_id=org_seed_swagatusa`, `branding={primary_color: '#1d4ed8', agent_persona: 'Neha'}`
- A `users` row with `email=atal@swagatusa.io`, `role=firm_admin`, `clerk_user_id=user_seed_atal`

Both upserts are idempotent, so re-running is safe.

To verify:

```bash
docker exec -it ico-postgres psql -U app_admin -d immcaseos -c "SELECT id, slug, name FROM tenants;"
docker exec -it ico-postgres psql -U app_admin -d immcaseos -c "SELECT id, tenant_id, email, role FROM users;"
```

---

## Step 5 — Run the cross-tenant isolation test (THE MOST IMPORTANT STEP)

```bash
pnpm test:isolation
```

This is the test that proves multi-tenancy actually works. Read [scripts/ops/cross-tenant-test.ts](scripts/ops/cross-tenant-test.ts) for what it does.

Expected output:

```
[isolation-test] connecting as app_admin
[isolation-test] connecting as app_tenant
[isolation-test] creating two test tenants and users
[isolation-test] created tenants A=... B=...

[isolation-test] attack 1: SELECT user from tenant B while context=A
  ✅ PASS [attack-1 SELECT cross-tenant returns 0 rows]

[isolation-test] attack 2: UPDATE user in tenant B while context=A
  ✅ PASS [attack-2 UPDATE cross-tenant affects 0 rows]
  ✅ PASS [attack-2-verify B user untouched]

[isolation-test] attack 3: INSERT user with tenant_id=B while context=A
  ✅ PASS [attack-3 INSERT with foreign tenant_id blocked]

[isolation-test] attack 4: SELECT users with NO tenant context
  ✅ PASS [attack-4 SELECT without context returns 0 rows (fail-closed)]

[isolation-test] positive control: SELECT own tenant user works
  ✅ PASS [positive-control returns own tenant row]

[isolation-test] tearing down fixtures

=========================================
✅ Cross-tenant isolation: ALL PASS
=========================================
```

**If any of these fail**, do NOT proceed to Step 6. Open an issue. Treat it as a security bug. The whole architecture's safety promise is based on this test passing.

---

## Step 6 — Set up Clerk (only needed if you want to log in)

The build works without a real Clerk account (it uses placeholder keys baked into `apps/web/.env.local`). To actually sign up, sign in, and create organizations you need a real Clerk app.

### 6a. Create a Clerk application

1. Go to https://dashboard.clerk.com/sign-up
2. Sign up with your email
3. Click **Create application**
4. Name: `Immigration Case OS — dev`
5. Choose authentication providers:
   - **Email** (required)
   - **Google** (optional, faster sign-in for you)
6. Click **Create application**
7. From the API Keys page, copy:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### 6b. Enable organizations

Clerk organizations map to our tenants.

1. In the Clerk dashboard left sidebar, click **Configure** → **Organizations**
2. Toggle **Enable organizations** to ON
3. Set **Personal accounts** to **Disabled** (we want every user to belong to a firm)
4. Save

### 6c. Add a webhook endpoint

Clerk needs to tell us when an org or user is created.

1. **Configure** → **Webhooks** → **Add Endpoint**
2. **Endpoint URL**: For local dev, you need a tunnel. Use ngrok or Cloudflare Tunnel:
   ```bash
   # one-time:
   npm install -g ngrok
   ngrok http 4000
   # copy the https:// URL it shows you, e.g. https://abc123.ngrok-free.app
   ```
   Set the endpoint URL to `https://abc123.ngrok-free.app/api/webhooks/clerk`
3. **Subscribe to events**:
   - `organization.created`
   - `organization.updated`
   - `user.created`
   - `user.updated`
   - `organizationMembership.created`
4. **Save** — Clerk shows you the **Signing Secret** (starts with `whsec_`). Copy it.

### 6d. Wire the keys into the app

Update `apps/web/.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_REAL_KEY_FROM_CLERK
CLERK_SECRET_KEY=sk_test_REAL_SECRET_FROM_CLERK
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

Create `apps/api/.env.local` (this file doesn't exist yet — make it):

```bash
DATABASE_URL_ADMIN=postgres://app_admin:dev@localhost:5432/immcaseos
DATABASE_URL_TENANT=postgres://app_tenant:dev@localhost:5432/immcaseos
CLERK_SECRET_KEY=sk_test_REAL_SECRET_FROM_CLERK
CLERK_WEBHOOK_SECRET=whsec_REAL_SIGNING_SECRET_FROM_CLERK
NEXT_PUBLIC_APP_URL=http://localhost:3000
API_PORT=4000
```

---

## Step 7 — Run the dev servers

In one terminal:

```bash
pnpm dev
```

This runs Turborepo, which starts both `apps/web` (port 3000) and `apps/api` (port 4000) in parallel.

You should see:

```
@ico/web:dev:    ▲ Next.js 15.5.15
@ico/web:dev:    - Local:        http://localhost:3000
@ico/web:dev:    - Environments: .env.local
@ico/web:dev:  ✓ Ready in 1234ms

@ico/api:dev: [Nest] LOG [NestFactory] Starting Nest application...
@ico/api:dev: [Nest] LOG [InstanceLoader] AppModule dependencies initialized
@ico/api:dev: [Nest] LOG [RoutesResolver] HealthController {/health}
@ico/api:dev: [Nest] LOG [RoutesResolver] TenantsController {/api/tenants}
@ico/api:dev: [Nest] LOG [RoutesResolver] UsersController {/api/users}
@ico/api:dev: [Nest] LOG [RoutesResolver] ClerkWebhookController {/api/webhooks/clerk}
@ico/api:dev: [api] listening on http://localhost:4000
```

Quick health check:

```bash
curl http://localhost:4000/health
# → {"ok":true,"service":"ico-api","sprint":1}

curl http://localhost:3000/api/health
# → {"ok":true,"service":"ico-web","sprint":1}
```

---

## Step 8 — Walk through the Phase 0 flow

Open http://localhost:3000 in your browser.

1. **Landing page** — you should see "Phase 0 foundations" with two buttons.
2. **Click "Create your firm"** — Clerk's hosted sign-up UI loads.
3. **Sign up** with an email + verification code.
4. **Create an organization** — Clerk shows the organization-creation flow because we disabled personal accounts.
   - Name: `Test Firm`
   - Slug: `test-firm`
5. **Webhook fires** — if your ngrok tunnel is set up, Clerk POSTs `organization.created` to `/api/webhooks/clerk`. The handler creates a row in `tenants`. Watch the API terminal for `[ClerkWebhookController] Clerk organization.created: org_xxx (test-firm)`.
6. **Land on /dashboard** — you should see "Good day, {your name}." with the org switcher in the top right and the "What works in Sprint 1" checklist.
7. **Verify in the database**:
   ```bash
   docker exec -it ico-postgres psql -U app_admin -d immcaseos -c "SELECT id, slug, name FROM tenants ORDER BY created_at DESC LIMIT 5;"
   docker exec -it ico-postgres psql -U app_admin -d immcaseos -c "SELECT id, tenant_id, email, role FROM users ORDER BY created_at DESC LIMIT 5;"
   ```
   You should see your new tenant + your user, with the user's `tenant_id` matching the tenant's `id`.

If all of that works → **Phase 0 is functionally complete**. You can stop here, or proceed to Sprint 2.

---

## What's next (Sprint 2+)

Sprint 2 adds:
- Branded intake page at `apply.{tenant-slug}.io/start` (or `/intake` on localhost)
- `candidates` and `cases` tables with RLS + audit triggers
- A document upload that uses pre-signed R2 URLs (or local S3 stub for dev)
- A fake AI assessment that displays in a basic case detail view
- The first dashboard tiles with real data

See [docs/build-plan.md](docs/build-plan.md) Sprint 2 section for the full deliverables.

---

## Troubleshooting

### `pnpm install` fails with EACCES or permission errors
Close VS Code, close any terminal that has the project open, then re-run from a fresh shell. Windows file locks are the usual cause.

### `pnpm compose:up` says "port 5432 already allocated"
You have another Postgres running on 5432. Either stop it (`net stop postgresql-x64-16` if you installed Postgres natively, or `docker stop $(docker ps -q --filter publish=5432)`) or change the port in `compose.yaml`.

### `pnpm db:migrate` fails with "relation 'tenants' does not exist"
The drizzle migration didn't apply. Check the file `packages/db/migrations/0000_initial.sql` exists. Re-run.

### `pnpm db:migrate` fails with "permission denied for schema public"
The `app_tenant` role doesn't have grants. The init script in `packages/db/init/00-roles.sql` should have set this up. Try the volume reset:
```bash
pnpm compose:down
docker volume rm immigration-case-os_ico-pgdata
pnpm compose:up
pnpm db:migrate
```

### `pnpm test:isolation` fails on attack 4 (no context returns rows)
This is a security bug. The RLS policy is fail-OPEN instead of fail-CLOSED. Check the policy SQL in `packages/db/src/migrate.ts`:
```sql
USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
```
The `, true` is critical — it makes the GUC return NULL when missing, which makes `tenant_id = NULL` evaluate to FALSE, which hides the row. Without `true` it raises an error instead.

### `pnpm dev` errors with "Cannot find module '@clerk/nextjs'"
You haven't run `pnpm install` since switching branches. Re-run it.

### Clerk signup says "Invalid publishable key"
You're using the build-time placeholder. Update `apps/web/.env.local` with a real `pk_test_...` from your Clerk dashboard.

### Clerk webhook says "401 Invalid webhook signature"
The `CLERK_WEBHOOK_SECRET` in `apps/api/.env.local` doesn't match the signing secret Clerk generated. Re-copy it from the Clerk dashboard webhook page.

### Webhook never fires
If you're on localhost without a tunnel, Clerk can't reach your machine. Use ngrok:
```bash
ngrok http 4000
```
Then update the Clerk webhook endpoint URL to the ngrok URL.

### "JSX.Element" type errors after pulling new code
React 19 dropped the global `JSX` namespace. We use `import type { ReactElement } from 'react'` instead. If you wrote `JSX.Element` somewhere, change it to `ReactElement`.

### Anything else
1. Check the dev server output — both `apps/web` and `apps/api` log to the same `pnpm dev` terminal
2. Check the docker logs: `docker logs ico-postgres -f`
3. Check Clerk webhook delivery logs in the Clerk dashboard
4. Open an issue with the exact command + the error output
