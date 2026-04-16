import type { ReactElement } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { FileText, CheckCircle2, AlertTriangle, Eye, Download, Printer, Plus, Search } from 'lucide-react';

const FORMS = [
  { code: 'I-140', edition: '04/01/2026', case: 'Priya Sharma · NIW', filled: 67, total: 74, warnings: 3, status: 'validated' as const },
  { code: 'I-907', edition: '10/01/2025', case: 'Priya Sharma · NIW', filled: 8, total: 8, warnings: 0, status: 'approved' as const },
  { code: 'G-28', edition: '03/06/2023', case: 'Priya Sharma · NIW', filled: 12, total: 12, warnings: 0, status: 'approved' as const },
  { code: 'I-129', edition: '04/01/2026', case: 'Ramesh Iyer · H-1B', filled: 54, total: 68, warnings: 5, status: 'draft' as const },
  { code: 'I-130', edition: '04/01/2024', case: 'Lucia Moreno · Family', filled: 38, total: 38, warnings: 0, status: 'filed' as const },
  { code: 'N-400', edition: '04/01/2024', case: 'Dmitri Volkov · Naturalization', filled: 0, total: 88, warnings: 0, status: 'draft' as const },
  { code: 'I-589', edition: '04/01/2024', case: 'Ayaan Hussein · Asylum', filled: 24, total: 71, warnings: 8, status: 'draft' as const },
];

const STATUS = {
  draft: { label: 'Draft', color: 'bg-surface-sunken text-content-tertiary' },
  validated: { label: 'Validated', color: 'bg-warning-light text-warning' },
  approved: { label: 'Approved', color: 'bg-success-light text-success' },
  filed: { label: 'Filed', color: 'bg-success-light text-success' },
};

export default function FormsPage(): ReactElement {
  return (
    <>
      <Topbar firstName="Danish" previewMode />
      <main className="flex-1 overflow-y-auto px-8 py-7">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading text-content">Forms Engine</h1>
            <p className="mt-1 text-body">{FORMS.length} forms · auto-fill from case data</p>
          </div>
          <button className="flex items-center gap-2 rounded-[10px] bg-content text-content-inverse px-4 py-2.5 text-[13px] font-semibold shadow-sm hover:bg-content/90">
            <Plus className="h-4 w-4" /> Add form
          </button>
        </div>

        {/* Search */}
        <div className="mt-6 relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
          <input placeholder="Search forms..." className="w-full rounded-[10px] border border-surface-border bg-surface-raised py-3 pl-11 pr-4 text-[14px] placeholder:text-content-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10" />
        </div>

        {/* Forms list — clean cards */}
        <div className="mt-6 space-y-3">
          {FORMS.map((form, i) => {
            const pct = form.total > 0 ? Math.round((form.filled / form.total) * 100) : 0;
            const s = STATUS[form.status];
            return (
              <div key={i} className="group card-elevated flex items-center gap-5 p-5 transition-all hover:shadow-card-hover">
                {/* Icon */}
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[10px] bg-brand-lighter">
                  <FileText className="h-6 w-6 text-brand" />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <p className="text-[16px] font-semibold text-content">Form {form.code}</p>
                    <span className={`badge ${s.color}`}>{s.label}</span>
                    {form.warnings > 0 && (
                      <span className="badge badge-warning"><AlertTriangle className="h-3 w-3" /> {form.warnings}</span>
                    )}
                  </div>
                  <p className="mt-1 text-caption">{form.case} · ed. {form.edition}</p>
                </div>

                {/* Progress — clear bar with numbers */}
                <div className="w-40 shrink-0">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-content-tertiary">{form.filled}/{form.total}</span>
                    <span className="font-semibold text-content">{pct}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-sunken">
                    <div className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-success' : pct > 50 ? 'bg-brand' : 'bg-content-muted/40'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="rounded-lg p-2 text-content-muted hover:bg-surface-sunken hover:text-content"><Eye className="h-4 w-4" /></button>
                  <button className="rounded-lg p-2 text-content-muted hover:bg-surface-sunken hover:text-content"><Download className="h-4 w-4" /></button>
                  {pct === 100 && form.status !== 'filed' && (
                    <button className="rounded-lg bg-content text-content-inverse px-3 py-1.5 text-[12px] font-semibold"><Printer className="mr-1 inline h-3.5 w-3.5" />Render PDF</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
