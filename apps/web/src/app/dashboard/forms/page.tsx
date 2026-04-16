import type { ReactElement } from 'react';
import { Topbar } from '@/components/layout/topbar';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Eye,
  Printer,
  Plus,
  Search,
  ChevronRight,
} from 'lucide-react';

const FORMS = [
  { code: 'I-140', edition: '04/01/2026', case: 'Priya Sharma · NIW', filled: 67, total: 74, warnings: 3, status: 'validated' as const, rendered: true },
  { code: 'I-907', edition: '10/01/2025', case: 'Priya Sharma · NIW', filled: 8, total: 8, warnings: 0, status: 'attorney_approved' as const, rendered: true },
  { code: 'G-28', edition: '03/06/2023', case: 'Priya Sharma · NIW', filled: 12, total: 12, warnings: 0, status: 'attorney_approved' as const, rendered: true },
  { code: 'I-129', edition: '04/01/2026', case: 'Ramesh Iyer · H-1B', filled: 54, total: 68, warnings: 5, status: 'draft' as const, rendered: false },
  { code: 'I-129 O Supp', edition: '04/01/2026', case: 'Chen Wei · O-1A', filled: 21, total: 32, warnings: 2, status: 'draft' as const, rendered: false },
  { code: 'I-130', edition: '04/01/2024', case: 'Lucia Moreno · Family', filled: 38, total: 38, warnings: 0, status: 'filed' as const, rendered: true },
  { code: 'I-485', edition: '04/01/2024', case: 'Lucia Moreno · Family', filled: 52, total: 56, warnings: 1, status: 'filed' as const, rendered: true },
  { code: 'N-400', edition: '04/01/2024', case: 'Dmitri Volkov · Naturalization', filled: 0, total: 88, warnings: 0, status: 'draft' as const, rendered: false },
  { code: 'I-589', edition: '04/01/2024', case: 'Ayaan Hussein · Asylum', filled: 24, total: 71, warnings: 8, status: 'draft' as const, rendered: false },
  { code: 'I-751', edition: '04/01/2024', case: 'Ana & Pedro Silva', filled: 31, total: 34, warnings: 1, status: 'validated' as const, rendered: false },
];

const STATUS_MAP = {
  draft: { label: 'Draft', color: 'bg-zinc-100 text-zinc-600' },
  filled: { label: 'Filled', color: 'bg-blue-50 text-blue-700' },
  validated: { label: 'Validated', color: 'bg-amber-50 text-amber-700' },
  attorney_approved: { label: 'Approved', color: 'bg-emerald-50 text-emerald-700' },
  rendered: { label: 'Rendered', color: 'bg-indigo-50 text-indigo-700' },
  filed: { label: 'Filed', color: 'bg-emerald-50 text-emerald-700' },
};

export default function FormsPage(): ReactElement {
  return (
    <>
      <Topbar firstName="Danish" previewMode />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900">Forms Engine</h1>
            <p className="text-[12px] text-zinc-500">{FORMS.length} forms across all active cases · auto-fill from case data</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-[12px] font-medium text-white hover:bg-zinc-800">
            <Plus className="h-3.5 w-3.5" /> Add form to case
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input placeholder="Search forms by code, case, or status..." className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-4 text-[13px] placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200" />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {FORMS.map((form, i) => {
            const pct = form.total > 0 ? Math.round((form.filled / form.total) * 100) : 0;
            const s = STATUS_MAP[form.status];
            return (
              <div key={i} className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-300 hover:shadow-sm">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-blue-50">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-semibold text-zinc-900">Form {form.code}</p>
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${s.color}`}>{s.label}</span>
                    {form.warnings > 0 && (
                      <span className="flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                        <AlertTriangle className="h-2.5 w-2.5" /> {form.warnings}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-zinc-400">{form.case} · ed. {form.edition}</p>
                </div>

                {/* Progress */}
                <div className="w-40 shrink-0">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">{form.filled}/{form.total} fields</span>
                    <span className="font-medium text-zinc-700">{pct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : pct > 50 ? 'bg-blue-500' : 'bg-zinc-300'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600" title="Preview"><Eye className="h-4 w-4" /></button>
                  {form.rendered && <button className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600" title="Download PDF"><Download className="h-4 w-4" /></button>}
                  {!form.rendered && pct === 100 && <button className="rounded-md bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-zinc-800" title="Render PDF"><Printer className="mr-1 inline h-3 w-3" />Render</button>}
                  <ChevronRight className="h-4 w-4 text-zinc-300" />
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-[11px] text-zinc-400">Preview mode · 10 supported forms · PDF auto-fill from case data · edition tracking</p>
      </main>
    </>
  );
}
