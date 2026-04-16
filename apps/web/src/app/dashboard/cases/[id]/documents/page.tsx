import type { ReactElement } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { CaseHeader } from '@/components/case/case-header';
import {
  Upload, Search, FileText, Image, CheckCircle2,
  Sparkles, Clock, Eye, Download,
} from 'lucide-react';

const DOCS = [
  { id: '1', filename: 'Sharma_CV_2026.pdf', category: 'CV', size: '245 KB', pages: 4, confidence: 97, confirmed: true, date: 'Mar 14', mime: 'pdf' },
  { id: '2', filename: 'Nature_Climate_Change_2024.pdf', category: 'Publication', size: '1.2 MB', pages: 12, confidence: 94, confirmed: true, date: 'Mar 15', mime: 'pdf' },
  { id: '3', filename: 'DOE_Grant_Letter.pdf', category: 'Award', size: '89 KB', pages: 2, confidence: 88, confirmed: false, date: 'Mar 15', mime: 'pdf' },
  { id: '4', filename: 'Science_Daily_Coverage.pdf', category: 'Media', size: '340 KB', pages: 3, confidence: 91, confirmed: true, date: 'Mar 18', mime: 'pdf' },
  { id: '5', filename: 'Citation_Report_Scholar.pdf', category: 'Citations', size: '156 KB', pages: 6, confidence: 96, confirmed: false, date: 'Mar 20', mime: 'pdf' },
  { id: '6', filename: 'Rec_Letter_Dr_Novak.pdf', category: 'Recommendation', size: '78 KB', pages: 2, confidence: 93, confirmed: true, date: 'Mar 22', mime: 'pdf' },
  { id: '7', filename: 'IEEE_Membership_Cert.jpg', category: 'Membership', size: '420 KB', pages: 1, confidence: 85, confirmed: false, date: 'Mar 25', mime: 'image' },
  { id: '8', filename: 'H1B_Salary_LCA.pdf', category: 'Salary', size: '34 KB', pages: 1, confidence: 92, confirmed: true, date: 'Mar 28', mime: 'pdf' },
];

export default function DocumentsPage(): ReactElement {
  const confirmed = DOCS.filter((d) => d.confirmed).length;

  return (
    <>
      <Topbar firstName="Danish" previewMode />
      <main className="flex-1 overflow-y-auto">
        <CaseHeader caseId="1" />

        <div className="px-8 py-7">
          {/* Page title — simple, clear */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-heading text-content">Documents</h2>
              <p className="mt-1 text-body">{DOCS.length} files · {confirmed} attorney-confirmed</p>
            </div>
            <button className="flex items-center gap-2 rounded-[10px] bg-brand px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-brand/20 hover:bg-brand-light">
              <Upload className="h-4 w-4" /> Upload
            </button>
          </div>

          {/* Upload zone — prominent but not overwhelming */}
          <div className="mt-6 rounded-[14px] border-2 border-dashed border-surface-border-hover bg-surface p-10 text-center transition-colors hover:border-brand/40 hover:bg-brand-lighter/30">
            <Upload className="mx-auto h-10 w-10 text-content-muted" />
            <p className="mt-3 text-[15px] font-medium text-content-secondary">Drop files here or click to upload</p>
            <p className="mt-1 text-caption">PDF, DOCX, JPG, PNG · Max 25 MB</p>
          </div>

          {/* Search — clean, single row */}
          <div className="mt-6 relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
            <input
              placeholder="Search documents..."
              className="w-full rounded-[10px] border border-surface-border bg-surface-raised py-3 pl-11 pr-4 text-[14px] placeholder:text-content-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
            />
          </div>

          {/* Document list — clean cards with clear hierarchy */}
          <div className="mt-6 space-y-3">
            {DOCS.map((doc) => (
              <div key={doc.id} className="group card-elevated flex items-center gap-5 p-5 transition-all hover:shadow-card-hover">
                {/* Icon */}
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-[10px] ${doc.mime === 'image' ? 'bg-purple-50' : 'bg-brand-lighter'}`}>
                  {doc.mime === 'image' ? <Image className="h-6 w-6 text-purple-500" /> : <FileText className="h-6 w-6 text-brand" />}
                </div>

                {/* File info — clear hierarchy: name big, details small */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-semibold text-content">{doc.filename}</p>
                    {doc.confirmed && <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />}
                  </div>
                  <p className="mt-1 text-caption">{doc.size} · {doc.pages} pages · {doc.date}</p>
                </div>

                {/* Category — one clear badge */}
                <span className="rounded-lg bg-surface-sunken px-3 py-1.5 text-[13px] font-semibold text-content-secondary">
                  {doc.category}
                </span>

                {/* AI confidence */}
                <div className="flex items-center gap-1.5 text-caption">
                  <Sparkles className="h-3.5 w-3.5 text-brand" />
                  <span>{doc.confidence}%</span>
                </div>

                {/* Actions — appear on hover */}
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button className="rounded-lg p-2 text-content-muted hover:bg-surface-sunken hover:text-content"><Eye className="h-4 w-4" /></button>
                  <button className="rounded-lg p-2 text-content-muted hover:bg-surface-sunken hover:text-content"><Download className="h-4 w-4" /></button>
                  {!doc.confirmed && (
                    <button className="rounded-lg bg-success-light px-3 py-1.5 text-[12px] font-semibold text-success hover:bg-success/10">Confirm</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
