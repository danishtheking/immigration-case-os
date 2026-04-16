/**
 * Migration runner. Applies all SQL files in /migrations in order, then
 * applies the RLS policies and audit triggers from /sql/.
 *
 * Run with `pnpm db:migrate` from the repo root.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { RLS_TABLES } from './rls-tables.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const adminUrl =
  process.env.DATABASE_URL_ADMIN ??
  process.env.DATABASE_URL ??
  'postgres://app_admin:dev@localhost:5432/immcaseos';

async function main(): Promise<void> {
  console.log('[migrate] connecting as app_admin (BYPASSRLS)');
  const client = postgres(adminUrl, { max: 1, prepare: false });
  const db = drizzle(client);

  console.log('[migrate] applying drizzle migrations from ./migrations');
  await migrate(db, { migrationsFolder: join(__dirname, '..', 'migrations') });

  console.log('[migrate] applying RLS policies for tables:', RLS_TABLES);
  for (const table of RLS_TABLES) {
    const sql = `
      ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;
      ALTER TABLE ${table} FORCE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS tenant_isolation ON ${table};
      CREATE POLICY tenant_isolation ON ${table}
        USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
        WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
      GRANT SELECT, INSERT, UPDATE, DELETE ON ${table} TO app_tenant;
    `;
    await client.unsafe(sql);
    console.log(`  [rls] ${table}`);
  }

  console.log('[migrate] applying audit trigger function');
  const auditSql = await readFile(
    join(__dirname, '..', 'sql', 'audit-trigger.sql'),
    'utf8',
  );
  await client.unsafe(auditSql);

  console.log('[migrate] applying audit triggers to tenant-scoped tables');
  for (const table of RLS_TABLES) {
    await client.unsafe(`
      DROP TRIGGER IF EXISTS ${table}_audit ON ${table};
      CREATE TRIGGER ${table}_audit
        AFTER INSERT OR UPDATE OR DELETE ON ${table}
        FOR EACH ROW EXECUTE FUNCTION write_audit_log();
    `);
    console.log(`  [audit] ${table}`);
  }

  // tenants table is global but also worth auditing
  await client.unsafe(`
    DROP TRIGGER IF EXISTS tenants_audit ON tenants;
    CREATE TRIGGER tenants_audit
      AFTER INSERT OR UPDATE OR DELETE ON tenants
      FOR EACH ROW EXECUTE FUNCTION write_audit_log();
  `);

  console.log('[migrate] granting tenant role permissions');
  await client.unsafe(`
    GRANT SELECT ON tenants TO app_tenant;
    GRANT INSERT ON audit_logs TO app_tenant;
  `);

  console.log('[migrate] done');
  await client.end();
}

main().catch((err) => {
  console.error('[migrate] failed:', err);
  process.exit(1);
});
