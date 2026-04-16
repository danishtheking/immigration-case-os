/**
 * Returns `true` when Clerk should be active for this request, `false` when we
 * should bypass it entirely (used for previewing the landing page without any
 * Clerk account at all).
 *
 * Three states:
 *   1. No key set             → Clerk's keyless mode kicks in (auto-generates
 *                               temporary dev credentials). isClerkConfigured = true.
 *   2. Build-time placeholder → bypass Clerk so previews don't 401 against the
 *                               fake host. isClerkConfigured = false.
 *   3. Real `pk_test_*` /     → normal Clerk auth. isClerkConfigured = true.
 *      `pk_live_*` key
 *
 * To enable real Clerk auth, either:
 *   - Delete the Clerk env vars from apps/web/.env.local (keyless mode), or
 *   - Paste real keys from dashboard.clerk.com (when ready to claim/upgrade).
 */

const PLACEHOLDER_KEY_FRAGMENT = 'build-placeholder';

function decodeBase64Url(input: string): string {
  try {
    const padded = input + '='.repeat((4 - (input.length % 4)) % 4);
    const standard = padded.replace(/-/g, '+').replace(/_/g, '/');
    if (typeof atob === 'function') {
      return atob(standard);
    }
    return Buffer.from(standard, 'base64').toString('utf8');
  } catch {
    return '';
  }
}

export function isClerkConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // No key at all → Clerk uses keyless mode and provisions temp credentials.
  if (!key) {
    return true;
  }

  // Malformed key → bypass to avoid runtime crashes.
  if (!key.startsWith('pk_')) {
    return false;
  }

  // Build-time placeholder → bypass for the preview-without-account path.
  const encoded = key.replace(/^pk_(test|live)_/, '');
  const decoded = decodeBase64Url(encoded);
  if (decoded.includes(PLACEHOLDER_KEY_FRAGMENT)) {
    return false;
  }

  // Real key → use it.
  return true;
}
