import type { ReactElement } from 'react';
import Link from 'next/link';
import {
  FileText,
  MessageSquare,
  CreditCard,
  Upload,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  Sparkles,
  Shield,
} from 'lucide-react';

const STAGES = ['Engaged', 'Intake', 'Preparation', 'Attorney review', 'Filed', 'Adjudication', 'Decision'];
const CURRENT = 2;

const OPPORTUNITIES = [
  { title: 'Judge · AAAI-2027 Doctoral Consortium', action: 'Apply', match: 94 },
  { title: 'Reviewer · Elsevier Atmospheric Research (CfP)', action: 'Accept', match: 89 },
  { title: 'Invited talk · NCAR Climate Symposium', action: 'Submit', match: 72 },
];

export default function ClientPortalPage(): ReactElement {
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-surface-border bg-surface-raised">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-xs font-black text-white">SB</div>
            <div>
              <div className="text-sm font-semibold text-content">StitchBoat Immigration</div>
              <div className="text-[12px] text-content-muted">Client portal</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative rounded-lg border border-surface-border p-2 text-content-tertiary hover:text-content-secondary">
              <MessageSquare className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-red-500 text-[9px] font-bold text-white">2</span>
            </button>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white">PS</div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Welcome */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-content">Welcome, Priya</h1>
            <p className="mt-1 text-[14px] text-content-tertiary">
              Your <span className="font-semibold text-content-secondary">EB-2 NIW</span> case is in <span className="font-semibold text-blue-600">Preparation</span>. Danish is your attorney. Next step: 2 recommender letters.
            </p>
          </div>
        </div>

        {/* Stage rail */}
        <div className="mt-6 flex items-center gap-1.5 overflow-x-auto rounded-xl border border-surface-border bg-surface-raised p-4">
          {STAGES.map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              {i > 0 && <div className={`h-px w-6 ${i <= CURRENT ? 'bg-emerald-300' : 'bg-surface-sunken'}`} />}
              <span className={`flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[12px] font-semibold ${
                i < CURRENT ? 'bg-emerald-50 text-emerald-700' : i === CURRENT ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300' : 'bg-surface-sunken text-content-muted'
              }`}>
                {i < CURRENT && <CheckCircle2 className="h-3 w-3" />}
                {i === CURRENT && <Circle className="h-3 w-3 fill-current" />}
                {s}
              </span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          <StatCard icon={<FileText className="h-4 w-4" />} label="Documents" value="38" sub="all categorized" />
          <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="Questionnaire" value="100%" sub="complete" />
          <StatCard icon={<CreditCard className="h-4 w-4" />} label="Invoice" value="Paid" sub="$8,500 · Feb 3" />
          <StatCard icon={<MessageSquare className="h-4 w-4" />} label="Messages" value="2 unread" sub="from Jess" />
        </div>

        {/* Action required */}
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50/50 p-5">
          <h3 className="text-[13px] font-semibold text-blue-900">Action requested</h3>
          <p className="mt-1.5 text-[13px] text-blue-800">
            Ask Dr. Maria Ortiz and Prof. J. Chen for recommendation letters. We drafted them — review and send from here.
          </p>
          <div className="mt-3 flex gap-2">
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-semibold text-white hover:bg-blue-500">Review Dr. Ortiz draft</button>
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-semibold text-white hover:bg-blue-500">Review Prof. Chen draft</button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          {/* Upload docs */}
          <div className="rounded-xl border border-surface-border bg-surface-raised p-5">
            <h3 className="text-[13px] font-semibold text-content">Upload documents</h3>
            <div className="mt-3 rounded-lg border-2 border-dashed border-surface-border-hover bg-surface p-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/20">
              <Upload className="mx-auto h-6 w-6 text-content-muted" />
              <p className="mt-2 text-[12px] text-content-tertiary">Drop PDF, DOCX, or images here</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[12px]">
              <span className="text-content-tertiary">38 documents uploaded</span>
              <button className="flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700">View all <ArrowRight className="h-3 w-3" /></button>
            </div>
          </div>

          {/* Opportunities */}
          <div className="rounded-xl border border-surface-border bg-surface-raised p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-content">Opportunities matched to you</h3>
              <Sparkles className="h-4 w-4 text-blue-500" />
            </div>
            <ul className="mt-3 space-y-2">
              {OPPORTUNITIES.map((o) => (
                <li key={o.title} className="flex items-center justify-between rounded-lg border border-surface-border/50 p-3 transition-colors hover:bg-surface">
                  <div>
                    <p className="text-[12px] font-medium text-content-secondary">{o.title}</p>
                    <p className="text-[12px] text-content-muted">Match: {o.match}%</p>
                  </div>
                  <button className="rounded-md border border-surface-border px-2.5 py-1 text-[12px] font-medium text-content-secondary hover:bg-surface-sunken">{o.action}</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Security note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-content-muted">
          <Shield className="h-3.5 w-3.5" />
          All communications are attorney-client privileged · Data encrypted at rest and in transit
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: ReactElement; label: string; value: string; sub: string }): ReactElement {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-raised p-4">
      <div className="flex items-center gap-2 text-content-muted">{icon}<span className="text-[12px] font-medium text-content-tertiary">{label}</span></div>
      <p className="mt-2 text-lg font-bold text-content">{value}</p>
      <p className="text-[12px] text-content-muted">{sub}</p>
    </div>
  );
}
