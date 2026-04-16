import type { ReactElement } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { AlertTriangle, Clock, ChevronRight, Bell, AlertCircle } from 'lucide-react';

const URGENT = [
  { case: 'Kapoor', type: 'NOID (I-130)', days: 6, owner: 'Rahul', severity: 'critical' as const },
  { case: 'Osei', type: 'I-907 response', days: 9, owner: 'Jess', severity: 'warning' as const },
  { case: 'Sharma', type: 'RFE (NIW)', days: 15, owner: 'Danish', severity: 'warning' as const },
  { case: 'Silva', type: 'I-751 90-day window', days: 10, owner: 'Danish', severity: 'warning' as const },
  { case: 'Hussein', type: 'Asylum one-year bar', days: 41, owner: 'Danish', severity: 'normal' as const },
  { case: 'Wei', type: 'O-1A petition', days: 33, owner: 'Jess', severity: 'normal' as const },
];

const BULLETIN = [
  { category: 'EB-1', country: 'All chargeability', cutoff: 'Current', change: 'Current' },
  { category: 'EB-2', country: 'India', cutoff: '01 Nov 2012', change: 'Advanced 2 weeks' },
  { category: 'EB-2', country: 'China', cutoff: '01 Jun 2020', change: 'No change' },
  { category: 'EB-3', country: 'India', cutoff: '15 May 2013', change: 'Current for 2 cases' },
  { category: 'F-2A', country: 'Mexico', cutoff: 'Current', change: 'Current' },
];

export default function DeadlinesPage(): ReactElement {
  const criticalCount = URGENT.filter((u) => u.severity === 'critical').length;

  return (
    <>
      <Topbar firstName="Danish" previewMode />
      <main className="flex-1 overflow-y-auto px-8 py-7">

        {/* Page header — simple */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading text-content">Deadlines & Ticklers</h1>
            <p className="mt-1 text-body">{URGENT.length} tracked deadlines · {criticalCount} critical</p>
          </div>
          <button className="flex items-center gap-2 rounded-[10px] border border-surface-border px-4 py-2.5 text-[13px] font-medium text-content-secondary hover:bg-surface-sunken">
            <Bell className="h-4 w-4" /> Escalation rules
          </button>
        </div>

        {/* Critical alert — stands out immediately */}
        {criticalCount > 0 && (
          <div className="mt-6 flex items-center gap-4 rounded-[14px] bg-danger-light border border-danger/20 px-6 py-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-danger/10">
              <AlertCircle className="h-5 w-5 text-danger" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-danger">Critical: Kapoor NOID response due in 6 days</p>
              <p className="mt-0.5 text-[13px] text-danger/70">This is the most urgent item. Failure to respond will result in case denial.</p>
            </div>
            <button className="rounded-[10px] bg-danger px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-danger/90">
              Open case <ChevronRight className="ml-1 inline h-4 w-4" />
            </button>
          </div>
        )}

        {/* Two-column layout with clear visual separation */}
        <div className="mt-7 grid grid-cols-5 gap-6">

          {/* Agency response clocks — left 3 cols, the primary focus */}
          <section className="col-span-3 card-elevated p-6">
            <h2 className="text-subheading text-content">Agency response clocks</h2>
            <p className="mt-1 text-caption">Sorted by urgency · red = respond immediately</p>

            <div className="mt-5 space-y-3">
              {URGENT.map((item) => (
                <div key={item.case} className={`flex items-center gap-4 rounded-[10px] p-4 transition-colors ${
                  item.severity === 'critical' ? 'bg-danger-light border border-danger/20' :
                  item.severity === 'warning' ? 'bg-warning-light/50 border border-warning/10' :
                  'bg-surface border border-surface-border'
                }`}>
                  {/* Days left — the most important number */}
                  <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-[10px] text-[18px] font-bold ${
                    item.severity === 'critical' ? 'bg-danger text-white' :
                    item.severity === 'warning' ? 'bg-warning text-white' :
                    'bg-surface-sunken text-content-secondary'
                  }`}>
                    {item.days}
                  </div>

                  <div className="flex-1">
                    <p className="text-[15px] font-semibold text-content">{item.case}</p>
                    <p className="text-caption">{item.type}</p>
                  </div>

                  <span className="text-caption">{item.owner}</span>

                  <span className={`rounded-lg px-3 py-1 text-[12px] font-semibold ${
                    item.severity === 'critical' ? 'bg-danger/10 text-danger' :
                    item.severity === 'warning' ? 'bg-warning/10 text-warning' :
                    'bg-surface-sunken text-content-tertiary'
                  }`}>
                    {item.days} days
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Visa Bulletin — right 2 cols, secondary info */}
          <section className="col-span-2 card-elevated p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-subheading text-content">Visa Bulletin</h2>
              <span className="text-caption">April 2026</span>
            </div>
            <p className="mt-1 text-caption">Auto-scraped from DOS monthly</p>

            <div className="mt-5 space-y-3">
              {BULLETIN.map((row, i) => (
                <div key={i} className="flex items-center justify-between rounded-[10px] border border-surface-border p-4">
                  <div>
                    <p className="text-[14px] font-semibold text-content">{row.category}</p>
                    <p className="text-caption">{row.country}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-medium text-content">{row.cutoff}</p>
                    <p className={`text-[12px] font-medium ${
                      row.change.includes('Advanced') ? 'text-warning' :
                      row.change.includes('Current for') ? 'text-success' :
                      row.change === 'Current' ? 'text-success' :
                      'text-content-tertiary'
                    }`}>{row.change}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
