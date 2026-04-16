'use client';

import { useState, type ReactElement } from 'react';
import Link from 'next/link';
import { Topbar } from '@/components/layout/topbar';
import { Search, Download, Plus, Circle, ChevronRight } from 'lucide-react';

const CASES = [
  { id: '1', name: 'Priya Sharma', detail: 'IND · ML Engineer', type: 'EB-2 NIW', typeColor: 'bg-info-light text-info', stage: 'Preparation', stageColor: 'text-info', deadline: 'Apr 24', deadlineNote: 'RFE 11d', urgent: true, attorney: 'Danish', score: 84, scoreColor: 'text-success', docs: 38 },
  { id: '2', name: 'Ramesh Iyer', detail: 'IND · Data Scientist', type: 'H-1B Ext', typeColor: 'bg-[#f3f0ff] text-[#7c3aed]', stage: 'Attorney review', stageColor: 'text-brand-dark', deadline: 'May 06', deadlineNote: 'Filing', attorney: 'Danish', docs: 12 },
  { id: '3', name: 'Dr. Ama Osei', detail: 'GHA · Researcher', type: 'EB-1A', typeColor: 'bg-[#ecfeff] text-[#0891b2]', stage: 'Profile building', stageColor: 'text-[#0891b2]', deadline: 'Jun 12', deadlineNote: 'Draft I-140', attorney: 'Jess', score: 61, scoreColor: 'text-warning', docs: 24 },
  { id: '4', name: 'Lucia Moreno', detail: 'MEX · Spouse of USC', type: 'I-130 + I-485', typeColor: 'bg-[#fff1f2] text-[#e11d48]', stage: 'Filed', stageColor: 'text-success', deadline: 'Jul 03', deadlineNote: 'Biometrics', attorney: 'Rahul', docs: 19 },
  { id: '5', name: 'Ayaan Hussein', detail: 'SOM · Asylum seeker', type: 'I-589', typeColor: 'bg-warning-light text-warning', stage: 'Intake', stageColor: 'text-content-tertiary', deadline: 'Apr 30', deadlineNote: 'Declaration', attorney: 'Danish', docs: 7 },
  { id: '6', name: 'Chen Wei', detail: 'CHN · Postdoc', type: 'O-1A', typeColor: 'bg-[#ecfeff] text-[#0891b2]', stage: 'Preparation', stageColor: 'text-info', deadline: 'May 19', deadlineNote: 'Petition', attorney: 'Jess', score: 77, scoreColor: 'text-success', docs: 31 },
  { id: '7', name: 'Dmitri Volkov', detail: 'RUS · LPR 4y 9m', type: 'N-400', typeColor: 'bg-success-light text-success', stage: 'Engaged', stageColor: 'text-brand', deadline: 'Aug 01', deadlineNote: 'Early-file window', attorney: 'Rahul', docs: 4 },
  { id: '8', name: 'Ana & Pedro Silva', detail: 'BRA', type: 'I-751 Joint', typeColor: 'bg-[#fdf2f8] text-[#db2777]', stage: 'Attorney review', stageColor: 'text-brand-dark', deadline: 'Apr 26', deadlineNote: '90-day window', urgent: true, attorney: 'Danish', docs: 22 },
];

export default function CasesListPage(): ReactElement {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = CASES.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q) || c.attorney.toLowerCase().includes(q);
    const matchFilter = filter === 'All' || (filter === 'Active' && c.stage !== 'Filed') || (filter === 'Mine' && c.attorney === 'Danish');
    return matchSearch && matchFilter;
  });

  return (
    <>
      <Topbar firstName="Danish" previewMode />
      <main className="flex-1 overflow-y-auto px-8 py-7">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading text-content">Cases</h1>
            <p className="mt-1 text-body">{filtered.length} of {CASES.length} cases</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-[10px] border border-surface-border px-4 py-2.5 text-[13px] font-medium text-content-secondary hover:bg-surface-sunken">
              <Download className="h-4 w-4" /> Export
            </button>
            <button className="flex items-center gap-2 rounded-[10px] bg-content text-content-inverse px-4 py-2.5 text-[13px] font-semibold shadow-sm hover:bg-content/90">
              <Plus className="h-4 w-4" /> New case
            </button>
          </div>
        </div>

        {/* Search + filters — one clean row */}
        <div className="mt-6 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, case type, or attorney..."
              className="w-full rounded-[10px] border border-surface-border bg-surface-raised py-3 pl-11 pr-4 text-[14px] placeholder:text-content-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
            />
          </div>
          {['All', 'Active', 'Mine'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-[10px] px-4 py-2.5 text-[13px] font-medium transition-colors ${
                filter === f ? 'bg-content text-content-inverse' : 'border border-surface-border text-content-tertiary hover:bg-surface-sunken'
              }`}
            >{f === 'Mine' ? 'My caseload' : f === 'Active' ? 'Active only' : 'All cases'}</button>
          ))}
        </div>

        {/* Table — clean, spacious rows */}
        <div className="mt-6 card-elevated overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border bg-surface text-[12px] font-semibold uppercase tracking-wider text-content-tertiary">
                <th className="px-6 py-4 text-left">Client</th>
                <th className="px-6 py-4 text-left">Case type</th>
                <th className="px-6 py-4 text-left">Stage</th>
                <th className="px-6 py-4 text-left">Next deadline</th>
                <th className="px-6 py-4 text-left">Attorney</th>
                <th className="px-6 py-4 text-right">Score</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="group border-b border-surface-border/50 transition-colors hover:bg-surface-sunken/30">
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/cases/${c.id}`}>
                      <p className="text-[14px] font-semibold text-content group-hover:text-brand">{c.name}</p>
                      <p className="mt-0.5 text-caption">{c.detail}</p>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${c.typeColor}`}>{c.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Circle className={`h-2.5 w-2.5 fill-current ${c.stageColor}`} />
                      <span className="text-[14px] text-content-secondary">{c.stage}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[14px] font-medium ${c.urgent ? 'text-danger' : 'text-content'}`}>{c.deadline}</span>
                    <span className="ml-2 text-caption">{c.deadlineNote}</span>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-content-secondary">{c.attorney}</td>
                  <td className="px-6 py-4 text-right">
                    {c.score ? <span className={`text-[16px] font-bold ${c.scoreColor}`}>{c.score}</span> : <span className="text-content-muted">--</span>}
                  </td>
                  <td className="px-6 py-4 text-content-muted opacity-0 group-hover:opacity-100">
                    <ChevronRight className="h-4 w-4" />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-content-tertiary">No cases match your search</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
