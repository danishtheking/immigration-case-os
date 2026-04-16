import type { ReactElement } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { CaseHeader } from '@/components/case/case-header';
import { Sparkles, AlertTriangle, Upload } from 'lucide-react';

const PRONGS = [
  { name: 'Prong 1', label: 'Substantial merit & national importance', score: 92, met: true, evidence: '3 peer-reviewed papers (climate modeling), DOE grant letter, 2 media mentions.' },
  { name: 'Prong 2', label: 'Well positioned to advance', score: 81, met: true, evidence: 'Citations (94), H-index 8, record of adoption, employer support.' },
  { name: 'Prong 3', label: 'Balance favors waiver', score: 68, met: false, evidence: 'Needs: comparable-worker scarcity evidence + expanded national-impact narrative.' },
];

const TASKS = [
  { done: true, text: 'Draft I-140' },
  { done: false, text: 'Request 2 more recommender letters' },
  { done: false, text: 'Finalize cover brief (AI draft ready)' },
  { done: false, text: 'Assemble exhibits A-N' },
  { done: false, text: 'Attorney sign-off' },
];

const DEADLINES = [
  { label: 'Premium processing filing', date: 'Apr 24', urgent: true },
  { label: 'Recommender letter #4', date: 'May 02', urgent: false },
  { label: 'Exhibit package freeze', date: 'May 06', urgent: false },
];

const DOCUMENTS = [
  { name: 'CV', count: 1, color: 'bg-zinc-100 text-zinc-700' },
  { name: 'Publications', count: 7, color: 'bg-blue-50 text-blue-700' },
  { name: 'Citations', count: 3, color: 'bg-cyan-50 text-cyan-700' },
  { name: 'Recs', count: 4, color: 'bg-indigo-50 text-indigo-700' },
  { name: 'Media', count: 2, color: 'bg-violet-50 text-violet-700' },
  { name: 'Awards', count: 1, color: 'bg-amber-50 text-amber-700' },
  { name: 'Other', count: 20, color: 'bg-zinc-50 text-zinc-500' },
];

export default function CaseDetailPage(): ReactElement {
  return (
    <>
      <Topbar firstName="Danish" previewMode />
      <main className="flex-1 overflow-y-auto">
        <CaseHeader caseId="1" />

        <div className="grid grid-cols-3 gap-4 p-6">
          {/* Left: Criteria */}
          <div className="col-span-2 space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-900">Dhanasar prongs</h2>
                <span className="text-[11px] text-zinc-400">re-scored on each upload</span>
              </div>
              <div className="mt-5 space-y-5">
                {PRONGS.map((p) => (
                  <div key={p.name}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[13px] font-semibold text-zinc-900">{p.name}</span>
                        <span className="ml-2 text-[13px] text-zinc-500">{p.label}</span>
                      </div>
                      <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${p.met ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {p.met ? 'Met' : 'Partial'} · {p.score}%
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                      <div className={`h-full rounded-full ${p.met ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${p.score}%` }} />
                    </div>
                    <p className="mt-1.5 text-[12px] text-zinc-500">{p.evidence}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <div>
                    <p className="text-[13px] font-semibold text-blue-900">AI suggestion</p>
                    <p className="mt-1 text-[12px] text-blue-800">
                      Add a declaration from Dr. K. Novak (coauthor at NREL) and the 2025 DOE workforce gap report. Projected Prong 3: <span className="font-bold">68% → 82%</span>, overall: <span className="font-bold">84 → 89</span>.
                    </p>
                    <button className="mt-2 rounded-md bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-500">Accept suggestions</button>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-[12px] text-amber-800">
                <AlertTriangle className="mr-1.5 inline h-3.5 w-3.5" />
                <span className="font-semibold">DRAFT</span> — Requires attorney review before sharing with client.
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <h3 className="text-[13px] font-semibold text-zinc-900">Next actions</h3>
              <ul className="mt-3 space-y-2.5">
                {TASKS.map((t) => (
                  <li key={t.text} className="flex items-start gap-2.5">
                    <input type="checkbox" defaultChecked={t.done} className="mt-0.5 rounded border-zinc-300" />
                    <span className={`text-[13px] ${t.done ? 'text-zinc-400 line-through' : 'text-zinc-700'}`}>{t.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <h3 className="text-[13px] font-semibold text-zinc-900">Deadlines</h3>
              <ul className="mt-3 space-y-2">
                {DEADLINES.map((d) => (
                  <li key={d.label} className="flex items-center justify-between">
                    <span className="text-[13px] text-zinc-600">{d.label}</span>
                    <span className={`text-[13px] font-medium ${d.urgent ? 'text-red-600' : 'text-zinc-700'}`}>{d.date}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-semibold text-zinc-900">Documents (38)</h3>
                <button className="rounded-md border border-zinc-200 p-1.5 text-zinc-400 hover:bg-zinc-50"><Upload className="h-3.5 w-3.5" /></button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {DOCUMENTS.map((d) => (
                  <span key={d.name} className={`rounded-md px-2 py-1 text-[11px] font-medium ${d.color}`}>{d.name} ({d.count})</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
