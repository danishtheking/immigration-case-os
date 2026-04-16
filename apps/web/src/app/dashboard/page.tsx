import { redirect } from 'next/navigation';
import type { ReactElement } from 'react';
import { isClerkConfigured } from '@/lib/clerk-config';
import { Topbar } from '@/components/layout/topbar';
import Link from 'next/link';
import {
  TrendingUp, AlertTriangle, Clock, ArrowUpRight, ArrowRight,
  Circle, Send, FileWarning, Sparkles, AlertCircle, Zap,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage(): Promise<ReactElement> {
  const isPreview = !isClerkConfigured();
  if (!isPreview) {
    const { auth, currentUser } = await import('@clerk/nextjs/server');
    const { userId } = await auth();
    if (!userId) redirect('/sign-in');
    const user = await currentUser();
    return <Dashboard firstName={user?.firstName ?? 'Attorney'} />;
  }
  return <Dashboard firstName="Danish" />;
}

function Dashboard({ firstName }: { firstName: string }): ReactElement {
  return (
    <>
      <Topbar firstName={firstName} previewMode />
      <main className="flex-1 overflow-y-auto px-8 py-7">

        {/* ── KPI Row ─────────────────────────────────────────────── */}
        {/* Research: 5-second rule — most critical info at top, large numbers */}
        <div className="grid grid-cols-4 gap-5">
          <KpiCard
            label="Active cases"
            value="412"
            trend={{ value: '+18', label: 'this week', direction: 'up' }}
          />
          <KpiCard
            label="Upcoming deadlines"
            value="27"
            trend={{ value: '3 critical', label: '', direction: 'warn' }}
          />
          <KpiCard
            label="Revenue (MTD)"
            value="$184,220"
            trend={{ value: '+12%', label: 'vs last month', direction: 'up' }}
          />
          <KpiCard
            label="Agent actions"
            value="63"
            trend={{ value: '9 pending', label: 'approval', direction: 'neutral' }}
          />
        </div>

        {/* ── Main content row ────────────────────────────────────── */}
        {/* Research: Gestalt proximity — group pipeline+cases (related), separate agent feed */}
        <div className="mt-7 grid grid-cols-12 gap-5">

          {/* Pipeline — 8 cols */}
          <section className="col-span-8 card-elevated p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-subheading text-content">Case pipeline</h2>
              <div className="flex gap-1.5">
                {['All types', 'Employment', 'Family'].map((tab, i) => (
                  <button key={tab} className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                    i === 0 ? 'bg-content text-content-inverse' : 'text-content-tertiary hover:bg-surface-sunken hover:text-content-secondary'
                  }`}>{tab}</button>
                ))}
              </div>
            </div>
            {/* Research: Bar charts use preattentive length comparison (NN/g) */}
            <div className="mt-6 space-y-4">
              <PipelineBar label="Lead" count={72} total={412} color="bg-content-muted/40" />
              <PipelineBar label="Engaged" count={58} total={412} color="bg-sky-400" />
              <PipelineBar label="Intake & docs" count={94} total={412} color="bg-brand-light/70" />
              <PipelineBar label="Preparation" count={81} total={412} color="bg-brand" />
              <PipelineBar label="Attorney review" count={34} total={412} color="bg-brand-dark" />
              <PipelineBar label="Filed" count={73} total={412} color="bg-success" />
            </div>
          </section>

          {/* Agent feed — 4 cols */}
          {/* Research: <5 real-time updates = manageable cognitive load */}
          <section className="col-span-4 card-elevated p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-subheading text-content">Agent activity</h2>
              <span className="flex items-center gap-1.5 rounded-full bg-success-light px-2.5 py-1 text-[12px] font-semibold text-success">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                Live
              </span>
            </div>
            <div className="mt-5 space-y-5">
              <AgentItem icon={<Send className="h-4 w-4" />} bg="bg-success-light text-success" title="Nudged Priya S. for recommendation letters" time="2 min ago · auto-sent" />
              <AgentItem icon={<FileWarning className="h-4 w-4" />} bg="bg-warning-light text-warning" title="Drafted RFE response for Ramesh I. (H-1B)" time="12 min · needs attorney review" />
              <AgentItem icon={<Sparkles className="h-4 w-4" />} bg="bg-info-light text-info" title="Matched 6 opportunities for Dr. Osei" time="34 min" />
              <AgentItem icon={<AlertCircle className="h-4 w-4" />} bg="bg-danger-light text-danger" title="Escalated: Silva I-751 deadline in 10 days" time="1 hr · assigned to Jess" />
            </div>
            <Link href="/dashboard/agent" className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-surface-border py-2.5 text-[13px] font-medium text-content-secondary transition-colors hover:bg-surface-sunken hover:text-content">
              View all actions <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>
        </div>

        {/* ── Recent cases table ──────────────────────────────────── */}
        {/* Research: Progressive disclosure — summary table, click to drill down */}
        <section className="mt-7 card-elevated">
          <div className="flex items-center justify-between px-6 py-5">
            <h2 className="text-subheading text-content">Recent cases</h2>
            <Link href="/dashboard/cases" className="flex items-center gap-1 text-[13px] font-medium text-brand transition-colors hover:text-brand-dark">
              View all cases <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y border-surface-border text-[12px] font-semibold uppercase tracking-wider text-content-tertiary">
                  <th className="px-6 py-3 text-left">Client</th>
                  <th className="px-6 py-3 text-left">Case type</th>
                  <th className="px-6 py-3 text-left">Stage</th>
                  <th className="px-6 py-3 text-left">Next deadline</th>
                  <th className="px-6 py-3 text-left">Attorney</th>
                  <th className="px-6 py-3 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="text-[14px]">
                <CaseRow name="Priya Sharma" detail="IND · Engineer" caseType="EB-2 NIW" caseColor="bg-info-light text-info" stage="Preparation" stageColor="text-info" deadline="Apr 24" deadlineNote="RFE 11d" deadlineUrgent attorney="Danish" score={84} scoreColor="text-success" />
                <CaseRow name="Ramesh Iyer" detail="IND · Data Scientist" caseType="H-1B Ext" caseColor="bg-[#f3f0ff] text-[#7c3aed]" stage="Attorney review" stageColor="text-brand-dark" deadline="May 06" deadlineNote="Filing" attorney="Danish" />
                <CaseRow name="Dr. Ama Osei" detail="GHA · Researcher" caseType="EB-1A" caseColor="bg-[#ecfeff] text-[#0891b2]" stage="Profile building" stageColor="text-[#0891b2]" deadline="Jun 12" deadlineNote="Draft I-140" attorney="Jess" score={61} scoreColor="text-warning" />
                <CaseRow name="Lucia Moreno" detail="MEX · Spouse of USC" caseType="I-130 + I-485" caseColor="bg-[#fff1f2] text-[#e11d48]" stage="Filed" stageColor="text-success" deadline="Jul 03" deadlineNote="Biometrics" attorney="Rahul" />
                <CaseRow name="Ayaan Hussein" detail="SOM · Asylum seeker" caseType="I-589" caseColor="bg-warning-light text-warning" stage="Intake" stageColor="text-content-tertiary" deadline="Apr 30" deadlineNote="Declaration" attorney="Danish" />
                <CaseRow name="Ana & Pedro Silva" detail="BRA" caseType="I-751 Joint" caseColor="bg-[#fdf2f8] text-[#db2777]" stage="Attorney review" stageColor="text-brand-dark" deadline="Apr 26" deadlineNote="90-day window" deadlineUrgent attorney="Danish" />
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-7 text-center text-micro">
          Preview mode · All data is simulated · Real data populates in Sprint 2+
        </p>
      </main>
    </>
  );
}

/* ── Subcomponents ─────────────────────────────────────────── */

interface KpiCardProps {
  label: string;
  value: string;
  trend: { value: string; label: string; direction: 'up' | 'down' | 'warn' | 'neutral' };
}

function KpiCard({ label, value, trend }: KpiCardProps): ReactElement {
  /* Research: KPI numbers should be 36-40px — largest element on the page */
  const trendStyles = {
    up:      'text-success bg-success-light',
    down:    'text-danger bg-danger-light',
    warn:    'text-warning bg-warning-light',
    neutral: 'text-content-tertiary bg-surface-sunken',
  }[trend.direction];

  const TrendIcon = trend.direction === 'up' ? TrendingUp
    : trend.direction === 'warn' ? AlertTriangle : null;

  return (
    <div className="card-elevated p-5">
      <p className="text-caption">{label}</p>
      {/* Research: 5-second rule — biggest visual element = most important data */}
      <p className="mt-2 text-[36px] font-extrabold leading-none tracking-tight text-content">{value}</p>
      <div className="mt-3 flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[12px] font-semibold ${trendStyles}`}>
          {TrendIcon && <TrendIcon className="h-3 w-3" />}
          {trend.value}
        </span>
        {trend.label && <span className="text-micro">{trend.label}</span>}
      </div>
    </div>
  );
}

function PipelineBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }): ReactElement {
  const pct = Math.round((count / total) * 100);
  /* Research: Fitts' Law — bigger click targets. Bar labels are 14px not 13px */
  return (
    <div className="flex items-center gap-4">
      <span className="w-36 text-[14px] text-content-secondary">{label}</span>
      <div className="flex-1">
        <div className="h-2.5 overflow-hidden rounded-full bg-surface-sunken">
          <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="w-10 text-right text-[14px] font-semibold text-content">{count}</span>
    </div>
  );
}

function AgentItem({ icon, bg, title, time }: { icon: ReactElement; bg: string; title: string; time: string }): ReactElement {
  return (
    <div className="flex gap-3.5">
      {/* Research: Gestalt similarity — consistent icon shapes signal related items */}
      <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${bg}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[14px] leading-snug text-content">{title}</p>
        <p className="mt-0.5 text-caption">{time}</p>
      </div>
    </div>
  );
}

function CaseRow({ name, detail, caseType, caseColor, stage, stageColor, deadline, deadlineNote, deadlineUrgent, attorney, score, scoreColor }: {
  name: string; detail: string; caseType: string; caseColor: string; stage: string; stageColor: string;
  deadline: string; deadlineNote: string; deadlineUrgent?: boolean; attorney: string; score?: number; scoreColor?: string;
}): ReactElement {
  /* Research: WCAG AA 4.5:1 — text is 14px with proper contrast colors */
  return (
    <tr className="border-b border-surface-border/50 transition-colors hover:bg-surface-sunken/50">
      <td className="px-6 py-4">
        <Link href="/dashboard/cases/1" className="block">
          <div className="text-[14px] font-semibold text-content hover:text-brand">{name}</div>
          <div className="text-caption">{detail}</div>
        </Link>
      </td>
      <td className="px-6 py-4">
        {/* Research: Color = status only (Traffic Light logic) */}
        <span className={`badge ${caseColor}`}>{caseType}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Circle className={`h-2 w-2 fill-current ${stageColor}`} />
          <span className="text-content-secondary">{stage}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        {/* Research: Red = critical ONLY */}
        <span className={`text-[14px] font-medium ${deadlineUrgent ? 'text-danger' : 'text-content'}`}>{deadline}</span>
        <span className="ml-2 text-caption">{deadlineNote}</span>
      </td>
      <td className="px-6 py-4 text-content-secondary">{attorney}</td>
      <td className="px-6 py-4 text-right">
        {score ? <span className={`text-[16px] font-bold ${scoreColor}`}>{score}</span> : <span className="text-content-muted">--</span>}
      </td>
    </tr>
  );
}
