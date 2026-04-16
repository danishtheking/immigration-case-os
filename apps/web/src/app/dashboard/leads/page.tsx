import type { ReactElement } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { Plus, MoreHorizontal, Clock, Mail, Phone } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  country: string;
  interest: string;
  source: string;
  daysAgo: number;
  score?: number;
}

const COLUMNS = [
  {
    title: 'New',
    color: 'bg-zinc-400',
    leads: [
      { id: '1', name: 'Anika Patel', email: 'anika@gmail.com', country: 'IND', interest: 'EB-2 NIW', source: 'Intake link', daysAgo: 1, score: 72 },
      { id: '2', name: 'Carlos Mendez', email: 'carlos.m@outlook.com', country: 'MEX', interest: 'I-130', source: 'Referral', daysAgo: 2 },
      { id: '3', name: 'Fatima Al-Rashid', email: 'fatima.r@yahoo.com', country: 'IRQ', interest: 'Asylum', source: 'Intake link', daysAgo: 3 },
    ] as Lead[],
  },
  {
    title: 'Contacted',
    color: 'bg-sky-400',
    leads: [
      { id: '4', name: 'Wei Zhang', email: 'wzhang@stanford.edu', country: 'CHN', interest: 'O-1A', source: 'Intake link', daysAgo: 5, score: 68 },
      { id: '5', name: 'Maria Santos', email: 'msantos@proton.me', country: 'BRA', interest: 'EB-1A', source: 'Website', daysAgo: 4, score: 81 },
    ] as Lead[],
  },
  {
    title: 'Consultation scheduled',
    color: 'bg-blue-500',
    leads: [
      { id: '6', name: 'Oleksiy Kovalenko', email: 'oleksiy.k@gmail.com', country: 'UKR', interest: 'TPS', source: 'Referral', daysAgo: 7 },
    ] as Lead[],
  },
  {
    title: 'Engaged',
    color: 'bg-emerald-500',
    leads: [
      { id: '7', name: 'Yuki Tanaka', email: 'yuki.t@sony.com', country: 'JPN', interest: 'L-1A', source: 'Corporate', daysAgo: 10 },
      { id: '8', name: 'Rahul Desai', email: 'rahul.d@tcs.com', country: 'IND', interest: 'H-1B Ext', source: 'Referral', daysAgo: 8 },
    ] as Lead[],
  },
  {
    title: 'Lost / Declined',
    color: 'bg-zinc-300',
    leads: [
      { id: '9', name: 'Jin Park', email: 'jin.park@samsung.com', country: 'KOR', interest: 'E-2', source: 'Website', daysAgo: 14 },
    ] as Lead[],
  },
];

export default function LeadsPage(): ReactElement {
  const totalLeads = COLUMNS.reduce((sum, col) => sum + col.leads.length, 0);

  return (
    <>
      <Topbar firstName="Danish" previewMode />
      <main className="flex-1 overflow-hidden">
        <div className="border-b border-surface-border bg-surface-raised px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-content">Leads pipeline</h1>
              <p className="text-[12px] text-content-tertiary">{totalLeads} leads · drag cards between columns to update status</p>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg bg-content px-3 py-2 text-[12px] font-medium text-white hover:bg-content/90">
              <Plus className="h-3.5 w-3.5" /> Add lead
            </button>
          </div>
        </div>

        {/* Kanban board */}
        <div className="flex gap-4 overflow-x-auto p-6" style={{ minHeight: 'calc(100vh - 180px)' }}>
          {COLUMNS.map((col) => (
            <div key={col.title} className="flex w-72 shrink-0 flex-col">
              {/* Column header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${col.color}`} />
                  <span className="text-[13px] font-semibold text-content">{col.title}</span>
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-surface-sunken text-[12px] font-bold text-content-tertiary">
                    {col.leads.length}
                  </span>
                </div>
                <button className="text-content-muted hover:text-content-secondary"><MoreHorizontal className="h-4 w-4" /></button>
              </div>

              {/* Cards */}
              <div className="flex-1 space-y-2">
                {col.leads.map((lead) => (
                  <div key={lead.id} className="rounded-xl border border-surface-border bg-surface-raised p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[13px] font-semibold text-content">{lead.name}</p>
                        <p className="text-[12px] text-content-muted">{lead.country} · {lead.interest}</p>
                      </div>
                      {lead.score && (
                        <span className={`rounded-md px-1.5 py-0.5 text-[12px] font-bold ${lead.score >= 75 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {lead.score}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[12px] text-content-muted">
                        <Clock className="h-3 w-3" />
                        {lead.daysAgo}d ago · {lead.source}
                      </div>
                      <div className="flex gap-1">
                        <button className="rounded-md p-1 text-content-muted hover:bg-surface-sunken hover:text-content-secondary"><Mail className="h-3.5 w-3.5" /></button>
                        <button className="rounded-md p-1 text-content-muted hover:bg-surface-sunken hover:text-content-secondary"><Phone className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add card */}
                <button className="w-full rounded-xl border border-dashed border-surface-border-hover py-3 text-[12px] text-content-muted transition-colors hover:border-zinc-400 hover:text-content-secondary">
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
