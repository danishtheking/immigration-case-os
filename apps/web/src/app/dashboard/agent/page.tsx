'use client';

import { useState, type ReactElement } from 'react';
import { Topbar } from '@/components/layout/topbar';
import {
  Send,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertCircle,
  Shield,
} from 'lucide-react';

interface PendingItem {
  id: string;
  title: string;
  type: string;
  confidence: number;
  case: string;
}

interface RecentItem {
  title: string;
  status: 'executed' | 'rejected';
  time: string;
  icon: typeof Send;
}

const PENDING: PendingItem[] = [
  { id: '1', title: 'Draft email -- Sharma recommender ask', type: 'Email Draft', confidence: 0.82, case: 'NIW-2026-0317' },
  { id: '2', title: 'RFE response -- Iyer H-1B specialty occupation', type: 'Brief Draft', confidence: 0.76, case: 'H1B-2026-0412' },
  { id: '3', title: 'SMS nudge -- Hussein declaration due Apr 30', type: 'SMS Draft', confidence: 0.91, case: 'ASY-2026-0089' },
  { id: '4', title: 'Follow-up -- Osei opportunity matches', type: 'Email Draft', confidence: 0.88, case: 'EB1A-2026-0221' },
  { id: '5', title: 'Status update -- Silva I-751 deadline', type: 'Internal', confidence: 0.95, case: 'I751-2026-0156' },
];

const RECENT: RecentItem[] = [
  { title: 'Nudged Priya S. for I-140 recs', status: 'executed', time: '2 min ago', icon: Send },
  { title: 'Updated lead status -- Wei Zhang', status: 'executed', time: '18 min ago', icon: CheckCircle2 },
  { title: 'Escalated Silva I-751 deadline', status: 'executed', time: '1 hr ago', icon: AlertCircle },
  { title: 'Rejected Moreno biometrics email', status: 'rejected', time: '3 hr ago', icon: XCircle },
  { title: 'Matched 6 opportunities for Dr. Osei', status: 'executed', time: '5 hr ago', icon: Sparkles },
];

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }): ReactElement {
  return (
    <div className="card-elevated rounded-[14px] bg-surface-raised p-5">
      <p className="text-caption text-content-tertiary">{label}</p>
      <p className={`text-[28px] font-bold mt-1 ${accent ?? 'text-content'}`}>{value}</p>
    </div>
  );
}

export default function AgentPage(): ReactElement {
  const [pendingItems, setPendingItems] = useState(PENDING);
  const [recentItems, setRecentItems] = useState(RECENT);
  const [toast, setToast] = useState<string | null>(null);

  function handleApprove(id: string): void {
    const item = pendingItems.find((p) => p.id === id);
    if (!item) return;
    setPendingItems((prev) => prev.filter((p) => p.id !== id));
    setRecentItems((prev) => [
      { title: item.title, status: 'executed' as const, time: 'Just now', icon: CheckCircle2 },
      ...prev,
    ]);
    setToast(`Approved: ${item.title}`);
    setTimeout(() => setToast(null), 3000);
  }

  function handleReject(id: string): void {
    const item = pendingItems.find((p) => p.id === id);
    if (!item) return;
    setPendingItems((prev) => prev.filter((p) => p.id !== id));
    setRecentItems((prev) => [
      { title: item.title, status: 'rejected' as const, time: 'Just now', icon: XCircle },
      ...prev,
    ]);
    setToast(`Rejected: ${item.title}`);
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 card-elevated rounded-[10px] bg-surface-raised px-5 py-3.5">
          <p className="text-body font-medium text-content">{toast}</p>
        </div>
      )}

      <Topbar firstName="Danish" previewMode />

      <main className="flex-1 overflow-y-auto bg-surface px-8 py-7">
        {/* Page header */}
        <div>
          <h1 className="text-heading">Agent Console</h1>
          <p className="text-caption text-content-tertiary mt-1">
            Brenda AI -- {pendingItems.length} actions pending your approval
          </p>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-4 gap-5">
          <StatCard label="Pending" value={String(pendingItems.length)} accent="text-amber-600" />
          <StatCard label="Executed today" value="14" accent="text-emerald-600" />
          <StatCard label="Rejected today" value="1" accent="text-red-500" />
          <StatCard label="Blocked" value="0" />
        </div>

        {/* Two-column layout */}
        <div className="mt-6 grid grid-cols-12 gap-5">
          {/* Pending approvals */}
          <div className="col-span-7 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[16px] font-semibold text-content">Pending Approvals</h2>
              <span className="badge-warning rounded-[8px] px-2.5 py-1 text-[13px] font-semibold">
                Blocks outbound
              </span>
            </div>

            {pendingItems.map((item) => (
              <div
                key={item.id}
                className="card-elevated rounded-[14px] bg-surface-raised p-6 transition-all hover:shadow-md"
              >
                <p className="text-[15px] font-semibold text-content">{item.title}</p>
                <div className="mt-2 flex items-center gap-3 text-caption text-content-muted">
                  <span className="rounded-[8px] bg-brand-lighter text-brand px-2 py-0.5 font-semibold">
                    {item.type}
                  </span>
                  <span>Confidence {(item.confidence * 100).toFixed(0)}%</span>
                  <span>Case {item.case}</span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="rounded-[10px] bg-emerald-600 px-4 py-2 text-[14px] font-semibold text-white hover:bg-emerald-500 transition-colors"
                  >
                    Approve & send
                  </button>
                  <button className="rounded-[10px] border border-surface-border px-4 py-2 text-[14px] font-medium text-content-secondary hover:bg-surface-sunken transition-colors">
                    Edit
                  </button>
                  <button
                    onClick={() => handleReject(item.id)}
                    className="rounded-[10px] border border-surface-border px-4 py-2 text-[14px] font-medium text-content-secondary hover:bg-surface-sunken transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="col-span-5 space-y-5">
            {/* Guardrails card */}
            <div className="card-elevated rounded-[14px] bg-surface-raised p-6">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-brand" />
                <h3 className="text-[15px] font-semibold text-content">Guardrails</h3>
              </div>
              <ul className="space-y-2 text-body text-content-secondary">
                <li>External emails require human approval</li>
                <li>UPL filter passed on all drafts</li>
                <li>PII redacted from all logs</li>
              </ul>
            </div>

            {/* Recent actions */}
            <div className="card-elevated rounded-[14px] bg-surface-raised p-6">
              <h3 className="text-[15px] font-semibold text-content mb-4">Recent Actions</h3>
              <ul className="space-y-4">
                {recentItems.map((item, i) => {
                  const Icon = item.icon;
                  const isGood = item.status === 'executed';
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                          isGood ? 'bg-emerald-100' : 'bg-red-100'
                        }`}
                      >
                        <Icon className={`h-3.5 w-3.5 ${isGood ? 'text-emerald-600' : 'text-red-500'}`} />
                      </div>
                      <div>
                        <p className="text-body text-content-secondary">{item.title}</p>
                        <p className="text-caption text-content-muted">{item.time}</p>
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
