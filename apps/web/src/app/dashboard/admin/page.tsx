import type { ReactElement } from 'react';
import { Topbar } from '@/components/layout/topbar';
import {
  Settings,
  Palette,
  Users,
  Bot,
  Database,
  Link2,
  CreditCard,
  ScrollText,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const CASE_TYPES = [
  'EB-1A', 'EB-1B', 'EB-2 NIW', 'EB-2 PERM', 'EB-3',
  'H-1B', 'L-1A', 'O-1A', 'TN', 'E-2',
  'I-130', 'I-485', 'K-1', 'I-751', 'N-400',
  'Asylum', 'TPS', 'DACA', 'Removal defense',
];

interface NavItem {
  label: string;
  icon: typeof Settings;
  active?: boolean;
}

const NAV: NavItem[] = [
  { label: 'General', icon: Settings, active: true },
  { label: 'Branding', icon: Palette },
  { label: 'Users & SSO', icon: Users },
  { label: 'Case types', icon: ScrollText },
  { label: 'Agent policy', icon: Bot },
  { label: 'Data retention', icon: Database },
  { label: 'Integrations', icon: Link2 },
  { label: 'Billing plan', icon: CreditCard },
];

function SettingRow({ label, value, verified }: {
  label: string;
  value: string;
  verified?: boolean;
}): ReactElement {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-body text-content-tertiary">{label}</span>
      <span className="flex items-center gap-2 text-body font-medium text-content-secondary">
        {verified && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
        {value}
      </span>
    </div>
  );
}

function PolicyRow({ allowed, label }: { allowed: boolean; label: string }): ReactElement {
  return (
    <li className="flex items-center gap-3 py-1">
      {allowed
        ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
        : <XCircle className="h-4 w-4 text-red-400 shrink-0" />
      }
      <span className="text-body text-content-secondary">{label}</span>
    </li>
  );
}

export default function AdminPage(): ReactElement {
  return (
    <>
      <Topbar firstName="Danish" previewMode />
      <main className="flex-1 overflow-y-auto bg-surface">
        {/* Page header */}
        <div className="bg-surface-raised border-b border-surface-border px-8 py-7">
          <h1 className="text-heading">Tenant Admin</h1>
          <p className="text-caption text-content-tertiary mt-1">StitchBoat Immigration settings</p>
        </div>

        <div className="flex">
          {/* Sidebar nav */}
          <div className="w-60 shrink-0 border-r border-surface-border bg-surface-raised p-4">
            <div className="space-y-1">
              {NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className={`flex w-full items-center gap-3 rounded-[10px] px-4 py-2.5 text-left text-body transition-colors ${
                      item.active
                        ? 'bg-brand-lighter font-medium text-brand'
                        : 'text-content-tertiary hover:bg-surface-sunken hover:text-content-secondary'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 px-8 py-7">
            <div className="grid grid-cols-2 gap-5">
              {/* Branding card */}
              <div className="card-elevated rounded-[14px] bg-surface-raised p-6">
                <h3 className="text-[16px] font-semibold text-content mb-4">Branding</h3>
                <div className="divide-y divide-surface-border/30">
                  <SettingRow label="Custom domain" value="apply.stitchboat.io" verified />
                  <SettingRow label="DKIM / SPF" value="Verified" verified />
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-body text-content-tertiary">Primary color</span>
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-5 w-5 rounded-[6px] bg-blue-600" />
                      <span className="font-mono text-body text-content-secondary">#1d4ed8</span>
                    </span>
                  </div>
                  <SettingRow label="Agent persona" value="Neha" />
                </div>
              </div>

              {/* Case types card */}
              <div className="card-elevated rounded-[14px] bg-surface-raised p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[16px] font-semibold text-content">Case Types</h3>
                  <span className="text-caption text-content-muted">{CASE_TYPES.length} active</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CASE_TYPES.map((ct) => (
                    <span
                      key={ct}
                      className="rounded-[8px] border border-surface-border bg-surface px-3 py-1.5 text-body text-content-secondary"
                    >
                      {ct}
                    </span>
                  ))}
                </div>
              </div>

              {/* Agent policy card */}
              <div className="card-elevated rounded-[14px] bg-surface-raised p-6">
                <h3 className="text-[16px] font-semibold text-content mb-4">Agent Policy</h3>
                <ul className="space-y-2">
                  <PolicyRow allowed label="Internal drafts allowed" />
                  <PolicyRow allowed label="Client portal nudges allowed" />
                  <PolicyRow allowed={false} label="Outbound email -- human approval required" />
                  <PolicyRow allowed={false} label="Outbound SMS -- human approval required" />
                  <PolicyRow allowed label="Status updates on CRM" />
                  <PolicyRow allowed label="Escalate on deadline < 7d" />
                </ul>
              </div>

              {/* Data & retention card */}
              <div className="card-elevated rounded-[14px] bg-surface-raised p-6">
                <h3 className="text-[16px] font-semibold text-content mb-4">Data & Retention</h3>
                <div className="divide-y divide-surface-border/30">
                  <SettingRow label="Region" value="US-East only" />
                  <SettingRow label="Encryption" value="KMS key active" verified />
                  <SettingRow label="Document retention" value="7 years post-closure" />
                  <SettingRow label="Audit log retention" value="10 years" />
                  <SettingRow label="Right-to-erasure" value="Enabled" verified />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
