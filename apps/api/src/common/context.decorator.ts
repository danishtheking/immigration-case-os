import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { RequestContext } from '@ico/shared';
import { TenantContextMissingError } from '@ico/shared';

/**
 * Inject the per-request RequestContext into a controller method.
 * Throws if the TenantInterceptor didn't run (which would be a security bug).
 *
 *     @Get()
 *     async list(@Ctx() ctx: RequestContext) { ... }
 */
export const Ctx = createParamDecorator((_data: unknown, host: ExecutionContext): RequestContext => {
  const req = host.switchToHttp().getRequest<Request & { context?: RequestContext }>();
  if (!req.context) {
    throw new TenantContextMissingError();
  }
  return req.context;
});
