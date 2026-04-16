import { redirect } from 'next/navigation';
import type { ReactElement } from 'react';
import { isClerkConfigured } from '@/lib/clerk-config';
import { Topbar } from '@/components/layout/topbar';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Circle,
  FileWarning,
  Zap,
  Send,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage(): Promise<ReactElement> {
  const isPreview = !isClerkConfigured();

  if (!isPreview) {
    const { auth, currentUser } = await import('@clerk/nextjs/server');
    const { userId } = await auth();
    if (!userId) redirect('/sign-in');
    const user = await currentUser();
    return <DashboardContent firstName={user?.firstName ?? 'Attorney'} previewMode={false} />;
  }

  return <DashboardContent firstName="Danish" previewMode />;
}

interface DashboardContentProps {
  firstName: string;
  previewMode: boolean;
}

function DashboardContent({ firstName, previewMode }: DashboardContentProps): ReactElement {
  return (
    <>
      <Topbar firstName={firstName} previewMode={previewMode} />
      <main className="flex-1 overflow-y-auto p-6">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <KpiCard
            label="Active cases"
            value="412"
            change="+18"
            changeLabel="this week"
            trend="up"
            icon={<FolderIcon />}
          />
          <KpiCard
            label="Upcoming deadlines"
            value="27"
            change="3 critical"
            changeLabel=""
            trend="warn"
            icon={<Clock className="h-4 w-4" />}
          />
          <KpiCard
            label="Revenue (MTD)"
            value="$184,220"
            change="+12%"
            changeLabel="vs last month"
            trend="up"
            icon={<DollarIcon />}
          />
          <KpiCard
            label="Agent actions"
            value="63"
            change="9 pending"
            changeLabel="approval"
            trend="neutral"
            icon={<Zap className="h-4 w-4" />}
          />
        </div>

        <div className="mt-6 grid grid-cols-12 gap-4">
          {/* Pipeline */}
          <div className="col-span-8 rounded-xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900">Case pipeline</h2>
              <div className="flex gap-1 text-[11px]">
                <button className="rounded-md bg-zinc-900 px-2.5 py-1 font-medium text-white">All types</button>
                <button className="rounded-md px-2.5 py-1 text-zinc-500 hover:bg-zinc-100">Employment</button>
                <button className="rounded-md px-2.5 py-1 text-zinc-500 hover:bg-zinc-100">Family</button>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <PipelineBar label="Lead" count={72} total={412} color="bg-zinc-300" />
              <PipelineBar label="Engaged" count={58} total={412} color="bg-sky-300" />
              <PipelineBar label="Intake & docs" count={94} total={412} color="bg-blue-400" />
              <PipelineBar label="Preparation" count={81} total={412} color="bg-blue-500" />
              <PipelineBar label="Attorney review" count={34} total={412} color="bg-indigo-500" />
              <PipelineBar label="Filed" count={73} total={412} color="bg-emerald-500" />
            </div>
          </div>

          {/* Agent feed */}
          <div className="col-span-4 rounded-xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900">Agent activity</h2>
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Live
              </span>
            </div>
            <div className="mt-4 space-y-4">
              <AgentItem icon={<Send className="h-3.5 w-3.5" />} iconBg="bg-emerald-100 text-emerald-700" title="Nudged Priya S. for recommendation letters" meta="2 min ago · auto-sent" />
              <AgentItem icon={<FileWarning className="h-3.5 w-3.5" />} iconBg="bg-amber-100 text-amber-700" title="Drafted RFE response for Ramesh I. (H-1B)" meta="12 min · needs attorney review" />
              <AgentItem icon={<Sparkles className="h-3.5 w-3.5" />} iconBg="bg-blue-100 text-blue-700" title="Matched 6 opportunities for Dr. Osei" meta="34 min" />
              <AgentItem icon={<AlertCircle className="h-3.5 w-3.5" />} iconBg="bg-red-100 text-red-700" title="Escalated: Silva I-751 deadline in 10 days" meta="1 hr · assigned to Jess" />
            </div>
            <button className="mt-4 w-full rounded-lg border border-zinc-200 py-2 text-[12px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50">
              View all agent actions
            </button>
          </div>
        </div>

        {/* Recent cases table */}
        <div className="mt-6 rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-zinc-900">Recent cases</h2>
            <button className="flex items-center gap-1 text-[12px] font-medium text-blue-600 hover:text-blue-700">View all <ArrowUpRight className="h-3 w-3" /></button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <th className="px-5 py-2.5 text-left">Client</th>
                <th className="px-5 py-2.5 text-left">Case type</th>
                <th className="px-5 py-2.5 text-left">Stage</th>
                <th className="px-5 py-2.5 text-left">Next deadline</th>
                <th className="px-5 py-2.5 text-left">Attorney</th>
                <th className="px-5 py-2.5 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              <CaseRow name="Priya Sharma" detail="IND · Engineer" caseType="EB-2 NIW" caseColor="bg-blue-50 text-blue-700" stage="Preparation" stageColor="text-blue-600" deadline="Apr 24" deadlineNote="RFE 11d" deadlineUrgent attorney="Danish" score={84} scoreColor="text-emerald-600" />
              <CaseRow name="Ramesh Iyer" detail="IND · Data Scientist" caseType="H-1B Ext" caseColor="bg-violet-50 text-violet-700" stage="Attorney review" stageColor="text-indigo-600" deadline="May 06" deadlineNote="Filing" attorney="Danish" />
              <CaseRow name="Dr. Ama Osei" detail="GHA · Researcher" caseType="EB-1A" caseColor="bg-cyan-50 text-cyan-700" stage="Profile building" stageColor="text-cyan-600" deadline="Jun 12" deadlineNote="Draft I-140" attorney="Jess" score={61} scoreColor="text-amber-600" />
              <CaseRow name="Lucia Moreno" detail="MEX · Spouse of USC" caseType="I-130 + I-485" caseColor="bg-rose-50 text-rose-700" stage="Filed" stageColor="text-emerald-600" deadline="Jul 03" deadlineNote="Biometrics" attorney="Rahul" />
              <CaseRow name="Ayaan Hussein" detail="SOM · Asylum seeker" caseType="I-589" caseColor="bg-orange-50 text-orange-700" stage="Intake" stageColor="text-zinc-600" deadline="Apr 30" deadlineNote="Declaration" attorney="Danish" />
              <CaseRow name="Ana & Pedro Silva" detail="BRA" caseType="I-751 Joint" caseColor="bg-pink-50 text-pink-700" stage="Attorney review" stageColor="text-indigo-600" deadline="Apr 26" deadlineNote="90-day window" deadlineUrgent attorney="Danish" />
            </tbody>
          </table>
        </div>

        {previewMode && (
          <p className="mt-6 text-center text-[11px] text-zinc-400">
            Preview mode · All data is simulated · Real data populates in Sprint 2+
          </p>
        )}
      </main>
    </>
  );
}

/* ── Subcomponents ─────────────────────────────────────────────────── */

interface KpiCardProps {
  label: string; value: string; change: string; changeLabel: string;
  trend: 'up' | 'down' | 'warn' | 'neutral'; icon: ReactElement;
}

function KpiCard({ label, value, change, changeLabel, trend, icon }: KpiCardProps): ReactElement {
  const cfg = {
    up:      { color: 'text-emerald-600', bg: 'bg-emerald-50', Icon: <TrendingUp className="h-3 w-3" /> },
    down:    { color: 'text-red-600',     bg: 'bg-red-50',     Icon: <TrendingUp className="h-3 w-3 rotate-180" /> },
    warn:    { color: 'text-amber-600',   bg: 'bg-amber-50',   Icon: <AlertTriangle className="h-3 w-3" /> },
    neutral: { color: 'text-zinc-500',    bg: 'bg-zinc-50',    Icon: null },
  }[trend];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-medium text-zinc-500">{label}</p>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-50 text-zinc-400">{icon}</div>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">{value}</p>
      <div className="mt-1.5 flex items-center gap-1.5">
        {cfg.Icon ? (
          <span className={`flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${cfg.bg} ${cfg.color}`}>{cfg.Icon}{change}</span>
        ) : (
          <span className={`text-[11px] font-medium ${cfg.color}`}>{change}</span>
        )}
        {changeLabel && <span className="text-[11px] text-zinc-400">{changeLabel}</span>}
      </div>
    </div>
  );
}

function PipelineBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }): ReactElement {
  const pct = Math.round((count / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 text-[13px] text-zinc-600">{label}</span>
      <div className="flex-1"><div className="h-2 overflow-hidden rounded-full bg-zinc-100"><div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} /></div></div>
      <span className="w-8 text-right text-[13px] font-medium text-zinc-700">{count}</span>
    </div>
  );
}

function AgentItem({ icon, iconBg, title, meta }: { icon: ReactElement; iconBg: string; title: string; meta: string }): ReactElement {
  return (
    <div className="flex gap-3">
      <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${iconBg}`}>{icon}</div>
      <div className="min-w-0"><p className="text-[13px] text-zinc-700">{title}</p><p className="text-[11px] text-zinc-400">{meta}</p></div>
    </div>
  );
}

function CaseRow({ name, detail, caseType, caseColor, stage, stageColor, deadline, deadlineNote, deadlineUrgent, attorney, score, scoreColor }: {
  name: string; detail: string; caseType: string; caseColor: string; stage: string; stageColor: string;
  deadline: string; deadlineNote: string; deadlineUrgent?: boolean; attorney: string; score?: number; scoreColor?: string;
}): ReactElement {
  return (
    <tr className="border-b border-zinc-50 transition-colors hover:bg-zinc-50/50">
      <td className="px-5 py-3"><div className="font-medium text-zinc-900">{name}</div><div className="text-[11px] text-zinc-400">{detail}</div></td>
      <td className="px-5 py-3"><span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${caseColor}`}>{caseType}</span></td>
      <td className="px-5 py-3"><div className="flex items-center gap-1.5"><Circle className={`h-2 w-2 fill-current ${stageColor}`} /><span className="text-zinc-600">{stage}</span></div></td>
      <td className="px-5 py-3"><span className={`font-medium ${deadlineUrgent ? 'text-red-600' : 'text-zinc-700'}`}>{deadline}</span><span className="ml-1.5 text-[11px] text-zinc-400">{deadlineNote}</span></td>
      <td className="px-5 py-3 text-zinc-600">{attorney}</td>
      <td className="px-5 py-3 text-right">{score ? <span className={`text-[14px] font-bold ${scoreColor}`}>{score}</span> : <span className="text-zinc-300">--</span>}</td>
    </tr>
  );
}

function FolderIcon(): ReactElement {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M3 7V17a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>;
}

function DollarIcon(): ReactElement {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>;
}
