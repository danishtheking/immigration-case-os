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
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-xs font-black text-white">SB</div>
            <div>
              <div className="text-sm font-semibold text-zinc-900">StitchBoat Immigration</div>
              <div className="text-[11px] text-zinc-400">Client portal</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative rounded-lg border border-zinc-200 p-2 text-zinc-500 hover:text-zinc-700">
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
            <h1 className="text-2xl font-bold text-zinc-900">Welcome, Priya</h1>
            <p className="mt-1 text-[14px] text-zinc-500">
              Your <span className="font-semibold text-zinc-700">EB-2 NIW</span> case is in <span className="font-semibold text-blue-600">Preparation</span>. Danish is your attorney. Next step: 2 recommender letters.
            </p>
          </div>
        </div>

        {/* Stage rail */}
        <div className="mt-6 flex items-center gap-1.5 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-4">
          {STAGES.map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              {i > 0 && <div className={`h-px w-6 ${i <= CURRENT ? 'bg-emerald-300' : 'bg-zinc-200'}`} />}
              <span className={`flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${
                i < CURRENT ? 'bg-emerald-50 text-emerald-700' : i === CURRENT ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300' : 'bg-zinc-100 text-zinc-400'
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
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <h3 className="text-[13px] font-semibold text-zinc-900">Upload documents</h3>
            <div className="mt-3 rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/20">
              <Upload className="mx-auto h-6 w-6 text-zinc-400" />
              <p className="mt-2 text-[12px] text-zinc-500">Drop PDF, DOCX, or images here</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[12px]">
              <span className="text-zinc-500">38 documents uploaded</span>
              <button className="flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700">View all <ArrowRight className="h-3 w-3" /></button>
            </div>
          </div>

          {/* Opportunities */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-zinc-900">Opportunities matched to you</h3>
              <Sparkles className="h-4 w-4 text-blue-500" />
            </div>
            <ul className="mt-3 space-y-2">
              {OPPORTUNITIES.map((o) => (
                <li key={o.title} className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 transition-colors hover:bg-zinc-50">
                  <div>
                    <p className="text-[12px] font-medium text-zinc-700">{o.title}</p>
                    <p className="text-[10px] text-zinc-400">Match: {o.match}%</p>
                  </div>
                  <button className="rounded-md border border-zinc-200 px-2.5 py-1 text-[11px] font-medium text-zinc-600 hover:bg-zinc-100">{o.action}</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Security note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-zinc-400">
          <Shield className="h-3.5 w-3.5" />
          All communications are attorney-client privileged · Data encrypted at rest and in transit
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: ReactElement; label: string; value: string; sub: string }): ReactElement {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center gap-2 text-zinc-400">{icon}<span className="text-[11px] font-medium text-zinc-500">{label}</span></div>
      <p className="mt-2 text-lg font-bold text-zinc-900">{value}</p>
      <p className="text-[11px] text-zinc-400">{sub}</p>
    </div>
  );
}
