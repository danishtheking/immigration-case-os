import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

/**
 * The two database clients.
 *
 * `adminDb` connects as `app_admin` (BYPASSRLS). It is used ONLY by:
 *   - migration scripts
 *   - the cross-tenant isolation test (to set up fixtures)
 *   - the audit_logs trigger (via SECURITY DEFINER, transparent to callers)
 *
 * `tenantDb` connects as `app_tenant` (RLS enforced). All request handlers
 * use this client through `getTenantDb(tenantId)`. Calling it without setting
 * `app.current_tenant` returns 0 rows for tenant-scoped tables (fail closed).
 */

const adminUrl =
  process.env.DATABASE_URL_ADMIN ??
  process.env.DATABASE_URL ??
  'postgres://app_admin:dev@localhost:5432/immcaseos';

const tenantUrl =
  process.env.DATABASE_URL_TENANT ??
  process.env.DATABASE_URL ??
  'postgres://app_tenant:dev@localhost:5432/immcaseos';

const adminPool = postgres(adminUrl, {
  max: 5,
  prepare: false,
});

const tenantPool = postgres(tenantUrl, {
  max: 20,
  prepare: false,
});

export const adminDb = drizzle(adminPool, { schema, casing: 'snake_case' });
export const tenantDbRaw = drizzle(tenantPool, { schema, casing: 'snake_case' });

export type DrizzleDb = typeof adminDb;
export { schema };
