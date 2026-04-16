import { Injectable } from '@nestjs/common';
import { adminDb, schema } from '@ico/db';
import { eq } from 'drizzle-orm';
import { NotFoundError, type RequestContext } from '@ico/shared';

@Injectable()
export class TenantsService {
  /**
   * Look up the current tenant. Uses the admin client because the tenant
   * row itself is global (not RLS-scoped) — we filter manually by the
   * tenant id in ctx.
   */
  async getCurrent(ctx: RequestContext): Promise<schema.Tenant> {
    const rows = await adminDb
      .select()
      .from(schema.tenants)
      .where(eq(schema.tenants.id, ctx.tenantId))
      .limit(1);
    const row = rows[0];
    if (!row) {
      throw new NotFoundError('Tenant not found');
    }
    return row;
  }

  /**
   * Upsert a tenant from a Clerk webhook event. Called by the webhooks module.
   */
  async upsertFromClerk(args: {
    clerkOrgId: string;
    name: string;
    slug: string;
  }): Promise<schema.Tenant> {
    const existing = await adminDb
      .select()
      .from(schema.tenants)
      .where(eq(schema.tenants.clerk_org_id, args.clerkOrgId))
      .limit(1);

    if (existing[0]) {
      const updated = await adminDb
        .update(schema.tenants)
        .set({
          name: args.name,
          slug: args.slug,
          updated_at: new Date(),
        })
        .where(eq(schema.tenants.clerk_org_id, args.clerkOrgId))
        .returning();
      return updated[0]!;
    }

    const inserted = await adminDb
      .insert(schema.tenants)
      .values({
        clerk_org_id: args.clerkOrgId,
        name: args.name,
        slug: args.slug,
      })
      .returning();
    return inserted[0]!;
  }
}
