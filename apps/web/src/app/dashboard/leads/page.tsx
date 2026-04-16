import type { ReactElement } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { Plus, Clock, Mail, Phone } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  country: string;
  interest: string;
  source: string;
  daysAgo: number;
  score?: number;
}

interface Column {
  title: string;
  color: string;
  leads: Lead[];
}

const COLUMNS: Column[] = [
  {
    title: 'New',
    color: 'bg-brand',
    leads: [
      { id: '1', name: 'Anika Patel', country: 'IND', interest: 'EB-2 NIW', source: 'Intake link', daysAgo: 1, score: 72 },
      { id: '2', name: 'Carlos Mendez', country: 'MEX', interest: 'I-130', source: 'Referral', daysAgo: 2 },
      { id: '3', name: 'Fatima Al-Rashid', country: 'IRQ', interest: 'Asylum', source: 'Intake link', daysAgo: 3 },
    ],
  },
  {
    title: 'Contacted',
    color: 'bg-sky-500',
    leads: [
      { id: '4', name: 'Wei Zhang', country: 'CHN', interest: 'O-1A', source: 'Intake link', daysAgo: 5, score: 68 },
      { id: '5', name: 'Maria Santos', country: 'BRA', interest: 'EB-1A', source: 'Website', daysAgo: 4, score: 81 },
    ],
  },
  {
    title: 'Consultation',
    color: 'bg-blue-500',
    leads: [
      { id: '6', name: 'Oleksiy Kovalenko', country: 'UKR', interest: 'TPS', source: 'Referral', daysAgo: 7 },
    ],
  },
  {
    title: 'Engaged',
    color: 'bg-emerald-500',
    leads: [
      { id: '7', name: 'Yuki Tanaka', country: 'JPN', interest: 'L-1A', source: 'Corporate', daysAgo: 10 },
      { id: '8', name: 'Rahul Desai', country: 'IND', interest: 'H-1B Ext', source: 'Referral', daysAgo: 8 },
    ],
  },
  {
    title: 'Lost',
    color: 'bg-zinc-400',
    leads: [
      { id: '9', name: 'Jin Park', country: 'KOR', interest: 'E-2', source: 'Website', daysAgo: 14 },
    ],
  },
];

function ScoreBadge({ score }: { score: number }): ReactElement {
  const cls = score >= 75
    ? 'badge-success'
    : 'badge-warning';
  return (
    <span className={`${cls} rounded-[8px] px-2 py-0.5 text-[13px] font-bold`}>
      {score}
    </span>
  );
}

function LeadCard({ lead }: { lead: Lead }): ReactElement {
  return (
    <div className="card-elevated rounded-[14px] bg-surface-raised p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[15px] font-semibold text-content">{lead.name}</p>
          <p className="text-caption text-content-tertiary mt-1">
            {lead.country} -- {lead.interest}
          </p>
        </div>
        {lead.score != null && <ScoreBadge score={lead.score} />}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-caption text-content-muted">
          <Clock className="h-3.5 w-3.5" />
          <span>{lead.daysAgo}d ago</span>
          <span className="text-content-muted/40">|</span>
          <span>{lead.source}</span>
        </div>
        <div className="flex gap-1.5">
          <button className="rounded-[8px] p-1.5 text-content-muted hover:bg-surface-sunken hover:text-content-secondary">
            <Mail className="h-4 w-4" />
          </button>
          <button className="rounded-[8px] p-1.5 text-content-muted hover:bg-surface-sunken hover:text-content-secondary">
            <Phone className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LeadsPage(): ReactElement {
  const totalLeads = COLUMNS.reduce((sum, col) => sum + col.leads.length, 0);

  return (
    <>
      <Topbar firstName="Danish" previewMode />
      <main className="flex-1 overflow-hidden bg-surface">
        {/* Page header */}
        <div className="bg-surface-raised px-8 py-7 border-b border-surface-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading">Leads Pipeline</h1>
              <p className="text-caption text-content-tertiary mt-1">
                {totalLeads} leads -- drag cards to update status
              </p>
            </div>
            <button className="flex items-center gap-2 rounded-[10px] bg-brand px-4 py-2.5 text-[14px] font-medium text-white hover:bg-brand/90 transition-colors">
              <Plus className="h-4 w-4" /> Add lead
            </button>
          </div>
        </div>

        {/* Kanban columns */}
        <div className="flex gap-5 overflow-x-auto px-8 py-7" style={{ minHeight: 'calc(100vh - 200px)' }}>
          {COLUMNS.map((col) => (
            <div key={col.title} className="flex w-80 shrink-0 flex-col">
              {/* Column header */}
              <div className="mb-4 flex items-center gap-3">
                <div className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                <span className="text-[15px] font-semibold text-content">{col.title}</span>
                <span className="grid h-6 w-6 place-items-center rounded-full bg-surface-sunken text-[13px] font-bold text-content-tertiary">
                  {col.leads.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 space-y-3">
                {col.leads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}

                <button className="w-full rounded-[14px] border border-dashed border-surface-border py-4 text-caption text-content-muted transition-colors hover:border-brand hover:text-brand">
                  + Add lead
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
