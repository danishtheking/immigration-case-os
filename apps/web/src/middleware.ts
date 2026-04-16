import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';
import { isClerkConfigured } from '@/lib/clerk-config';

/**
 * Subdomain-aware middleware.
 *
 * Three URL shapes:
 *   - app.{slug}.io        → firm console (Clerk-required)
 *   - my.{slug}.io         → client portal (Clerk magic-link)
 *   - apply.{slug}.io      → public branded intake (no auth)
 *
 * In Sprint 1 we only enable the firm console flow. The other two are
 * matched and routed but render placeholder pages.
 *
 * The middleware also extracts the tenant slug from the host and forwards
 * it as `x-tenant-slug` so server components can resolve the tenant id.
 *
 * If the Clerk publishable key is the build-time placeholder, we bypass
 * Clerk entirely so the landing page can be previewed without a real
 * Clerk account. Replace apps/web/.env.local to enable real auth.
 */

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/intake(.*)',
  '/api/health',
]);

const clerkConfigured = isClerkConfigured();

const noClerkMiddleware = (req: NextRequest): NextResponse => {
  const host = req.headers.get('host') ?? '';
  const slug = extractTenantSlug(host);
  const requestHeaders = new Headers(req.headers);
  if (slug) {
    requestHeaders.set('x-tenant-slug', slug);
  }
  return NextResponse.next({ request: { headers: requestHeaders } });
};

const clerkProtectedMiddleware = clerkMiddleware(async (auth, req: NextRequest) => {
  const host = req.headers.get('host') ?? '';
  const slug = extractTenantSlug(host);

  const requestHeaders = new Headers(req.headers);
  if (slug) {
    requestHeaders.set('x-tenant-slug', slug);
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
});

export default clerkConfigured ? clerkProtectedMiddleware : noClerkMiddleware;

function extractTenantSlug(host: string): string | null {
  // Strip port if present
  const cleanHost = host.split(':')[0] ?? host;
  // app.swagatusa.io -> swagatusa
  // my.swagatusa.io  -> swagatusa
  // apply.swagatusa.io -> swagatusa
  // localhost -> null (use default)
  const parts = cleanHost.split('.');
  if (parts.length < 3) return null;
  const sub = parts[0];
  if (sub === 'app' || sub === 'my' || sub === 'apply') {
    return parts[1] ?? null;
  }
  return null;
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
