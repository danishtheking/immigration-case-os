import type { RequestContext, UserRole } from './types.js';

/**
 * Auth abstraction layer. Per ADR-0002 we use Clerk as the primary identity provider,
 * but every consumer of identity data goes through this module — never reaches into
 * `@clerk/*` directly. That makes it possible to swap auth providers by rewriting
 * just this file.
 *
 * The actual JWT verification happens in `apps/api` via the AuthGuard. This file
 * defines the contract.
 */

export interface VerifiedSession {
  userId: string;
  clerkUserId: string;
  clerkOrgId: string;
  role: UserRole;
  email?: string;
}

/**
 * Build a per-request RequestContext from a verified session and the resolved
 * tenant id. The TenantInterceptor is the only place that should call this.
 */
export function buildRequestContext(
  session: VerifiedSession,
  tenantId: string,
  requestId: string,
  ip?: string,
): RequestContext {
  return {
    tenantId,
    userId: session.userId,
    role: session.role,
    actorKind: 'user',
    requestId,
    ip,
  };
}

/**
 * Roles that can read/write firm-wide data.
 */
export const FIRM_STAFF_ROLES: UserRole[] = [
  'firm_admin',
  'attorney',
  'case_manager',
  'paralegal',
];

/**
 * Roles that can administer tenant settings.
 */
export const ADMIN_ROLES: UserRole[] = ['firm_admin'];

export function isFirmStaff(role: UserRole): boolean {
  return FIRM_STAFF_ROLES.includes(role);
}

export function isAdmin(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}
