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
    <header className="flex items-center justify-between border-b border-surface-border bg-surface-raised px-6 py-3.5">
      <div>
        <p className="text-micro uppercase tracking-wider">{today}</p>
        <h1 className="text-heading text-content">Good morning, {firstName}</h1>
      </div>

      <div className="flex items-center gap-3">
        {previewMode && (
          <span className="rounded-full border border-warning/30 bg-warning-light px-3 py-1 text-[12px] font-semibold text-warning">
            Preview mode
          </span>
        )}

        <div className="flex items-center gap-1 rounded-[10px] border border-surface-border bg-surface px-3.5 py-2 text-content-tertiary transition-colors hover:border-surface-border-hover">
          <Search className="h-4 w-4" />
          <span className="ml-1 text-[13px]">Search</span>
          <kbd className="ml-6 rounded-[5px] border border-surface-border bg-surface-raised px-1.5 py-0.5 text-[12px] text-content-muted">/</kbd>
        </div>

        <button className="relative rounded-[10px] border border-surface-border p-2.5 text-content-tertiary transition-colors hover:border-surface-border-hover hover:text-content">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-danger text-[9px] font-bold text-white">4</span>
        </button>

        <button className="flex items-center gap-1.5 rounded-[10px] bg-content px-4 py-2.5 text-[13px] font-semibold text-content-inverse shadow-sm transition-all hover:bg-content/90">
          <Plus className="h-4 w-4" />
          New case
        </button>

        <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-light text-[13px] font-bold text-white shadow-sm shadow-brand/20">
          {firstName.charAt(0)}
        </div>
      </div>
    </header>
  );
}
