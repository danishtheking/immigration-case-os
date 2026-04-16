import { z } from 'zod';

/**
 * Roles a user can hold within a tenant. Mirrors the user_role enum in Drizzle.
 */
export const UserRole = z.enum([
  'firm_admin',
  'attorney',
  'case_manager',
  'paralegal',
  'candidate',
  'recommender',
  'observer',
]);
export type UserRole = z.infer<typeof UserRole>;

/**
 * The decoded shape we expect from a Clerk session JWT after verification.
 * The api gateway maps this onto the internal RequestContext.
 */
export const ClerkSessionClaims = z.object({
  sub: z.string(),
  org_id: z.string().optional(),
  org_role: z.string().optional(),
  email: z.string().email().optional(),
});
export type ClerkSessionClaims = z.infer<typeof ClerkSessionClaims>;

/**
 * The internal request context attached to every authenticated request.
 * Lives in NestJS's request scope and is the source of truth for RLS context setting.
 */
export interface RequestContext {
  /** The tenant the request is operating against. Always set after the TenantInterceptor runs. */
  tenantId: string;
  /** The user (firm staff or candidate) making the request. */
  userId: string;
  /** Their role within the tenant. */
  role: UserRole;
  /** Whether the actor is a human or an automated agent (for audit logs). */
  actorKind: 'user' | 'agent' | 'system' | 'webhook';
  /** Per-request id propagated through logs and audit entries. */
  requestId: string;
  /** Original IP from x-forwarded-for or socket address. */
  ip?: string;
}

/**
 * Convenience type guard for narrowing optional context.
 */
export function hasTenantContext(
  ctx: Partial<RequestContext> | undefined,
): ctx is RequestContext {
  return Boolean(ctx?.tenantId && ctx.userId && ctx.role);
}

/**
 * The standard envelope every API response uses.
 */
export interface ApiResponse<T> {
  ok: true;
  data: T;
  meta?: { total?: number; page?: number; limit?: number };
}

export interface ApiErrorResponse {
  ok: false;
  error: { code: string; message: string; details?: unknown };
}
