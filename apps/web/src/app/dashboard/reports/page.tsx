import type { ReactElement } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { Download, TrendingUp, Users, Clock, CheckCircle2 } from 'lucide-react';

interface CaseType {
  type: string;
  count: number;
  pct: number;
  color: string;
}

interface Attorney {
  name: string;
  active: number;
  filed: number;
  approved: number;
  rfeRate: string;
  avgCycle: string;
}

const CASE_MIX: CaseType[] = [
  { type: 'EB-2 NIW', count: 87, pct: 21, color: 'bg-blue-500' },
  { type: 'H-1B', count: 72, pct: 17, color: 'bg-violet-500' },
  { type: 'EB-1A', count: 58, pct: 14, color: 'bg-cyan-500' },
  { type: 'I-130 / I-485', count: 54, pct: 13, color: 'bg-rose-500' },
  { type: 'O-1A', count: 41, pct: 10, color: 'bg-teal-500' },
  { type: 'Asylum', count: 34, pct: 8, color: 'bg-orange-500' },
  { type: 'N-400', count: 28, pct: 7, color: 'bg-emerald-500' },
  { type: 'Other', count: 38, pct: 10, color: 'bg-zinc-400' },
];

const ATTORNEYS: Attorney[] = [
  { name: 'Danish', active: 156, filed: 23, approved: 18, rfeRate: '12%', avgCycle: '4.2 mo' },
  { name: 'Jess', active: 134, filed: 19, approved: 16, rfeRate: '8%', avgCycle: '3.8 mo' },
  { name: 'Rahul', active: 122, filed: 15, approved: 12, rfeRate: '15%', avgCycle: '5.1 mo' },
];

function KpiCard({ label, value, change, icon }: {
  label: string;
  value: string;
  change: string;
  icon: ReactElement;
}): ReactElement {
  return (
    <div className="card-elevated rounded-[14px] bg-surface-raised p-6">
      <div className="flex items-center justify-between">
        <p className="text-caption text-content-tertiary">{label}</p>
        <div className="grid h-9 w-9 place-items-center rounded-[10px] bg-surface-sunken text-content-muted">
          {icon}
        </div>
      </div>
      <p className="text-[28px] font-bold text-content mt-2">{value}</p>
      <p className="text-caption text-emerald-600 mt-1">{change}</p>
    </div>
  );
}

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const REVENUE = [120, 145, 138, 162, 178, 184, 156, 192, 184, 168, 195, 184];

export default function ReportsPage(): ReactElement {
  return (
    <>
      <Topbar firstName="Danish" previewMode />
      <main className="flex-1 overflow-y-auto bg-surface px-8 py-7">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading">Reports & Analytics</h1>
            <p className="text-caption text-content-tertiary mt-1">Caseload, cycle times, approval rates, revenue</p>
          </div>
          <button className="flex items-center gap-2 rounded-[10px] border border-surface-border px-4 py-2.5 text-body text-content-secondary hover:bg-surface-sunken transition-colors">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        {/* KPIs */}
        <div className="mt-6 grid grid-cols-4 gap-5">
          <KpiCard label="Total cases" value="412" change="+18 this week" icon={<Users className="h-4 w-4" />} />
          <KpiCard label="Avg. cycle time" value="4.3 mo" change="-0.2 vs last quarter" icon={<Clock className="h-4 w-4" />} />
          <KpiCard label="Approval rate" value="94.2%" change="+1.8% vs last quarter" icon={<CheckCircle2 className="h-4 w-4" />} />
          <KpiCard label="Revenue (YTD)" value="$1.47M" change="+22% vs last year" icon={<TrendingUp className="h-4 w-4" />} />
        </div>

        {/* Charts row */}
        <div className="mt-6 grid grid-cols-2 gap-5">
          {/* Case type distribution */}
          <div className="card-elevated rounded-[14px] bg-surface-raised p-6">
            <h2 className="text-[16px] font-semibold text-content">Case Distribution</h2>
            <div className="mt-5 space-y-3.5">
              {CASE_MIX.map((c) => (
                <div key={c.type} className="flex items-center gap-3">
                  <span className="w-28 text-body text-content-secondary">{c.type}</span>
                  <div className="flex-1">
                    <div className="h-2.5 overflow-hidden rounded-full bg-surface-sunken">
                      <div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.pct * 4}%` }} />
                    </div>
                  </div>
                  <span className="w-10 text-right text-body font-medium text-content-secondary">{c.count}</span>
                  <span className="w-10 text-right text-caption text-content-muted">{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly revenue chart */}
          <div className="card-elevated rounded-[14px] bg-surface-raised p-6">
            <h2 className="text-[16px] font-semibold text-content">Monthly Revenue</h2>
            <div className="mt-5 flex items-end gap-2" style={{ height: 200 }}>
              {REVENUE.map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className={`w-full rounded-t-md transition-colors ${
                      i === 11 ? 'bg-brand' : 'bg-surface-sunken hover:bg-brand/30'
                    }`}
                    style={{ height: `${(v / 200) * 100}%` }}
                  />
                  <span className="text-micro text-content-muted">{MONTHS[i]}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-right text-caption text-content-muted">$K -- current month highlighted</p>
          </div>
        </div>

        {/* Attorney performance */}
        <div className="mt-6 card-elevated rounded-[14px] bg-surface-raised overflow-hidden">
          <div className="px-6 py-5 border-b border-surface-border">
            <h2 className="text-[16px] font-semibold text-content">Attorney Performance</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-micro font-semibold uppercase tracking-wider text-content-muted">
                <th className="px-6 py-3.5 text-left">Attorney</th>
                <th className="px-6 py-3.5 text-right">Active</th>
                <th className="px-6 py-3.5 text-right">Filed (YTD)</th>
                <th className="px-6 py-3.5 text-right">Approved</th>
                <th className="px-6 py-3.5 text-right">RFE rate</th>
                <th className="px-6 py-3.5 text-right">Avg cycle</th>
              </tr>
            </thead>
            <tbody>
              {ATTORNEYS.map((a) => (
                <tr key={a.name} className="border-t border-surface-border/30 transition-colors hover:bg-surface/50">
                  <td className="px-6 py-4 text-body font-medium text-content">{a.name}</td>
                  <td className="px-6 py-4 text-right text-body text-content-secondary">{a.active}</td>
                  <td className="px-6 py-4 text-right text-body text-content-secondary">{a.filed}</td>
                  <td className="px-6 py-4 text-right text-body font-medium text-emerald-600">{a.approved}</td>
                  <td className="px-6 py-4 text-right text-body text-content-secondary">{a.rfeRate}</td>
                  <td className="px-6 py-4 text-right text-body text-content-secondary">{a.avgCycle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
