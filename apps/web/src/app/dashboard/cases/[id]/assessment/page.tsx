import type { ReactElement } from 'react';
import Link from 'next/link';
import { Topbar } from '@/components/layout/topbar';
import { CaseHeader } from '@/components/case/case-header';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Minus,
  Sparkles,
  Share2,
  RotateCcw,
  Shield,
  FileText,
} from 'lucide-react';

const CRITERIA = [
  { code: 'awards', name: 'Awards / prizes of national or international recognition', met: true, confidence: 72, rationale: 'DOE Early Career Award (2024), NSF CAREER award finalist. Both have national scope within climate science.', evidence: ['DOE_Grant_Letter.pdf'], gaps: [] },
  { code: 'memberships', name: 'Membership in associations requiring outstanding achievement', met: true, confidence: 68, rationale: 'IEEE Senior Member (requires 10+ years + significant contributions). AGU Fellow nomination pending.', evidence: ['IEEE_Membership_Cert.jpg'], gaps: ['AGU Fellows confirmation would strengthen'] },
  { code: 'published_material', name: 'Published material about the beneficiary', met: true, confidence: 91, rationale: 'Science Daily feature (2024), university press release with 12k views, Nature Climate Change news highlight.', evidence: ['Science_Daily_Coverage.pdf'], gaps: [] },
  { code: 'judging', name: 'Judge of the work of others', met: false, confidence: 35, rationale: 'Limited evidence. One conference review assignment (AAAI 2025) but no sustained pattern of peer review activity.', evidence: [], gaps: ['Obtain Publons/Web of Science reviewer profile', 'Add editorial board membership or dissertation committee service'] },
  { code: 'original_contributions', name: 'Original contributions of major significance', met: true, confidence: 88, rationale: '3 peer-reviewed publications with 94 combined citations. Novel climate modeling framework adopted by 2 national labs.', evidence: ['Nature_Climate_Change_2024.pdf', 'Citation_Report_Scholar.pdf'], gaps: [] },
  { code: 'scholarly_articles', name: 'Scholarly articles in professional journals', met: true, confidence: 96, rationale: '7 peer-reviewed articles in Q1 journals (Nature Climate Change, J. Geophysical Research, Atmospheric Chemistry and Physics). H-index 8.', evidence: ['Nature_Climate_Change_2024.pdf', 'Citation_Report_Scholar.pdf'], gaps: [] },
  { code: 'critical_capacity', name: 'Employment in a critical or essential capacity', met: true, confidence: 79, rationale: 'Lead researcher role at NREL, overseeing a team of 4 on DOE-funded climate adaptation project. Recommendation letter from lab director confirms essential role.', evidence: ['Rec_Letter_Dr_Novak.pdf'], gaps: ['Additional letter from program manager would strengthen'] },
  { code: 'high_salary', name: 'High salary or remuneration', met: true, confidence: 85, rationale: 'Current salary $142,000 at NREL. H-1B LCA data shows this is in the 88th percentile for Atmospheric Scientists (SOC 19-2021) in the Denver-Aurora MSA.', evidence: ['H1B_Salary_LCA.pdf'], gaps: [] },
];

const ALT_PATHS = [
  { type: 'EB-1A', score: 84, label: 'Strong', color: 'text-emerald-600 bg-emerald-50' },
  { type: 'O-1A', score: 77, label: 'Viable backup', color: 'text-blue-600 bg-blue-50' },
  { type: 'EB-2 NIW', score: 91, label: 'Primary recommendation', color: 'text-emerald-600 bg-emerald-50' },
  { type: 'EB-2 + PERM', score: null, label: 'Longer timeline', color: 'text-zinc-500 bg-zinc-100' },
];

export default function AssessmentPage(): ReactElement {
  const metCount = CRITERIA.filter((c) => c.met).length;

  return (
    <>
      <Topbar firstName="Danish" previewMode />
      <main className="flex-1 overflow-y-auto">
        <CaseHeader caseId="1" />

        <div className="grid grid-cols-12 gap-6 p-6">
          {/* Left: score + alt paths */}
          <div className="col-span-4 space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center">
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Overall fit score</p>
              <p className="mt-2 text-6xl font-black text-emerald-600">84</p>
              <p className="mt-1 text-[14px] font-semibold text-zinc-700">Strong</p>
              <p className="mt-2 text-[11px] text-zinc-400">model v3.2 · updated 11 min ago</p>
              <div className="mt-4 flex justify-center gap-2">
                <button className="flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-[12px] text-zinc-600 hover:bg-zinc-50">
                  <RotateCcw className="h-3 w-3" /> Re-run
                </button>
                <button className="flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-[12px] text-zinc-600 hover:bg-zinc-50">
                  <Share2 className="h-3 w-3" /> Share
                </button>
              </div>
            </div>

            {/* Draft ribbon */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-[12px] text-amber-800">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-600" />
                <span className="font-semibold">DRAFT — Attorney review required</span>
              </div>
              <p className="mt-1.5 text-amber-700">This assessment must be reviewed and approved by an attorney before sharing with the client or including in any filing.</p>
              <button className="mt-3 rounded-md bg-amber-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-amber-500">
                Approve assessment
              </button>
            </div>

            {/* Alternate paths */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <h3 className="text-[13px] font-semibold text-zinc-900">Alternate paths considered</h3>
              <ul className="mt-3 space-y-2">
                {ALT_PATHS.map((p) => (
                  <li key={p.type} className="flex items-center justify-between">
                    <span className="text-[13px] text-zinc-700">{p.type}</span>
                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${p.color}`}>
                      {p.score ? `${p.score}` : '—'} · {p.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Summary */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <h3 className="text-[13px] font-semibold text-zinc-900">Quick summary</h3>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-emerald-50 p-3">
                  <p className="text-lg font-bold text-emerald-700">{metCount}</p>
                  <p className="text-[10px] text-emerald-600">Met</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-3">
                  <p className="text-lg font-bold text-amber-700">1</p>
                  <p className="text-[10px] text-amber-600">Partial</p>
                </div>
                <div className="rounded-lg bg-zinc-100 p-3">
                  <p className="text-lg font-bold text-zinc-500">0</p>
                  <p className="text-[10px] text-zinc-500">Missing</p>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-zinc-500">
                Minimum 3 criteria required. This candidate meets {metCount} with strong evidence.
              </p>
            </div>
          </div>

          {/* Right: criteria list */}
          <div className="col-span-8 space-y-3">
            {CRITERIA.map((c, i) => (
              <div key={c.code} className="rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${c.met ? 'bg-emerald-100' : c.confidence > 50 ? 'bg-amber-100' : 'bg-red-100'}`}>
                      {c.met ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      ) : c.confidence > 50 ? (
                        <Minus className="h-3.5 w-3.5 text-amber-600" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-zinc-900">
                        <span className="text-zinc-400">#{i + 1}</span> {c.name}
                      </p>
                      <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-600">{c.rationale}</p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-bold ${c.met ? 'bg-emerald-50 text-emerald-700' : c.confidence > 50 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'}`}>
                    {c.confidence}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className={`h-full rounded-full transition-all ${c.met ? 'bg-emerald-500' : c.confidence > 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                    style={{ width: `${c.confidence}%` }}
                  />
                </div>

                {/* Evidence + gaps */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.evidence.map((e) => (
                    <span key={e} className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                      <FileText className="h-2.5 w-2.5" /> {e}
                    </span>
                  ))}
                  {c.gaps.map((g) => (
                    <span key={g} className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                      <AlertTriangle className="h-2.5 w-2.5" /> {g}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* AI improvement suggestion */}
            <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-5">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <div>
                  <p className="text-[14px] font-semibold text-blue-900">How to improve this score</p>
                  <ul className="mt-2 space-y-1.5 text-[12px] text-blue-800">
                    <li>1. Obtain a Publons/Web of Science reviewer profile to strengthen the Judging criterion (35% → est. 70%)</li>
                    <li>2. Secure the AGU Fellows confirmation to solidify Memberships (68% → est. 85%)</li>
                    <li>3. Add a letter from the DOE program manager for Critical Capacity (79% → est. 90%)</li>
                  </ul>
                  <p className="mt-3 text-[12px] font-semibold text-blue-900">
                    Projected overall score with all improvements: <span className="text-lg font-black">84 → 92</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
