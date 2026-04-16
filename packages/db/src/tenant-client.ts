import { sql } from 'drizzle-orm';
import { tenantDbRaw } from './client.js';
import type { RequestContext } from '@ico/shared';

/**
 * Tenant-scoped database access.
 *
 * Every API request handler calls `withTenantTx(ctx, fn)` to get a transaction
 * with `app.current_tenant`, `app.current_actor`, and friends pre-set. The RLS
 * policies on every business table use `current_setting('app.current_tenant', true)::uuid`
 * — if it's NULL (because the wrapper wasn't used), `tenant_id = NULL` is FALSE
 * in SQL, so no rows are visible. Fail closed.
 *
 * NEVER call `tenantDbRaw` directly from a request handler. Always go through
 * this wrapper. The lint rule in eslint.config.mjs forbids importing
 * `tenantDbRaw` from anywhere except this file (added in Sprint 1).
 */

export type TenantDb = typeof tenantDbRaw;

export interface TenantTxContext {
  db: TenantDb;
  ctx: RequestContext;
}

/**
 * Run `fn` inside a transaction with the tenant context configured for RLS.
 * The settings use `set_config(... , true)` so they are scoped to the
 * transaction (LOCAL) and reset on COMMIT/ROLLBACK.
 */
export async function withTenantTx<T>(
  ctx: RequestContext,
  fn: (tx: TenantTxContext) => Promise<T>,
): Promise<T> {
  if (!ctx.tenantId || !ctx.userId) {
    throw new Error(
      'withTenantTx called without a tenant or user id. Refusing to query.',
    );
  }

  return tenantDbRaw.transaction(async (tx) => {
    // Set per-transaction GUC values consumed by RLS policies and audit triggers.
    // The `true` second arg makes them transaction-local, not session-local.
    await tx.execute(
      sql`SELECT set_config('app.current_tenant', ${ctx.tenantId}, true)`,
    );
    await tx.execute(
      sql`SELECT set_config('app.current_actor', ${ctx.userId}, true)`,
    );
    await tx.execute(
      sql`SELECT set_config('app.current_actor_kind', ${ctx.actorKind}, true)`,
    );
    await tx.execute(
      sql`SELECT set_config('app.current_request_id', ${ctx.requestId}, true)`,
    );
    if (ctx.ip) {
      await tx.execute(
        sql`SELECT set_config('app.current_ip', ${ctx.ip}, true)`,
      );
    }

    return fn({ db: tx as unknown as TenantDb, ctx });
  });
}

/**
 * Convenience wrapper for handlers that don't need an explicit transaction —
 * still runs inside a transaction internally because that's how RLS LOCAL settings work.
 */
export async function getTenantDb(ctx: RequestContext): Promise<TenantDb> {
  // We can't return a "session" with persistent settings because postgres-js
  // doesn't expose one. Force the caller into the transaction wrapper.
  throw new Error(
    'getTenantDb is removed. Use withTenantTx(ctx, async ({ db }) => { ... }) instead.',
  );
}
