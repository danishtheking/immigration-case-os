'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactElement } from 'react';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';

const DEMO = {
  caseNumber: 'NIW-2026-0317',
  client: 'Priya Sharma',
  type: 'EB-2 NIW',
  framework: 'Matter of Dhanasar',
  attorney: 'Danish',
  caseManager: 'Jess',
  retainer: '$8,500 paid',
  engagedDate: 'Feb 3',
  daysInSystem: 72,
  score: 84,
  scoreLabel: 'Strong',
  modelVersion: 'v3.2',
};

const STAGES = ['Engaged', 'Intake', 'Preparation', 'Attorney review', 'Filed', 'Adjudication', 'Decision'];
const CURRENT_STAGE = 2;

interface Tab {
  label: string;
  href: string;
  count?: number;
}

function getTabs(caseId: string): Tab[] {
  const base = `/dashboard/cases/${caseId}`;
  return [
    { label: 'Overview', href: base },
    { label: 'Documents', href: `${base}/documents`, count: 38 },
    { label: 'Assessment', href: `${base}/assessment` },
    { label: 'Forms', href: `${base}?tab=forms` },
    { label: 'Exhibits', href: `${base}?tab=exhibits` },
    { label: 'Letters', href: `${base}?tab=letters` },
    { label: 'Research', href: `${base}?tab=research` },
    { label: 'Opportunities', href: `${base}?tab=opportunities` },
    { label: 'Messages', href: `${base}?tab=messages` },
    { label: 'Billing', href: `${base}?tab=billing` },
    { label: 'Audit log', href: `${base}?tab=audit` },
  ];
}

export function CaseHeader({ caseId = '1' }: { caseId?: string }): ReactElement {
  const pathname = usePathname();
  const tabs = getTabs(caseId);

  return (
    <div className="border-b border-surface-border bg-surface-raised px-6 pt-4 pb-0">
      <Link href="/dashboard/cases" className="mb-3 inline-flex items-center gap-1 text-[12px] text-content-tertiary hover:text-content-secondary">
        <ArrowLeft className="h-3 w-3" /> Back to cases
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] text-content-muted">Case · {DEMO.caseNumber}</p>
          <h1 className="text-xl font-bold text-content">{DEMO.client}</h1>
          <p className="text-[13px] text-content-tertiary">{DEMO.type} · {DEMO.framework}</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <Chip>Attorney: {DEMO.attorney}</Chip>
            <Chip>Case mgr: {DEMO.caseManager}</Chip>
            <Chip>Retainer: {DEMO.retainer}</Chip>
            <Chip>Engaged {DEMO.engagedDate} · {DEMO.daysInSystem}d</Chip>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[12px] text-content-muted">Eligibility score</p>
          <p className="text-4xl font-black text-emerald-600">{DEMO.score}</p>
          <p className="text-[12px] text-content-muted">{DEMO.scoreLabel} · {DEMO.modelVersion}</p>
        </div>
      </div>

      {/* Stage rail */}
      <div className="mt-5 flex items-center gap-1.5 overflow-x-auto pb-1">
        {STAGES.map((s, i) => (
          <div key={s} className="flex items-center gap-1.5">
            {i > 0 && <div className="h-px w-4 bg-zinc-300" />}
            <span className={`whitespace-nowrap rounded-md px-2.5 py-1 text-[12px] font-semibold ${
              i < CURRENT_STAGE ? 'bg-emerald-50 text-emerald-700'
              : i === CURRENT_STAGE ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
              : 'bg-surface-sunken text-content-muted'
            }`}>
              {i < CURRENT_STAGE && <CheckCircle2 className="mr-1 inline h-3 w-3" />}
              {i === CURRENT_STAGE && <Circle className="mr-1 inline h-3 w-3 fill-current" />}
              {s}
            </span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-4 flex gap-0.5 overflow-x-auto text-[13px]">
        {tabs.map((tab) => {
          const active = tab.href === pathname || (tab.href.includes('?') === false && pathname === tab.href);
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`whitespace-nowrap border-b-2 px-3 py-2.5 font-medium transition-colors ${
                active ? 'border-blue-600 text-blue-700' : 'border-transparent text-content-tertiary hover:text-content-secondary'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && <span className="ml-1 text-[12px] text-content-muted">({tab.count})</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }): ReactElement {
  return (
    <span className="inline-flex items-center rounded-md border border-surface-border bg-surface px-2 py-0.5 text-[12px] text-content-secondary">
      {children}
    </span>
  );
}
