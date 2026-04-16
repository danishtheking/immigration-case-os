'use client';

import type { ReactElement } from 'react';
import { Bell, Search, Plus } from 'lucide-react';

interface TopbarProps {
  firstName: string;
  previewMode?: boolean;
}

export function Topbar({ firstName, previewMode }: TopbarProps): ReactElement {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">{today}</p>
        <h1 className="text-lg font-semibold text-zinc-900">Good morning, {firstName}</h1>
      </div>

      <div className="flex items-center gap-2">
        {previewMode && (
          <span className="mr-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
            Preview mode
          </span>
        )}

        <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-[13px] text-zinc-500 transition-colors hover:border-zinc-300 hover:bg-zinc-100">
          <Search className="h-3.5 w-3.5" />
          <span>Search</span>
          <kbd className="ml-4 rounded border border-zinc-200 bg-white px-1 text-[10px] text-zinc-400">
            /
          </kbd>
        </button>

        <button className="relative rounded-lg border border-zinc-200 p-2 text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            4
          </span>
        </button>

        <button className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-zinc-800">
          <Plus className="h-3.5 w-3.5" />
          New case
        </button>

        {/* Avatar */}
        <div className="ml-1 grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-xs font-bold text-white">
          {firstName.charAt(0)}
        </div>
      </div>
    </header>
  );
}
