import { SetMetadata } from '@nestjs/common';

/**
 * Mark a route as public — bypasses AuthGuard and TenantInterceptor.
 * Use sparingly: webhooks (which verify their own signatures) and /health.
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = (): MethodDecorator & ClassDecorator =>
  SetMetadata(IS_PUBLIC_KEY, true);
