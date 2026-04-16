'use client';

import { useState, type ReactElement } from 'react';
import { Topbar } from '@/components/layout/topbar';
import {
  Send,
  FileWarning,
  MessageSquare,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Sparkles,
  AlertCircle,
  Settings,
  BarChart3,
} from 'lucide-react';

const PENDING = [
  { id: '1', title: 'Draft email · Sharma recommender ask', type: 'Email · Draft', typeColor: 'bg-blue-50 text-blue-700', confidence: 0.82, model: 'Claude Sonnet 4.6', case: 'NIW-2026-0317', trigger: 'case.preparation.missing_recommender' },
  { id: '2', title: 'RFE response draft · Iyer H-1B specialty occupation', type: 'Brief · Draft', typeColor: 'bg-indigo-50 text-indigo-700', confidence: 0.76, model: 'Claude Opus 4.6', case: 'H1B-2026-0412', trigger: 'case.rfe_noid.response_needed' },
  { id: '3', title: 'SMS nudge · Hussein declaration due Apr 30', type: 'SMS · Draft', typeColor: 'bg-violet-50 text-violet-700', confidence: 0.91, model: 'Claude Sonnet 4.6', case: 'ASY-2026-0089', trigger: 'case.intake.stale_7d' },
  { id: '4', title: 'Follow-up email · Osei opportunity matches', type: 'Email · Draft', typeColor: 'bg-blue-50 text-blue-700', confidence: 0.88, model: 'Claude Sonnet 4.6', case: 'EB1A-2026-0221', trigger: 'opportunities.new_matches' },
  { id: '5', title: 'Status update · Silva I-751 deadline approaching', type: 'Internal · Auto', typeColor: 'bg-emerald-50 text-emerald-700', confidence: 0.95, model: 'Claude Haiku 4.5', case: 'I751-2026-0156', trigger: 'deadline.approaching.7d' },
];

const RECENT = [
  { title: 'Nudged Priya S. for I-140 recs', status: 'executed', time: '2 min ago', icon: Send },
  { title: 'Updated lead status · Wei Zhang → Contacted', status: 'executed', time: '18 min ago', icon: CheckCircle2 },
  { title: 'Escalated: Silva I-751 deadline < 10d', status: 'executed', time: '1 hr ago', icon: AlertCircle },
  { title: 'Draft email rejected · Moreno biometrics reminder', status: 'rejected', time: '3 hr ago', icon: XCircle },
  { title: 'Matched 6 opportunities for Dr. Osei', status: 'executed', time: '5 hr ago', icon: Sparkles },
];

export default function AgentPage(): ReactElement {
  const [pendingItems, setPendingItems] = useState(PENDING);
  const [recentItems, setRecentItems] = useState(RECENT);
  const [toast, setToast] = useState<string | null>(null);

  function handleApprove(id: string): void {
    const item = pendingItems.find((p) => p.id === id);
    if (!item) return;
    setPendingItems((prev) => prev.filter((p) => p.id !== id));
    setRecentItems((prev) => [{ title: item.title, status: 'executed' as const, time: 'Just now', icon: CheckCircle2 }, ...prev]);
    setToast(`Approved & sent: ${item.title}`);
    setTimeout(() => setToast(null), 3000);
  }

  function handleReject(id: string): void {
    const item = pendingItems.find((p) => p.id === id);
    if (!item) return;
    setPendingItems((prev) => prev.filter((p) => p.id !== id));
    setRecentItems((prev) => [{ title: item.title, status: 'rejected' as const, time: 'Just now', icon: XCircle }, ...prev]);
    setToast(`Rejected: ${item.title}`);
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <>
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in rounded-lg border border-surface-border bg-surface-raised px-4 py-3 shadow-lg">
          <p className="text-[13px] font-medium text-content">{toast}</p>
        </div>
      )}
      <Topbar firstName="Danish" previewMode />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-content">Agent Console</h1>
            <p className="text-[12px] text-content-tertiary">Brenda AI · {pendingItems.length} actions pending approval · all outbound drafts require human review</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-2 text-[12px] text-content-secondary hover:bg-surface">
              <Settings className="h-3.5 w-3.5" /> Agent policy
            </button>
            <button className="flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-2 text-[12px] text-content-secondary hover:bg-surface">
              <BarChart3 className="h-3.5 w-3.5" /> Eval harness
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-4 grid grid-cols-4 gap-3">
          <MiniStat label="Pending approval" value={String(pendingItems.length)} color="text-amber-600" />
          <MiniStat label="Executed today" value="14" color="text-emerald-600" />
          <MiniStat label="Rejected today" value="1" color="text-red-600" />
          <MiniStat label="UPL blocks" value="0" color="text-content-tertiary" />
        </div>

        <div className="mt-5 grid grid-cols-12 gap-4">
          {/* Pending approvals */}
          <div className="col-span-7 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-content">Pending approvals</h2>
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[12px] font-semibold text-amber-700">Blocks outbound</span>
            </div>
            {pendingItems.map((item) => (
              <div key={item.id} className="rounded-xl border border-surface-border bg-surface-raised p-4 transition-all hover:border-surface-border-hover hover:shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-content">{item.title}</p>
                    <div className="mt-1 flex items-center gap-2 text-[12px] text-content-muted">
                      <span className={`rounded-md px-1.5 py-0.5 font-semibold ${item.typeColor}`}>{item.type}</span>
                      <span>Confidence {(item.confidence * 100).toFixed(0)}%</span>
                      <span>·</span>
                      <span>{item.model}</span>
                    </div>
                    <p className="mt-1 text-[12px] text-content-muted">Case: {item.case} · Trigger: {item.trigger}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => handleApprove(item.id)} className="rounded-md bg-emerald-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-emerald-500">Approve & send</button>
                  <button className="rounded-md border border-surface-border px-3 py-1.5 text-[12px] font-medium text-content-secondary hover:bg-surface">Edit</button>
                  <button onClick={() => handleReject(item.id)} className="rounded-md border border-surface-border px-3 py-1.5 text-[12px] font-medium text-content-secondary hover:bg-surface">Reject</button>
                  <button className="ml-auto text-[12px] text-content-muted hover:text-content-secondary">View trace</button>
                </div>
              </div>
            ))}
          </div>

          {/* Right: action trace + recent */}
          <div className="col-span-5 space-y-4">
            {/* Action trace preview */}
            <div className="rounded-xl border border-surface-border bg-surface-raised p-5">
              <h3 className="text-[13px] font-semibold text-content">Action trace</h3>
              <p className="mt-1 text-[12px] text-content-muted">Draft email · Sharma recommender ask</p>
              <pre className="mt-3 overflow-auto rounded-lg bg-zinc-950 p-3 text-[12px] leading-relaxed text-content-muted">
{`{
  "trigger": "case.preparation.missing_recommender",
  "case_id": "NIW-2026-0317",
  "tools_used": [
    "get_case",
    "get_recommender_suggestions",
    "draft_email"
  ],
  "output_kind": "email_draft",
  "confidence": 0.82,
  "model": "claude-sonnet-4.6",
  "requires_approval": true,
  "policy_gate": "outbound.email.external",
  "upl_filter": "passed"
}`}
              </pre>
              <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-[12px] text-blue-800">
                <Shield className="mr-1 inline h-3 w-3" />
                Guardrails: external recipient → requires human approval. UPL filter passed. PII redacted in log.
              </div>
            </div>

            {/* Recent actions */}
            <div className="rounded-xl border border-surface-border bg-surface-raised p-5">
              <h3 className="text-[13px] font-semibold text-content">Recent actions</h3>
              <ul className="mt-3 space-y-3">
                {recentItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                        item.status === 'executed' ? 'bg-emerald-100' : 'bg-red-100'
                      }`}>
                        <Icon className={`h-3 w-3 ${item.status === 'executed' ? 'text-emerald-600' : 'text-red-500'}`} />
                      </div>
                      <div>
                        <p className="text-[12px] text-content-secondary">{item.title}</p>
                        <p className="text-[12px] text-content-muted">{item.time}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }): ReactElement {
  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised px-4 py-3">
      <p className="text-[12px] text-content-tertiary">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
