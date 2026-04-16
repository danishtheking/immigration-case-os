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
        <div className="border-b border-zinc-200 bg-white px-6 py-3">
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-zinc-500">
              {DEMO_DOCS.length} documents · {classified} classified · {confirmed} attorney-confirmed · {pending} processing
            </p>
            <button className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-[12px] font-medium text-white hover:bg-zinc-800">
              <Upload className="h-3.5 w-3.5" /> Upload documents
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Upload zone */}
          <div className="rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50/50 p-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/20">
            <Upload className="mx-auto h-8 w-8 text-zinc-400" />
            <p className="mt-2 text-[13px] font-medium text-zinc-600">Drop files here or click to upload</p>
            <p className="mt-1 text-[11px] text-zinc-400">PDF, DOCX, JPG, PNG · Max 25 MB per file · Multiple files supported</p>
          </div>

          {/* Filters */}
          <div className="mt-5 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <input placeholder="Search documents..." className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-4 text-[13px] placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200" />
            </div>
            <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[12px] text-zinc-600 hover:bg-zinc-50">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
            </button>
          </div>

          {/* Category tabs */}
          <div className="mt-3 flex flex-wrap gap-1">
            {CATEGORIES.map((cat, i) => (
              <button key={cat} className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${i === 0 ? 'bg-zinc-900 text-white' : 'border border-zinc-200 text-zinc-500 hover:bg-zinc-50'}`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Document cards */}
          <div className="mt-4 space-y-2">
            {DEMO_DOCS.map((doc) => (
              <div key={doc.id} className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:shadow-sm">
                {/* Icon */}
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${doc.mime === 'image' ? 'bg-violet-50' : 'bg-blue-50'}`}>
                  {doc.mime === 'image' ? <Image className="h-5 w-5 text-violet-500" /> : <FileText className="h-5 w-5 text-blue-500" />}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-medium text-zinc-900">{doc.filename}</p>
                    {doc.confirmed && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-400">
                    <span>{doc.size}</span>
                    <span>·</span>
                    <span>{doc.pages} {doc.pages === 1 ? 'page' : 'pages'}</span>
                    <span>·</span>
                    <span>{doc.uploadedAt}</span>
                  </div>
                </div>

                {/* Category + tags */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-700">{doc.category}</span>
                  {doc.criterionTags.map((tag) => (
                    <span key={tag} className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">{tag}</span>
                  ))}
                </div>

                {/* Status */}
                <div className="w-24 shrink-0 text-right">
                  {doc.status === 'classified' && doc.confidence && (
                    <div className="flex items-center justify-end gap-1">
                      <Sparkles className="h-3 w-3 text-blue-500" />
                      <span className="text-[11px] font-medium text-zinc-600">{(parseFloat(doc.confidence) * 100).toFixed(0)}% conf</span>
                    </div>
                  )}
                  {doc.status === 'classifying' && (
                    <div className="flex items-center justify-end gap-1">
                      <Clock className="h-3 w-3 animate-spin text-amber-500" />
                      <span className="text-[11px] text-amber-600">Classifying...</span>
                    </div>
                  )}
                  {doc.status === 'scanned' && (
                    <span className="text-[11px] text-zinc-400">Scanned</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"><Eye className="h-3.5 w-3.5" /></button>
                  <button className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"><Download className="h-3.5 w-3.5" /></button>
                  {!doc.confirmed && doc.status === 'classified' && (
                    <button className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100">Confirm</button>
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
