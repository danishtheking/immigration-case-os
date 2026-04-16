'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactElement } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  UserPlus,
  FileText,
  Clock,
  Bot,
  CreditCard,
  BarChart3,
  MessageSquare,
  Settings,
  Scale,
  Link2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  disabled?: boolean;
  sprint?: number;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Cases', href: '/dashboard/cases', icon: FolderKanban },
  { label: 'Leads', href: '/dashboard/leads', icon: UserPlus },
  { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare, badge: '4' },
  { label: 'Forms', href: '/dashboard/forms', icon: FileText },
  { label: 'Deadlines', href: '/dashboard/deadlines', icon: Clock },
  { label: 'Agent', href: '/dashboard/agent', icon: Bot },
  { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { label: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
];

const BOTTOM_ITEMS: NavItem[] = [
  { label: 'Admin', href: '/dashboard/admin', icon: Settings },
];

interface SidebarProps {
  orgName?: string;
  orgSlug?: string;
  intakeUrl?: string;
}

export function Sidebar({ orgName = 'StitchBoat Immigration', orgSlug = 'stitchboat', intakeUrl }: SidebarProps): ReactElement {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col border-r border-zinc-200 bg-zinc-950 text-zinc-400 transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo + org */}
      <div className="flex items-center gap-2.5 border-b border-zinc-800 px-4 py-4">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-xs font-black text-white">
          {orgName.slice(0, 2).toUpperCase()}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">{orgName}</div>
            <div className="truncate text-[11px] text-zinc-500">Immigration Case OS</div>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.disabled ? '#' : item.href}
              className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors ${
                active
                  ? 'bg-zinc-800 text-white'
                  : item.disabled
                    ? 'cursor-default text-zinc-600'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
              onClick={item.disabled ? (e) => e.preventDefault() : undefined}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-blue-400' : ''}`} />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.disabled && item.sprint && (
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-600">
                      S{item.sprint}
                    </span>
                  )}
                  {item.badge && (
                    <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Intake link card */}
      {!collapsed && (
        <div className="mx-3 mb-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-300">
            <Link2 className="h-3 w-3" />
            Branded intake
          </div>
          <div className="mt-1 truncate text-[11px] text-zinc-500">
            apply.{orgSlug}.io
          </div>
          <button className="mt-2 w-full rounded-md bg-blue-600 px-2 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-blue-500">
            Copy link
          </button>
        </div>
      )}

      {/* Bottom items */}
      <div className="border-t border-zinc-800 px-2 py-2">
        {BOTTOM_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.disabled ? '#' : item.href}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-300"
              onClick={item.disabled ? (e) => e.preventDefault() : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center border-t border-zinc-800 py-2 text-zinc-600 transition-colors hover:text-zinc-400"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
