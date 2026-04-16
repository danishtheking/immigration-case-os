import type { ReactElement } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { AlertTriangle, Clock, Calendar, ChevronLeft, ChevronRight, Bell } from 'lucide-react';

const WEEK_DAYS = ['Mon 14', 'Tue 15', 'Wed 16', 'Thu 17', 'Fri 18', 'Sat 19', 'Sun 20'];

const CALENDAR_ITEMS: { day: number; label: string; type: string; color: string; bg: string }[] = [
  { day: 0, label: 'Volkov · interview prep', type: 'N-400', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  { day: 1, label: 'Moreno · biometrics', type: 'I-130', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  { day: 2, label: 'Sharma · NIW Prong 3 evidence', type: 'RFE d-15', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  { day: 3, label: 'Iyer · LCA posted', type: 'H-1B', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  { day: 4, label: 'Silva · 90-day window ends', type: 'I-751', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
];

const AGENCY_CLOCKS = [
  { case: 'Sharma', type: 'RFE (NIW)', daysLeft: 15, owner: 'Danish', urgent: true },
  { case: 'Kapoor', type: 'NOID (I-130)', daysLeft: 6, owner: 'Rahul', urgent: true },
  { case: 'Osei', type: 'I-907 response', daysLeft: 9, owner: 'Jess', urgent: false },
  { case: 'Hussein', type: 'Asylum one-year bar', daysLeft: 41, owner: 'Danish', urgent: false },
  { case: 'Wei', type: 'O-1A petition', daysLeft: 33, owner: 'Jess', urgent: false },
];

const VISA_BULLETIN = [
  { category: 'EB-2', country: 'India', cutoff: '01 Nov 2012', status: 'Advanced 2w', statusColor: 'bg-amber-50 text-amber-700' },
  { category: 'EB-2', country: 'China', cutoff: '01 Jun 2020', status: 'Unchanged', statusColor: 'bg-surface-sunken text-content-secondary' },
  { category: 'EB-3', country: 'India', cutoff: '15 May 2013', status: 'Current for 2 cases', statusColor: 'bg-emerald-50 text-emerald-700' },
  { category: 'F-2A', country: 'Mexico', cutoff: 'Current', status: 'Current', statusColor: 'bg-emerald-50 text-emerald-700' },
  { category: 'EB-1', country: 'All', cutoff: 'Current', status: 'Current', statusColor: 'bg-emerald-50 text-emerald-700' },
];

export default function DeadlinesPage(): ReactElement {
  return (
    <>
      <Topbar firstName="Danish" previewMode />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-content">Deadlines & Ticklers</h1>
            <p className="text-[12px] text-content-tertiary">RFE clocks, Visa Bulletin, hearing dates, filing windows</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 rounded-lg border border-surface-border px-3 py-2 text-[12px] text-content-secondary hover:bg-surface">
              <Bell className="h-3.5 w-3.5" /> Escalation rules
            </button>
          </div>
        </div>

        {/* Week calendar */}
        <div className="mt-5 rounded-xl border border-surface-border bg-surface-raised p-5">
          <div className="mb-4 flex items-center justify-between">
            <button className="rounded-md p-1.5 text-content-muted hover:bg-surface-sunken"><ChevronLeft className="h-4 w-4" /></button>
            <h2 className="text-[13px] font-semibold text-content">Week of April 14, 2026</h2>
            <button className="rounded-md p-1.5 text-content-muted hover:bg-surface-sunken"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {WEEK_DAYS.map((day, i) => (
              <div key={day} className="text-center">
                <p className="mb-2 text-[12px] font-medium text-content-muted">{day}</p>
                <div className="min-h-[80px] rounded-lg border border-surface-border/50 p-2">
                  {CALENDAR_ITEMS.filter((item) => item.day === i).map((item) => (
                    <div key={item.label} className={`rounded-md border p-2 text-[12px] ${item.bg}`}>
                      <span className={`font-semibold ${item.color}`}>{item.type}</span>
                      <p className="mt-0.5 text-content-secondary">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          {/* Agency clocks */}
          <div className="rounded-xl border border-surface-border bg-surface-raised p-5">
            <h2 className="text-[13px] font-semibold text-content">Agency response clocks</h2>
            <div className="mt-3">
              <table className="w-full">
                <thead>
                  <tr className="text-[12px] font-semibold uppercase tracking-wider text-content-muted">
                    <th className="pb-2 text-left">Case</th>
                    <th className="pb-2 text-left">Type</th>
                    <th className="pb-2 text-right">Days left</th>
                    <th className="pb-2 text-left pl-3">Owner</th>
                  </tr>
                </thead>
                <tbody className="text-[13px]">
                  {AGENCY_CLOCKS.map((c) => (
                    <tr key={c.case} className="border-t border-surface-border/30">
                      <td className="py-2.5 font-medium text-content">{c.case}</td>
                      <td className="py-2.5 text-content-secondary">{c.type}</td>
                      <td className={`py-2.5 text-right font-semibold ${c.daysLeft <= 10 ? 'text-red-600' : c.daysLeft <= 20 ? 'text-amber-600' : 'text-content-secondary'}`}>{c.daysLeft}</td>
                      <td className="py-2.5 pl-3 text-content-tertiary">{c.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visa Bulletin */}
          <div className="rounded-xl border border-surface-border bg-surface-raised p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-content">Visa Bulletin · April 2026</h2>
              <span className="text-[12px] text-content-muted">Auto-scraped from DOS</span>
            </div>
            <div className="mt-3">
              <table className="w-full">
                <thead>
                  <tr className="text-[12px] font-semibold uppercase tracking-wider text-content-muted">
                    <th className="pb-2 text-left">Category</th>
                    <th className="pb-2 text-left">Country</th>
                    <th className="pb-2 text-left">Cutoff</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-[13px]">
                  {VISA_BULLETIN.map((v, i) => (
                    <tr key={i} className="border-t border-surface-border/30">
                      <td className="py-2.5 font-medium text-content">{v.category}</td>
                      <td className="py-2.5 text-content-secondary">{v.country}</td>
                      <td className="py-2.5 text-content-secondary">{v.cutoff}</td>
                      <td className="py-2.5 text-right"><span className={`rounded-md px-2 py-0.5 text-[12px] font-semibold ${v.statusColor}`}>{v.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
