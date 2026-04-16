import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactElement } from 'react';
import { isClerkConfigured } from '@/lib/clerk-config';
import {
  Scale,
  Shield,
  Zap,
  Globe2,
  ArrowRight,
  Bot,
  FileText,
  BarChart3,
  Clock,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage(): Promise<ReactElement> {
  if (isClerkConfigured()) {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = await auth();
    if (userId) redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Nav */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-xs font-black">
            IO
          </div>
          <span className="text-sm font-semibold tracking-tight">Immigration Case OS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-[13px] text-content-muted transition-colors hover:text-white">
            Dashboard
          </Link>
          <Link
            href="/sign-in"
            className="rounded-lg bg-surface-raised px-4 py-2 text-[13px] font-semibold text-content transition-colors hover:bg-surface-sunken"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="mx-auto max-w-6xl px-6 pt-20 pb-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-content px-4 py-1.5 text-[12px] text-content-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Phase 0 · Foundations
          </div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            The operating system for{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              immigration law firms
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-content-muted">
            Case management, AI assessments, legal research, document automation, and an
            autonomous agent — built multi-tenant from day one.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
            >
              View demo dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-content-muted transition-colors hover:border-surface-border/300 hover:text-white"
            >
              Create your firm
            </Link>
          </div>
        </div>
      </div>

      {/* Feature grid */}
      <div className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-4 gap-4">
          <FeatureCard
            icon={<Scale className="h-5 w-5" />}
            title="Every case type"
            description="EB-1A, NIW, H-1B, I-130, asylum, naturalization, removal defense — 30+ visa categories with data-driven workflows."
          />
          <FeatureCard
            icon={<Bot className="h-5 w-5" />}
            title="AI agent"
            description="Nudges stale clients, drafts RFE responses, surfaces deadlines — with human-in-the-loop guardrails and UPL filtering."
          />
          <FeatureCard
            icon={<FileText className="h-5 w-5" />}
            title="Forms engine"
            description="Auto-fill USCIS forms from case data, edition tracking, exhibit builder, filing packet assembly."
          />
          <FeatureCard
            icon={<Shield className="h-5 w-5" />}
            title="Multi-tenant RLS"
            description="Row-level security. Per-tenant encryption. Cross-tenant isolation tests on every PR. Fail-closed."
          />
          <FeatureCard
            icon={<Zap className="h-5 w-5" />}
            title="AI assessments"
            description="Criterion-by-criterion eligibility scoring for EB-1A, NIW, O-1. Re-runs on every document upload."
          />
          <FeatureCard
            icon={<Globe2 className="h-5 w-5" />}
            title="Legal research RAG"
            description="USCIS Policy Manual, AAO decisions, 8 CFR retrieval with citation safety. Never hallucinates a cite."
          />
          <FeatureCard
            icon={<Clock className="h-5 w-5" />}
            title="Deadlines engine"
            description="RFE clocks, Visa Bulletin watch, USCIS receipt polling, I-751 windows, EOIR hearing dates."
          />
          <FeatureCard
            icon={<BarChart3 className="h-5 w-5" />}
            title="Trust & billing"
            description="IOLTA-aware ledger, multi-currency via Stripe + Airwallex, installment plans, three-way reconciliation."
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 text-center text-[12px] text-content-secondary">
        Immigration Case OS · Sprint 1 (Phase 0) · StitchBoat Immigration is the first tenant
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: ReactElement; title: string; description: string }): ReactElement {
  return (
    <div className="rounded-xl border border-zinc-800 bg-content/50 p-5 transition-colors hover:border-zinc-700">
      <div className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-content/90 text-content-muted">
        {icon}
      </div>
      <h3 className="text-[14px] font-semibold text-zinc-200">{title}</h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-content-tertiary">{description}</p>
    </div>
  );
}
