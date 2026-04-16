import type { ReactElement } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { CaseHeader } from '@/components/case/case-header';
import { Sparkles, AlertTriangle, Upload } from 'lucide-react';

const PRONGS = [
  { name: 'Prong 1', label: 'Substantial merit & national importance', score: 92, met: true, detail: '3 peer-reviewed papers, DOE grant letter, 2 media mentions.' },
  { name: 'Prong 2', label: 'Well positioned to advance', score: 81, met: true, detail: '94 citations, H-index 8, adoption record, employer support.' },
  { name: 'Prong 3', label: 'Balance favors waiver', score: 68, met: false, detail: 'Needs comparable-worker scarcity evidence.' },
];

const TASKS = [
  { done: true, text: 'Draft I-140' },
  { done: false, text: 'Request 2 recommender letters' },
  { done: false, text: 'Finalize cover brief' },
  { done: false, text: 'Attorney sign-off' },
];

const DEADLINES = [
  { label: 'RFE response', date: 'Apr 24', urgent: true },
  { label: 'Recommender letter', date: 'May 02' },
  { label: 'Exhibit freeze', date: 'May 06' },
];

export default function CaseDetailPage(): ReactElement {
  return (
    <>
      <Topbar firstName="Danish" previewMode />
      <main className="flex-1 overflow-y-auto">
        <CaseHeader caseId="1" />

        <div className="grid grid-cols-3 gap-6 px-8 py-7">

          {/* Left: Eligibility — the main focus */}
          <div className="col-span-2">
            <section className="card-elevated p-6">
              <h2 className="text-subheading text-content">Dhanasar prongs</h2>
              <p className="mt-1 text-caption">Re-scored automatically on each document upload</p>

              <div className="mt-6 space-y-6">
                {PRONGS.map((p) => (
                  <div key={p.name}>
                    <div className="flex items-center justify-between">
                      <p className="text-[15px] font-semibold text-content">
                        <span className="text-content-tertiary">{p.name}</span> {p.label}
                      </p>
                      <span className={`badge ${p.met ? 'badge-success' : 'badge-warning'}`}>
                        {p.met ? 'Met' : 'Partial'} · {p.score}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-sunken">
                      <div className={`h-full rounded-full transition-all ${p.met ? 'bg-success' : 'bg-warning'}`} style={{ width: `${p.score}%` }} />
                    </div>
                    <p className="mt-2 text-body">{p.detail}</p>
                  </div>
                ))}
              </div>

              {/* AI suggestion — prominent but not overwhelming */}
              <div className="mt-6 rounded-[14px] border border-brand/20 bg-brand-lighter p-5">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                  <div>
                    <p className="text-[15px] font-semibold text-brand-dark">AI suggestion</p>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-brand-dark/80">
                      Add a declaration from Dr. K. Novak and the 2025 DOE workforce gap report.
                      Prong 3 would improve from <strong>68% → 82%</strong>, overall score <strong>84 → 89</strong>.
                    </p>
                    <button className="mt-3 rounded-[10px] bg-brand px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-brand/20 hover:bg-brand-light">
                      Accept suggestions
                    </button>
                  </div>
                </div>
              </div>

              {/* Attorney review ribbon */}
              <div className="mt-4 flex items-center gap-2 rounded-[10px] bg-warning-light border border-warning/20 px-5 py-3">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <p className="text-[13px] font-medium text-warning">DRAFT — Requires attorney review before sharing with client</p>
              </div>
            </section>
          </div>

          {/* Right: Tasks + Deadlines — clean sidebar */}
          <div className="space-y-5">
            {/* Tasks */}
            <section className="card-elevated p-6">
              <h3 className="text-subheading text-content">Next actions</h3>
              <ul className="mt-4 space-y-3">
                {TASKS.map((t) => (
                  <li key={t.text} className="flex items-start gap-3">
                    <input type="checkbox" defaultChecked={t.done} className="mt-0.5 h-4 w-4 rounded border-surface-border-hover" />
                    <span className={`text-[14px] ${t.done ? 'text-content-muted line-through' : 'text-content'}`}>{t.text}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Deadlines */}
            <section className="card-elevated p-6">
              <h3 className="text-subheading text-content">Deadlines</h3>
              <ul className="mt-4 space-y-3">
                {DEADLINES.map((d) => (
                  <li key={d.label} className="flex items-center justify-between">
                    <span className="text-[14px] text-content-secondary">{d.label}</span>
                    <span className={`text-[14px] font-semibold ${d.urgent ? 'text-danger' : 'text-content'}`}>{d.date}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Quick stats */}
            <section className="card-elevated p-6">
              <h3 className="text-subheading text-content">Documents</h3>
              <p className="mt-1 text-[28px] font-bold text-content">38</p>
              <p className="text-caption">All classified by AI</p>
              <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] border border-surface-border py-2.5 text-[13px] font-medium text-content-secondary hover:bg-surface-sunken">
                <Upload className="h-4 w-4" /> Upload more
              </button>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
