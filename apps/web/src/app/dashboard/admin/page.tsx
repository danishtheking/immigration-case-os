import type { ReactElement } from 'react';
import { Topbar } from '@/components/layout/topbar';
import {
  Settings,
  Palette,
  Users,
  Shield,
  Bot,
  Database,
  Link2,
  CreditCard,
  ScrollText,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const CASE_TYPES = [
  'EB-1A', 'EB-1B', 'EB-1C', 'EB-2 NIW', 'EB-2 PERM', 'EB-3', 'EB-5',
  'H-1B', 'L-1A', 'L-1B', 'O-1A', 'TN', 'E-2', 'E-3',
  'I-130', 'I-485', 'K-1', 'I-751', 'N-400',
  'I-589 Asylum', 'U-Visa', 'DACA', 'TPS',
  'Removal defense', 'BIA appeal',
];

const NAV = [
  { label: 'General', icon: Settings, active: true },
  { label: 'Branding & domain', icon: Palette },
  { label: 'Users & SSO', icon: Users },
  { label: 'Case types enabled', icon: ScrollText },
  { label: 'Agent policy', icon: Bot },
  { label: 'Data retention', icon: Database },
  { label: 'Integrations', icon: Link2 },
  { label: 'Billing plan', icon: CreditCard },
  { label: 'Audit log', icon: ScrollText },
];

export default function AdminPage(): ReactElement {
  return (
    <>
      <Topbar firstName="Danish" previewMode />
      <main className="flex-1 overflow-y-auto">
        <div className="border-b border-zinc-200 bg-white px-6 py-4">
          <h1 className="text-lg font-semibold text-zinc-900">Tenant Admin</h1>
          <p className="text-[12px] text-zinc-500">StitchBoat Immigration · Branding, SSO, case types, agent policy, data retention</p>
        </div>

        <div className="flex">
          {/* Settings nav */}
          <div className="w-56 shrink-0 border-r border-zinc-200 bg-white p-3">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] transition-colors ${
                    item.active ? 'bg-zinc-100 font-medium text-zinc-900' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Branding */}
              <div className="rounded-xl border border-zinc-200 bg-white p-5">
                <h3 className="text-[13px] font-semibold text-zinc-900">Branding</h3>
                <div className="mt-3 space-y-2 text-[13px]">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Custom domain</span>
                    <span className="flex items-center gap-1.5 font-medium text-zinc-900">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      apply.stitchboat.io
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">DKIM / SPF</span>
                    <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> Verified</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Primary color</span>
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-4 w-4 rounded bg-blue-600" />
                      <span className="font-mono text-zinc-700">#1d4ed8</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Agent persona</span>
                    <span className="font-medium text-zinc-700">Neha</span>
                  </div>
                </div>
              </div>

              {/* Case types */}
              <div className="rounded-xl border border-zinc-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-semibold text-zinc-900">Case types enabled</h3>
                  <span className="text-[11px] text-zinc-400">{CASE_TYPES.length} active</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {CASE_TYPES.map((ct) => (
                    <span key={ct} className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-medium text-zinc-700">{ct}</span>
                  ))}
                </div>
              </div>

              {/* Agent policy */}
              <div className="rounded-xl border border-zinc-200 bg-white p-5">
                <h3 className="text-[13px] font-semibold text-zinc-900">Agent policy</h3>
                <ul className="mt-3 space-y-2 text-[13px]">
                  <PolicyRow allowed label="Internal drafts allowed" />
                  <PolicyRow allowed label="Client portal nudges allowed" />
                  <PolicyRow blocked label="Outbound email — human approval required" />
                  <PolicyRow blocked label="Outbound SMS — human approval required" />
                  <PolicyRow allowed label="Status updates on CRM allowed" />
                  <PolicyRow allowed label="Escalate to attorney on deadline < 7d" />
                </ul>
              </div>

              {/* Data & retention */}
              <div className="rounded-xl border border-zinc-200 bg-white p-5">
                <h3 className="text-[13px] font-semibold text-zinc-900">Data & retention</h3>
                <div className="mt-3 space-y-2 text-[13px]">
                  <DataRow label="Region" value="US-East only" />
                  <DataRow label="Per-tenant encryption" value="KMS key tnt_stitchboat_v3" mono />
                  <DataRow label="Document retention" value="7 years post-closure" />
                  <DataRow label="Audit log retention" value="10 years" />
                  <DataRow label="Right-to-erasure endpoint" value="Enabled" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function PolicyRow({ allowed, label }: { allowed?: boolean; blocked?: boolean; label: string }): ReactElement {
  return (
    <li className="flex items-center gap-2">
      {allowed ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-400" />}
      <span className="text-zinc-700">{label}</span>
    </li>
  );
}

function DataRow({ label, value, mono }: { label: string; value: string; mono?: boolean }): ReactElement {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className={`font-medium ${mono ? 'font-mono text-[12px] text-zinc-600' : 'text-zinc-700'}`}>{value}</span>
    </div>
  );
}
