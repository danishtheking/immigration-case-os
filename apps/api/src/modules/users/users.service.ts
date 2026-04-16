import { Injectable } from '@nestjs/common';
import { adminDb, schema, withTenantTx } from '@ico/db';
import { eq, and } from 'drizzle-orm';
import { NotFoundError, type RequestContext, type UserRole } from '@ico/shared';

@Injectable()
export class UsersService {
  /**
   * List all users in the current tenant. Goes through the tenant client
   * so RLS enforces isolation server-side as well as in this query.
   */
  async listForTenant(ctx: RequestContext): Promise<schema.User[]> {
    return withTenantTx(ctx, async ({ db }) => {
      return db.select().from(schema.users);
    });
  }

  async getById(ctx: RequestContext, id: string): Promise<schema.User> {
    return withTenantTx(ctx, async ({ db }) => {
      const rows = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, id))
        .limit(1);
      const row = rows[0];
      if (!row) {
        throw new NotFoundError('User not found');
      }
      return row;
    });
  }

  async getMe(ctx: RequestContext): Promise<schema.User> {
    return withTenantTx(ctx, async ({ db }) => {
      const rows = await db
        .select()
        .from(schema.users)
        .where(
          and(
            eq(schema.users.tenant_id, ctx.tenantId),
            eq(schema.users.id, ctx.userId),
          ),
        )
        .limit(1);
      const row = rows[0];
      if (!row) {
        throw new NotFoundError('User not found');
      }
      return row;
    });
  }

  /**
   * Mirror a Clerk user into our DB. Called from the Clerk webhook.
   * Uses the admin client because we don't have a request context yet.
   */
  async upsertFromClerk(args: {
    clerkUserId: string;
    tenantId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
  }): Promise<schema.User> {
    const existing = await adminDb
      .select()
      .from(schema.users)
      .where(eq(schema.users.clerk_user_id, args.clerkUserId))
      .limit(1);

    if (existing[0]) {
      const updated = await adminDb
        .update(schema.users)
        .set({
          email: args.email,
          first_name: args.firstName,
          last_name: args.lastName,
          role: args.role,
          updated_at: new Date(),
        })
        .where(eq(schema.users.clerk_user_id, args.clerkUserId))
        .returning();
      return updated[0]!;
    }

    const inserted = await adminDb
      .insert(schema.users)
      .values({
        clerk_user_id: args.clerkUserId,
        tenant_id: args.tenantId,
        email: args.email,
        first_name: args.firstName,
        last_name: args.lastName,
        role: args.role,
      })
      .returning();
    return inserted[0]!;
  }
}
