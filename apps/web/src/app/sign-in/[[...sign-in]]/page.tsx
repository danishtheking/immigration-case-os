import Link from 'next/link';
import type { ReactElement } from 'react';
import { isClerkConfigured } from '@/lib/clerk-config';

export const dynamic = 'force-dynamic';

export default async function SignInPage(): Promise<ReactElement> {
  if (!isClerkConfigured()) {
    return <PreviewStub action="Sign in" />;
  }
  const { SignIn } = await import('@clerk/nextjs');
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <SignIn />
    </main>
  );
}

function PreviewStub({ action }: { action: string }): ReactElement {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 font-black text-white">
            IO
          </div>
          <div className="text-sm font-bold tracking-tight">Immigration Case OS</div>
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">{action}</h1>
        <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <b>Preview mode</b> — auth is bypassed. The real Clerk sign-in widget does not render because no Clerk keys are configured.
        </div>
        <p className="mt-4 text-sm text-slate-600">
          To enable real {action.toLowerCase()}, either clear the Clerk keys in
          {' '}<code className="rounded bg-slate-100 px-1 text-xs">apps/web/.env.local</code>{' '}
          (keyless mode) or paste real <code className="rounded bg-slate-100 px-1 text-xs">pk_test_*</code> and{' '}
          <code className="rounded bg-slate-100 px-1 text-xs">sk_test_*</code> keys from{' '}
          <a href="https://dashboard.clerk.com" className="underline" target="_blank" rel="noreferrer">
            dashboard.clerk.com
          </a>.
        </p>
        <div className="mt-6 flex gap-2">
          <Link href="/dashboard" className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white">
            Go to demo dashboard
          </Link>
          <Link href="/" className="rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-900">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
