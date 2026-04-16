import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { verifyToken } from '@clerk/backend';
import type { Request } from 'express';
import { UnauthorizedError, type VerifiedSession, ClerkSessionClaims } from '@ico/shared';
import { IS_PUBLIC_KEY } from './public.decorator.js';

/**
 * Verifies the Clerk session JWT on every incoming request.
 * Public routes (marked with @Public()) skip this guard entirely.
 *
 * On success, attaches `req.session: VerifiedSession` to the request.
 * The TenantInterceptor reads it next to resolve the tenant id.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly reflector: Reflector) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const req = ctx.switchToHttp().getRequest<Request & { session?: VerifiedSession }>();
    const token = this.extractToken(req);
    if (!token) {
      throw new UnauthorizedError('Missing bearer token');
    }

    try {
      const claims = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY ?? 'sk_test_stub',
      });
      const parsed = ClerkSessionClaims.parse(claims);

      // The user's role lives on the Clerk org membership. Fetch it lazily.
      // For Sprint 1 we assume the role is encoded in the JWT custom claim
      // `org_role` (set via Clerk session token customization).
      const role = mapClerkRoleToAppRole(parsed.org_role ?? 'org:member');

      req.session = {
        userId: parsed.sub,
        clerkUserId: parsed.sub,
        clerkOrgId: parsed.org_id ?? '',
        role,
        email: parsed.email,
      };
      return true;
    } catch (err) {
      this.logger.warn(`Token verification failed: ${(err as Error).message}`);
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  private extractToken(req: Request): string | null {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return null;
    }
    return header.slice('Bearer '.length).trim();
  }
}

/**
 * Map Clerk org roles to internal user roles. In Sprint 1 we keep this
 * simple. Sprint 5 expands it as more roles come online.
 */
function mapClerkRoleToAppRole(clerkRole: string): VerifiedSession['role'] {
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
