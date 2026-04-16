import type { ReactElement } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { CaseHeader } from '@/components/case/case-header';
import {
  Upload,
  Search,
  SlidersHorizontal,
  FileText,
  Image,
  File,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Download,
  Trash2,
  MoreHorizontal,
  Sparkles,
  Clock,
} from 'lucide-react';

const DEMO_DOCS = [
  { id: '1', filename: 'Sharma_CV_2026.pdf', category: 'CV', criterionTags: [], size: '245 KB', pages: 4, status: 'classified' as const, confidence: '0.97', uploadedAt: 'Mar 14', confirmed: true, mime: 'pdf' },
  { id: '2', filename: 'Nature_Climate_Change_2024.pdf', category: 'Publication', criterionTags: ['Authorship', 'Original contribution'], size: '1.2 MB', pages: 12, status: 'classified' as const, confidence: '0.94', uploadedAt: 'Mar 15', confirmed: true, mime: 'pdf' },
  { id: '3', filename: 'DOE_Grant_Letter.pdf', category: 'Award / Grant', criterionTags: ['Awards', 'National importance'], size: '89 KB', pages: 2, status: 'classified' as const, confidence: '0.88', uploadedAt: 'Mar 15', confirmed: false, mime: 'pdf' },
  { id: '4', filename: 'Science_Daily_Coverage.pdf', category: 'Media', criterionTags: ['Published material about beneficiary'], size: '340 KB', pages: 3, status: 'classified' as const, confidence: '0.91', uploadedAt: 'Mar 18', confirmed: true, mime: 'pdf' },
  { id: '5', filename: 'Citation_Report_Scholar.pdf', category: 'Citations', criterionTags: ['Scholarly articles'], size: '156 KB', pages: 6, status: 'classified' as const, confidence: '0.96', uploadedAt: 'Mar 20', confirmed: false, mime: 'pdf' },
  { id: '6', filename: 'Rec_Letter_Dr_Novak.pdf', category: 'Recommendation', criterionTags: ['Critical capacity'], size: '78 KB', pages: 2, status: 'classified' as const, confidence: '0.93', uploadedAt: 'Mar 22', confirmed: true, mime: 'pdf' },
  { id: '7', filename: 'IEEE_Membership_Cert.jpg', category: 'Membership', criterionTags: ['Memberships'], size: '420 KB', pages: 1, status: 'classified' as const, confidence: '0.85', uploadedAt: 'Mar 25', confirmed: false, mime: 'image' },
  { id: '8', filename: 'H1B_Salary_LCA.pdf', category: 'Salary', criterionTags: ['High remuneration'], size: '34 KB', pages: 1, status: 'classified' as const, confidence: '0.92', uploadedAt: 'Mar 28', confirmed: true, mime: 'pdf' },
  { id: '9', filename: 'Passport_Scan.pdf', category: 'Identity', criterionTags: [], size: '1.8 MB', pages: 2, status: 'scanned' as const, confidence: '', uploadedAt: 'Apr 01', confirmed: false, mime: 'pdf' },
  { id: '10', filename: 'NREL_Workforce_Report_2025.pdf', category: 'Supporting', criterionTags: ['National importance'], size: '4.2 MB', pages: 48, status: 'classifying' as const, confidence: '', uploadedAt: 'Apr 14', confirmed: false, mime: 'pdf' },
];

const CATEGORIES = ['All', 'CV', 'Publication', 'Award / Grant', 'Media', 'Citations', 'Recommendation', 'Membership', 'Salary', 'Identity', 'Supporting'];

export default function DocumentsPage(): ReactElement {
  const classified = DEMO_DOCS.filter((d) => d.status === 'classified').length;
  const pending = DEMO_DOCS.filter((d) => d.status !== 'classified').length;
  const confirmed = DEMO_DOCS.filter((d) => d.confirmed).length;

  return (
    <>
      <Topbar firstName="Danish" previewMode />
      <main className="flex-1 overflow-y-auto">
        <CaseHeader caseId="1" />
        <div className="border-b border-surface-border bg-surface-raised px-6 py-3">
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-content-tertiary">
              {DEMO_DOCS.length} documents · {classified} classified · {confirmed} attorney-confirmed · {pending} processing
            </p>
            <button className="flex items-center gap-1.5 rounded-lg bg-content px-3 py-2 text-[12px] font-medium text-white hover:bg-content/90">
              <Upload className="h-3.5 w-3.5" /> Upload documents
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Upload zone */}
          <div className="rounded-xl border-2 border-dashed border-surface-border-hover bg-surface/50 p-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/20">
            <Upload className="mx-auto h-8 w-8 text-content-muted" />
            <p className="mt-2 text-[13px] font-medium text-content-secondary">Drop files here or click to upload</p>
            <p className="mt-1 text-[12px] text-content-muted">PDF, DOCX, JPG, PNG · Max 25 MB per file · Multiple files supported</p>
          </div>

          {/* Filters */}
          <div className="mt-5 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-content-muted" />
              <input placeholder="Search documents..." className="w-full rounded-lg border border-surface-border bg-surface-raised py-2 pl-9 pr-4 text-[13px] placeholder:text-content-muted focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200" />
            </div>
            <button className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-surface-raised px-3 py-2 text-[12px] text-content-secondary hover:bg-surface">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
            </button>
          </div>

          {/* Category tabs */}
          <div className="mt-3 flex flex-wrap gap-1">
            {CATEGORIES.map((cat, i) => (
              <button key={cat} className={`rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors ${i === 0 ? 'bg-content text-white' : 'border border-surface-border text-content-tertiary hover:bg-surface'}`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Document cards */}
          <div className="mt-4 space-y-2">
            {DEMO_DOCS.map((doc) => (
              <div key={doc.id} className="group flex items-center gap-4 rounded-xl border border-surface-border bg-surface-raised p-4 transition-colors hover:border-surface-border-hover hover:shadow-sm">
                {/* Icon */}
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${doc.mime === 'image' ? 'bg-violet-50' : 'bg-blue-50'}`}>
                  {doc.mime === 'image' ? <Image className="h-5 w-5 text-violet-500" /> : <FileText className="h-5 w-5 text-blue-500" />}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-medium text-content">{doc.filename}</p>
                    {doc.confirmed && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[12px] text-content-muted">
                    <span>{doc.size}</span>
                    <span>·</span>
                    <span>{doc.pages} {doc.pages === 1 ? 'page' : 'pages'}</span>
                    <span>·</span>
                    <span>{doc.uploadedAt}</span>
                  </div>
                </div>

                {/* Category + tags */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md bg-surface-sunken px-2 py-0.5 text-[12px] font-semibold text-content-secondary">{doc.category}</span>
                  {doc.criterionTags.map((tag) => (
                    <span key={tag} className="rounded-md bg-blue-50 px-2 py-0.5 text-[12px] font-medium text-blue-700">{tag}</span>
                  ))}
                </div>

                {/* Status */}
                <div className="w-24 shrink-0 text-right">
                  {doc.status === 'classified' && doc.confidence && (
                    <div className="flex items-center justify-end gap-1">
                      <Sparkles className="h-3 w-3 text-blue-500" />
                      <span className="text-[12px] font-medium text-content-secondary">{(parseFloat(doc.confidence) * 100).toFixed(0)}% conf</span>
                    </div>
                  )}
                  {doc.status === 'classifying' && (
                    <div className="flex items-center justify-end gap-1">
                      <Clock className="h-3 w-3 animate-spin text-amber-500" />
                      <span className="text-[12px] text-amber-600">Classifying...</span>
                    </div>
                  )}
                  {doc.status === 'scanned' && (
                    <span className="text-[12px] text-content-muted">Scanned</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button className="rounded-md p-1.5 text-content-muted hover:bg-surface-sunken hover:text-content-secondary"><Eye className="h-3.5 w-3.5" /></button>
                  <button className="rounded-md p-1.5 text-content-muted hover:bg-surface-sunken hover:text-content-secondary"><Download className="h-3.5 w-3.5" /></button>
                  {!doc.confirmed && doc.status === 'classified' && (
                    <button className="rounded-md bg-emerald-50 px-2 py-1 text-[12px] font-semibold text-emerald-700 hover:bg-emerald-100">Confirm</button>
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
