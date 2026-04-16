'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactElement } from 'react';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';

const STAGES = ['Engaged', 'Intake', 'Preparation', 'Attorney review', 'Filed', 'Decision'];
const CURRENT_STAGE = 2;

const TABS = [
  { label: 'Overview', href: '' },
  { label: 'Documents', href: '/documents', count: 38 },
  { label: 'Assessment', href: '/assessment' },
  { label: 'Messages', href: '?tab=messages' },
  { label: 'Billing', href: '?tab=billing' },
];

export function CaseHeader({ caseId = '1' }: { caseId?: string }): ReactElement {
  const pathname = usePathname();
  const base = `/dashboard/cases/${caseId}`;

  return (
    <div className="border-b border-surface-border bg-surface-raised">
      {/* Top section — compact */}
      <div className="px-8 pt-5 pb-0">
        <Link href="/dashboard/cases" className="inline-flex items-center gap-1.5 text-[13px] text-content-tertiary hover:text-brand">
          <ArrowLeft className="h-3.5 w-3.5" /> Cases
        </Link>

        {/* Name + score on one line */}
        <div className="mt-3 flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-content">Priya Sharma</h1>
            <p className="mt-0.5 text-[14px] text-content-tertiary">EB-2 NIW · Matter of Dhanasar · Attorney: Danish</p>
          </div>
          <div className="text-right">
            <p className="text-[42px] font-extrabold leading-none text-success">84</p>
            <p className="mt-1 text-caption">Strong · v3.2</p>
          </div>
        </div>

        {/* Stage rail — simplified, fewer stages, bigger text */}
        <div className="mt-4 flex items-center gap-2">
          {STAGES.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <div className={`h-px w-5 ${i <= CURRENT_STAGE ? 'bg-success' : 'bg-surface-border'}`} />}
              <span className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold ${
                i < CURRENT_STAGE ? 'text-success'
                : i === CURRENT_STAGE ? 'bg-brand-lighter text-brand ring-1 ring-brand/30'
                : 'text-content-muted'
              }`}>
                {i < CURRENT_STAGE && <CheckCircle2 className="h-3.5 w-3.5" />}
                {i === CURRENT_STAGE && <Circle className="h-3.5 w-3.5 fill-current" />}
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs — only 5 essential ones, not 11 */}
      <div className="mt-4 flex gap-1 px-8 text-[14px]">
        {TABS.map((tab) => {
          const href = tab.href.startsWith('?') ? `${base}${tab.href}` : `${base}${tab.href ? `/${tab.href.replace('/', '')}` : ''}`;
          const isActive = tab.href === '' ? pathname === base : pathname.includes(tab.href.replace('/', ''));
          return (
            <Link
              key={tab.label}
              href={href}
              className={`rounded-t-lg px-4 py-3 font-medium transition-colors ${
                isActive ? 'bg-surface-raised border-b-2 border-brand text-brand' : 'text-content-tertiary hover:text-content-secondary'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && <span className="ml-1.5 text-[12px] text-content-muted">({tab.count})</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
