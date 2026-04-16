import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, from, switchMap } from 'rxjs';
import type { Request } from 'express';
import { adminDb, schema } from '@ico/db';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import {
  buildRequestContext,
  TenantContextMissingError,
  type RequestContext,
  type VerifiedSession,
} from '@ico/shared';
import { IS_PUBLIC_KEY } from './public.decorator.js';

/**
 * Resolves the tenant id for an authenticated request and attaches a
 * RequestContext to req.context. Withdrawing this interceptor from any
 * non-public route would defeat RLS — guard against that by always
 * registering it as APP_INTERCEPTOR.
 */
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TenantInterceptor.name);
  private readonly tenantCache = new Map<string, string>(); // clerk_org_id -> tenant_id

  constructor(private readonly reflector: Reflector) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) {
      return next.handle();
    }

    const req = ctx
      .switchToHttp()
      .getRequest<Request & { session?: VerifiedSession; context?: RequestContext }>();

    if (!req.session) {
      throw new TenantContextMissingError();
    }

    return from(this.resolveTenantId(req.session.clerkOrgId)).pipe(
      switchMap((tenantId) => {
        const requestId =
          (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
        req.context = buildRequestContext(
          req.session!,
          tenantId,
          requestId,
          (req.headers['x-forwarded-for'] as string | undefined) ??
            req.socket.remoteAddress,
        );
        return next.handle();
      }),
    );
  }

  private async resolveTenantId(clerkOrgId: string): Promise<string> {
    if (!clerkOrgId) {
      throw new TenantContextMissingError();
    }
    const cached = this.tenantCache.get(clerkOrgId);
    if (cached) {
      return cached;
    }
    const rows = await adminDb
      .select({ id: schema.tenants.id })
      .from(schema.tenants)
      .where(eq(schema.tenants.clerk_org_id, clerkOrgId))
      .limit(1);
    const row = rows[0];
    if (!row) {
      this.logger.warn(`No tenant found for clerk_org_id=${clerkOrgId}`);
      throw new TenantContextMissingError();
    }
    this.tenantCache.set(clerkOrgId, row.id);
    return row.id;
  }
}
