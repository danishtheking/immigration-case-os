/**
 * Cross-tenant isolation test — THE most important test in the repo.
 *
 * Per ADR-0001 and the spec's "Phase 0 done when" criterion, this test must
 * pass on every PR. If it ever fails, treat it as a security incident.
 *
 * What it does:
 *   1. Connects to Postgres as `app_admin` and clears any prior fixtures.
 *   2. Creates two tenants (A and B), each with one attorney user.
 *   3. Switches to the `app_tenant` role and tries every cross-tenant attack:
 *      - Set context to A, attempt to SELECT B's user row by id → expect 0 rows
 *      - Set context to A, attempt to UPDATE B's user row → expect 0 rows affected
 *      - Set context to A, attempt to INSERT a user with B's tenant_id → expect error
 *      - Without setting any tenant context, attempt to SELECT users → expect 0 rows
 *   4. Tears down fixtures. Exits 0 on success, non-zero on any leak.
 *
 * Run with `pnpm test:isolation` (requires Postgres up via `docker compose up -d`).
 */

import postgres from 'postgres';

const ADMIN_URL =
  process.env.DATABASE_URL_ADMIN ??
  process.env.DATABASE_URL ??
  'postgres://app_admin:dev@localhost:5432/immcaseos';

const TENANT_URL =
  process.env.DATABASE_URL_TENANT ??
  'postgres://app_tenant:dev@localhost:5432/immcaseos';

interface Failure {
  step: string;
  detail: string;
}

const failures: Failure[] = [];

function fail(step: string, detail: string): void {
  failures.push({ step, detail });
  console.error(`  ❌ FAIL [${step}] ${detail}`);
}

function pass(step: string): void {
  console.log(`  ✅ PASS [${step}]`);
}

async function main(): Promise<void> {
  console.log('[isolation-test] connecting as app_admin');
  const admin = postgres(ADMIN_URL, { max: 1, prepare: false });

  console.log('[isolation-test] connecting as app_tenant');
  const tenant = postgres(TENANT_URL, { max: 1, prepare: false });

  try {
    // ---------- setup ----------
    console.log('[isolation-test] creating two test tenants and users');
    await admin.unsafe(`
      DELETE FROM users WHERE clerk_user_id LIKE 'isolation_test_%';
      DELETE FROM tenants WHERE clerk_org_id LIKE 'isolation_test_%';
    `);

    const tenants = await admin<{ id: string; slug: string }[]>`
      INSERT INTO tenants (slug, name, clerk_org_id)
      VALUES
        ('isotest-a', 'Isolation Test A', 'isolation_test_a'),
        ('isotest-b', 'Isolation Test B', 'isolation_test_b')
      RETURNING id, slug
    `;
    const tenantA = tenants.find((t) => t.slug === 'isotest-a')!;
    const tenantB = tenants.find((t) => t.slug === 'isotest-b')!;

    const users = await admin<{ id: string; tenant_id: string }[]>`
      INSERT INTO users (tenant_id, clerk_user_id, email, role)
      VALUES
        (${tenantA.id}, 'isolation_test_user_a', 'a@isotest.dev', 'attorney'),
        (${tenantB.id}, 'isolation_test_user_b', 'b@isotest.dev', 'attorney')
      RETURNING id, tenant_id
    `;
    const userA = users.find((u) => u.tenant_id === tenantA.id)!;
    const userB = users.find((u) => u.tenant_id === tenantB.id)!;
    console.log(
      `[isolation-test] created tenants A=${tenantA.id.slice(0, 8)} B=${tenantB.id.slice(0, 8)}`,
    );

    // ---------- attack 1: read across tenants ----------
    console.log('\n[isolation-test] attack 1: SELECT user from tenant B while context=A');
    {
      const result = await tenant.begin(async (sql) => {
        await sql`SELECT set_config('app.current_tenant', ${tenantA.id}, true)`;
        return sql`SELECT id FROM users WHERE id = ${userB.id}`;
      });
      if (result.length === 0) {
        pass('attack-1 SELECT cross-tenant returns 0 rows');
      } else {
        fail('attack-1', `expected 0 rows, got ${result.length}`);
      }
    }

    // ---------- attack 2: update across tenants ----------
    console.log('\n[isolation-test] attack 2: UPDATE user in tenant B while context=A');
    {
      const result = await tenant.begin(async (sql) => {
        await sql`SELECT set_config('app.current_tenant', ${tenantA.id}, true)`;
        return sql`UPDATE users SET first_name = 'leaked' WHERE id = ${userB.id} RETURNING id`;
      });
      if (result.length === 0) {
        pass('attack-2 UPDATE cross-tenant affects 0 rows');
      } else {
        fail('attack-2', `expected 0 rows updated, got ${result.length}`);
      }

      // Verify B's user was not actually modified
      const check = await admin<{ first_name: string | null }[]>`
        SELECT first_name FROM users WHERE id = ${userB.id}
      `;
      if (check[0]?.first_name === 'leaked') {
        fail('attack-2-verify', 'tenant B user was actually modified — RLS bypass');
      } else {
        pass('attack-2-verify B user untouched');
      }
    }

    // ---------- attack 3: insert with foreign tenant_id ----------
    console.log('\n[isolation-test] attack 3: INSERT user with tenant_id=B while context=A');
    {
      let blocked = false;
      try {
        await tenant.begin(async (sql) => {
          await sql`SELECT set_config('app.current_tenant', ${tenantA.id}, true)`;
          await sql`
            INSERT INTO users (tenant_id, clerk_user_id, email, role)
            VALUES (${tenantB.id}, 'isolation_test_attacker', 'attacker@evil.dev', 'firm_admin')
          `;
        });
      } catch (err) {
        blocked = true;
        console.log(`    (insert blocked: ${(err as Error).message.split('\n')[0]})`);
      }
      if (blocked) {
        pass('attack-3 INSERT with foreign tenant_id blocked');
      } else {
        // The insert may have "succeeded" but RLS WITH CHECK should have stopped it.
        // Verify nothing landed in users.
        const check = await admin`
          SELECT id FROM users WHERE clerk_user_id = 'isolation_test_attacker'
        `;
        if (check.length === 0) {
          pass('attack-3 INSERT either errored or RLS scrubbed it');
        } else {
          fail('attack-3', 'attacker row was actually inserted');
        }
      }
    }

    // ---------- attack 4: read with no tenant context at all ----------
    console.log('\n[isolation-test] attack 4: SELECT users with NO tenant context');
    {
      const result = await tenant.begin(async (sql) => {
        // intentionally do NOT set app.current_tenant
        return sql`SELECT id FROM users WHERE clerk_user_id LIKE 'isolation_test_%'`;
      });
      if (result.length === 0) {
        pass('attack-4 SELECT without context returns 0 rows (fail-closed)');
      } else {
        fail(
          'attack-4',
          `expected 0 rows when no context set, got ${result.length} — RLS is fail-OPEN`,
        );
      }
    }

    // ---------- positive control: legitimate read ----------
    console.log('\n[isolation-test] positive control: SELECT own tenant user works');
    {
      const result = await tenant.begin(async (sql) => {
        await sql`SELECT set_config('app.current_tenant', ${tenantA.id}, true)`;
        return sql`SELECT id FROM users WHERE id = ${userA.id}`;
      });
      if (result.length === 1) {
        pass('positive-control returns own tenant row');
      } else {
        fail(
          'positive-control',
          `expected 1 row, got ${result.length} — RLS may be over-restrictive`,
        );
      }
    }

    // ---------- teardown ----------
    console.log('\n[isolation-test] tearing down fixtures');
    await admin.unsafe(`
      DELETE FROM users WHERE clerk_user_id LIKE 'isolation_test_%';
      DELETE FROM tenants WHERE clerk_org_id LIKE 'isolation_test_%';
    `);
  } finally {
    await admin.end();
    await tenant.end();
  }

  console.log('\n=========================================');
  if (failures.length === 0) {
    console.log('✅ Cross-tenant isolation: ALL PASS');
    console.log('=========================================');
    process.exit(0);
  } else {
    console.error(`❌ Cross-tenant isolation: ${failures.length} FAILURE(S)`);
    for (const f of failures) {
      console.error(`   - [${f.step}] ${f.detail}`);
    }
    console.error('=========================================');
    console.error('THIS IS A SECURITY INCIDENT. Do not merge.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[isolation-test] unexpected error:', err);
  process.exit(2);
});
