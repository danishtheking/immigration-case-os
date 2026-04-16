import {
  Controller,
  Post,
  Req,
  Headers,
  HttpCode,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import { Webhook } from 'svix';
import { z } from 'zod';
import { Public } from '../common/public.decorator.js';
import { TenantsService } from '../modules/tenants/tenants.service.js';
import { UsersService } from '../modules/users/users.service.js';
import { UnauthorizedError, type UserRole } from '@ico/shared';

const ClerkOrgEvent = z.object({
  type: z.enum(['organization.created', 'organization.updated']),
  data: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
  }),
});

const ClerkUserEvent = z.object({
  type: z.enum(['user.created', 'user.updated', 'organizationMembership.created']),
  data: z.object({
    id: z.string(),
    email_addresses: z.array(z.object({ email_address: z.string() })).optional(),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    organization_memberships: z
      .array(
        z.object({
          organization: z.object({ id: z.string() }),
          role: z.string(),
        }),
      )
      .optional(),
    public_user_data: z
      .object({
        user_id: z.string(),
        first_name: z.string().nullable().optional(),
        last_name: z.string().nullable().optional(),
      })
      .optional(),
    organization: z.object({ id: z.string() }).optional(),
    role: z.string().optional(),
  }),
});

@Controller('webhooks/clerk')
export class ClerkWebhookController {
  private readonly logger = new Logger(ClerkWebhookController.name);

  constructor(
    private readonly tenants: TenantsService,
    private readonly users: UsersService,
  ) {}

  @Public()
  @Post()
  @HttpCode(200)
  async handle(
    @Req() req: Request,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
  ): Promise<{ ok: true }> {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      this.logger.warn('CLERK_WEBHOOK_SECRET not set; rejecting webhook');
      throw new UnauthorizedError('Webhook secret not configured');
    }

    // svix verification — uses the raw body. Make sure the express body parser
    // is configured to capture rawBody on this route (handled in main.ts).
    const payload = (req as Request & { rawBody?: string }).rawBody ?? JSON.stringify(req.body);
    const wh = new Webhook(secret);
    let event: unknown;
    try {
      event = wh.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      });
    } catch (err) {
      this.logger.warn(`Clerk webhook verification failed: ${(err as Error).message}`);
      throw new UnauthorizedError('Invalid webhook signature');
    }

    // Try the org shape first
    const orgResult = ClerkOrgEvent.safeParse(event);
    if (orgResult.success) {
      const { type, data } = orgResult.data;
      this.logger.log(`Clerk ${type}: ${data.id} (${data.slug})`);
      await this.tenants.upsertFromClerk({
        clerkOrgId: data.id,
        name: data.name,
        slug: data.slug,
      });
      return { ok: true };
    }

    // User / membership shape
    const userResult = ClerkUserEvent.safeParse(event);
    if (userResult.success) {
      const { type, data } = userResult.data;
      this.logger.log(`Clerk ${type}: ${data.id}`);

      // Need to figure out which tenant this user belongs to.
      const orgId =
        data.organization_memberships?.[0]?.organization.id ??
        data.organization?.id;
      if (!orgId) {
        this.logger.warn('User event without org membership; ignoring');
        return { ok: true };
      }

      const tenant = await this.tenants.upsertFromClerk({
        clerkOrgId: orgId,
        name: 'Pending', // updated on next org event
        slug: orgId.slice(0, 32),
      });

      const role = mapClerkRoleToAppRole(
        data.organization_memberships?.[0]?.role ?? data.role ?? 'org:member',
      );

      await this.users.upsertFromClerk({
        clerkUserId: data.public_user_data?.user_id ?? data.id,
        tenantId: tenant.id,
        email: data.email_addresses?.[0]?.email_address ?? '',
        firstName: data.first_name ?? data.public_user_data?.first_name ?? undefined,
        lastName: data.last_name ?? data.public_user_data?.last_name ?? undefined,
        role,
      });
      return { ok: true };
    }

    this.logger.log(`Clerk webhook: unhandled event shape, ignoring`);
    return { ok: true };
  }
}

function mapClerkRoleToAppRole(clerkRole: string): UserRole {
  switch (clerkRole) {
    case 'org:admin':
      return 'firm_admin';
    case 'org:attorney':
      return 'attorney';
    case 'org:case_manager':
      return 'case_manager';
    case 'org:paralegal':
      return 'paralegal';
    default:
      return 'observer';
  }
}
