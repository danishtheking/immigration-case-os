import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { isClerkConfigured } from '@/lib/clerk-config';

export const metadata: Metadata = {
  title: 'Immigration Case OS',
  description: 'Multi-tenant operating system for U.S. immigration law firms',
};

export default function RootLayout({ children }: { children: ReactNode }): ReactElement {
  // When using the build-time placeholder Clerk key, skip ClerkProvider so
  // the landing page renders without trying to call Clerk's API. Replace
  // apps/web/.env.local with real keys to enable the full auth flow.
  if (!isClerkConfigured()) {
    return (
      <html lang="en">
        <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
          {children}
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
