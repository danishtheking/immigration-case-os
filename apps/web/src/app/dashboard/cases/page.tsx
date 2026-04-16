'use client';

import { useState, type ReactElement } from 'react';
import Link from 'next/link';
import { Topbar } from '@/components/layout/topbar';
import {
  Search,
  SlidersHorizontal,
  Download,
  Plus,
  Circle,
  ArrowUpDown,
  ChevronRight,
} from 'lucide-react';

// Demo data — Sprint 2 wires this to the real DB via the NestJS API.
const DEMO_CASES = [
  { id: '1', name: 'Priya Sharma', detail: 'IND · ML Engineer', type: 'EB-2 NIW', typeColor: 'bg-blue-50 text-blue-700', stage: 'Preparation', stageColor: 'text-blue-600', deadline: 'Apr 24', deadlineNote: 'RFE 11d', urgent: true, attorney: 'Danish', score: 84, scoreColor: 'text-emerald-600', docs: 38 },
  { id: '2', name: 'Ramesh Iyer', detail: 'IND · Data Scientist', type: 'H-1B Ext', typeColor: 'bg-violet-50 text-violet-700', stage: 'Attorney review', stageColor: 'text-indigo-600', deadline: 'May 06', deadlineNote: 'Filing', attorney: 'Danish', docs: 12 },
  { id: '3', name: 'Dr. Ama Osei', detail: 'GHA · Researcher', type: 'EB-1A', typeColor: 'bg-cyan-50 text-cyan-700', stage: 'Profile building', stageColor: 'text-cyan-600', deadline: 'Jun 12', deadlineNote: 'Draft I-140', attorney: 'Jess', score: 61, scoreColor: 'text-amber-600', docs: 24 },
  { id: '4', name: 'Lucia Moreno', detail: 'MEX · Spouse of USC', type: 'I-130 + I-485', typeColor: 'bg-rose-50 text-rose-700', stage: 'Filed', stageColor: 'text-emerald-600', deadline: 'Jul 03', deadlineNote: 'Biometrics', attorney: 'Rahul', docs: 19 },
  { id: '5', name: 'Ayaan Hussein', detail: 'SOM · Asylum seeker', type: 'I-589', typeColor: 'bg-orange-50 text-orange-700', stage: 'Intake', stageColor: 'text-zinc-600', deadline: 'Apr 30', deadlineNote: 'Declaration', attorney: 'Danish', docs: 7 },
  { id: '6', name: 'Chen Wei', detail: 'CHN · Postdoc', type: 'O-1A', typeColor: 'bg-teal-50 text-teal-700', stage: 'Preparation', stageColor: 'text-blue-600', deadline: 'May 19', deadlineNote: 'Petition', attorney: 'Jess', score: 77, scoreColor: 'text-emerald-600', docs: 31 },
  { id: '7', name: 'Dmitri Volkov', detail: 'RUS · LPR 4y 9m', type: 'N-400', typeColor: 'bg-emerald-50 text-emerald-700', stage: 'Engaged', stageColor: 'text-sky-600', deadline: 'Aug 01', deadlineNote: 'Early-file window', attorney: 'Rahul', docs: 4 },
  { id: '8', name: 'Ana & Pedro Silva', detail: 'BRA', type: 'I-751 Joint', typeColor: 'bg-pink-50 text-pink-700', stage: 'Attorney review', stageColor: 'text-indigo-600', deadline: 'Apr 26', deadlineNote: '90-day window', urgent: true, attorney: 'Danish', docs: 22 },
];

export default function CasesListPage(): ReactElement {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All types');
  const filtered = DEMO_CASES.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q) || c.detail.toLowerCase().includes(q) || c.attorney.toLowerCase().includes(q);
    const matchesFilter = activeFilter === 'All types' || (activeFilter === 'Active only' && c.stage !== 'Filed') || (activeFilter === 'My caseload' && c.attorney === 'Danish');
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <Topbar firstName="Danish" previewMode />
      <main className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900">Cases</h1>
            <p className="text-[12px] text-zinc-500">{filtered.length} of {DEMO_CASES.length} cases</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[12px] text-zinc-600 hover:bg-zinc-50">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-[12px] font-medium text-white hover:bg-zinc-800">
              <Plus className="h-3.5 w-3.5" /> New case
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cases by name, type, or receipt number..."
              className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-4 text-[13px] placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
            />
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[12px] text-zinc-600 hover:bg-zinc-50">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
          </button>
        </div>

        {/* Filter chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {['All types', 'Active only', 'My caseload'].map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveFilter(chip)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                activeFilter === chip
                  ? 'bg-zinc-900 text-white'
                  : 'border border-zinc-200 text-zinc-500 hover:bg-zinc-50'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="mt-4 rounded-xl border border-zinc-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" className="rounded border-zinc-300" />
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  <button className="flex items-center gap-1">Client <ArrowUpDown className="h-3 w-3" /></button>
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Case type</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Stage</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Next deadline</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Attorney</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Docs</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Score</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {filtered.map((c) => (
                <tr key={c.id} className="group border-b border-zinc-50 transition-colors hover:bg-zinc-50/60">
                  <td className="px-4 py-3"><input type="checkbox" className="rounded border-zinc-300" /></td>
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/cases/${c.id}`} className="block">
                      <div className="font-medium text-zinc-900 group-hover:text-blue-700">{c.name}</div>
                      <div className="text-[11px] text-zinc-400">{c.detail}</div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${c.typeColor}`}>{c.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Circle className={`h-2 w-2 fill-current ${c.stageColor}`} />
                      <span className="text-zinc-600">{c.stage}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${c.urgent ? 'text-red-600' : 'text-zinc-700'}`}>{c.deadline}</span>
                    <span className="ml-1.5 text-[11px] text-zinc-400">{c.deadlineNote}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{c.attorney}</td>
                  <td className="px-4 py-3 text-zinc-500">{c.docs}</td>
                  <td className="px-4 py-3 text-right">
                    {c.score ? (
                      <span className={`text-[14px] font-bold ${c.scoreColor}`}>{c.score}</span>
                    ) : (
                      <span className="text-zinc-300">--</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 opacity-0 group-hover:opacity-100">
                    <ChevronRight className="h-4 w-4" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-center text-[11px] text-zinc-400">
          Preview mode · Demo data · Real cases populate after intake submissions
        </p>
      </main>
    </>
  );
}
