import type { ReactElement } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { Download, TrendingUp, Users, Clock, CheckCircle2 } from 'lucide-react';

const CASE_MIX = [
  { type: 'EB-2 NIW', count: 87, pct: 21, color: 'bg-blue-500' },
  { type: 'H-1B', count: 72, pct: 17, color: 'bg-violet-500' },
  { type: 'EB-1A', count: 58, pct: 14, color: 'bg-cyan-500' },
  { type: 'I-130 / I-485', count: 54, pct: 13, color: 'bg-rose-500' },
  { type: 'O-1A', count: 41, pct: 10, color: 'bg-teal-500' },
  { type: 'I-589 Asylum', count: 34, pct: 8, color: 'bg-orange-500' },
  { type: 'N-400', count: 28, pct: 7, color: 'bg-emerald-500' },
  { type: 'Other', count: 38, pct: 10, color: 'bg-zinc-400' },
];

const ATTORNEYS = [
  { name: 'Danish', active: 156, filed: 23, approved: 18, rfeRate: '12%', avgCycle: '4.2mo' },
  { name: 'Jess', active: 134, filed: 19, approved: 16, rfeRate: '8%', avgCycle: '3.8mo' },
  { name: 'Rahul', active: 122, filed: 15, approved: 12, rfeRate: '15%', avgCycle: '5.1mo' },
];

export default function ReportsPage(): ReactElement {
  return (
    <>
      <Topbar firstName="Danish" previewMode />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900">Reports & Analytics</h1>
            <p className="text-[12px] text-zinc-500">Caseload, cycle times, approval rates, revenue</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-[12px] text-zinc-600 hover:bg-zinc-50">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>

        {/* Top KPIs */}
        <div className="mt-4 grid grid-cols-4 gap-3">
          <ReportCard label="Total cases (all time)" value="412" change="+18 this week" icon={<Users className="h-4 w-4" />} />
          <ReportCard label="Avg. cycle time" value="4.3 mo" change="-0.2 vs last quarter" icon={<Clock className="h-4 w-4" />} />
          <ReportCard label="Approval rate" value="94.2%" change="+1.8% vs last quarter" icon={<CheckCircle2 className="h-4 w-4" />} />
          <ReportCard label="Revenue (YTD)" value="$1.47M" change="+22% vs last year" icon={<TrendingUp className="h-4 w-4" />} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          {/* Case type mix */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="text-[13px] font-semibold text-zinc-900">Case type distribution</h2>
            <div className="mt-4 space-y-3">
              {CASE_MIX.map((c) => (
                <div key={c.type} className="flex items-center gap-3">
                  <span className="w-28 text-[12px] text-zinc-600">{c.type}</span>
                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                      <div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.pct * 4}%` }} />
                    </div>
                  </div>
                  <span className="w-8 text-right text-[12px] font-medium text-zinc-700">{c.count}</span>
                  <span className="w-10 text-right text-[11px] text-zinc-400">{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by month (bar placeholder) */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="text-[13px] font-semibold text-zinc-900">Monthly revenue</h2>
            <div className="mt-4 flex items-end gap-2" style={{ height: 200 }}>
              {[120, 145, 138, 162, 178, 184, 156, 192, 184, 168, 195, 184].map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className={`w-full rounded-t-md ${i === 11 ? 'bg-blue-500' : 'bg-zinc-200'}`} style={{ height: `${(v / 200) * 100}%` }} />
                  <span className="text-[9px] text-zinc-400">{['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-right text-[11px] text-zinc-400">$K · current month highlighted</p>
          </div>
        </div>

        {/* Attorney performance */}
        <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-[13px] font-semibold text-zinc-900">Attorney performance</h2>
          <table className="mt-3 w-full">
            <thead>
              <tr className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <th className="pb-2 text-left">Attorney</th>
                <th className="pb-2 text-right">Active cases</th>
                <th className="pb-2 text-right">Filed (YTD)</th>
                <th className="pb-2 text-right">Approved</th>
                <th className="pb-2 text-right">RFE rate</th>
                <th className="pb-2 text-right">Avg cycle</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {ATTORNEYS.map((a) => (
                <tr key={a.name} className="border-t border-zinc-50">
                  <td className="py-2.5 font-medium text-zinc-900">{a.name}</td>
                  <td className="py-2.5 text-right text-zinc-700">{a.active}</td>
                  <td className="py-2.5 text-right text-zinc-700">{a.filed}</td>
                  <td className="py-2.5 text-right text-emerald-600 font-medium">{a.approved}</td>
                  <td className="py-2.5 text-right text-zinc-700">{a.rfeRate}</td>
                  <td className="py-2.5 text-right text-zinc-700">{a.avgCycle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}

function ReportCard({ label, value, change, icon }: { label: string; value: string; change: string; icon: ReactElement }): ReactElement {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-medium text-zinc-500">{label}</p>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-50 text-zinc-400">{icon}</div>
      </div>
      <p className="mt-2 text-2xl font-bold text-zinc-900">{value}</p>
      <p className="mt-1 text-[11px] text-emerald-600">{change}</p>
    </div>
  );
}
