'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactElement } from 'react';
import {
  LayoutDashboard, FolderKanban, UserPlus, FileText, Clock,
  Bot, CreditCard, BarChart3, MessageSquare, Settings, Link2,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
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

interface SidebarProps {
  orgName?: string;
  orgSlug?: string;
}

export function Sidebar({ orgName = 'StitchBoat Immigration', orgSlug = 'stitchboat' }: SidebarProps): ReactElement {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`flex flex-col bg-sidebar-bg transition-all duration-200 ${collapsed ? 'w-[60px]' : 'w-[240px]'}`}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-gradient-to-br from-brand to-brand-light text-[13px] font-black text-white shadow-lg shadow-brand/20">
          {orgName.slice(0, 2).toUpperCase()}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold text-white">{orgName}</div>
            <div className="truncate text-[11px] text-sidebar-text">Immigration Case OS</div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-3 h-px bg-sidebar-border" />

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2.5 py-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-[13px] font-medium transition-all ${
                active
                  ? 'bg-brand/15 text-white'
                  : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-brand-light' : 'text-sidebar-text group-hover:text-white'}`} />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Intake card */}
      {!collapsed && (
        <div className="mx-3 mb-3 rounded-[10px] border border-sidebar-border bg-sidebar-hover p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-content-inverse">
            <Link2 className="h-3.5 w-3.5" />
            Branded intake
          </div>
          <div className="mt-1 truncate text-[11px] text-sidebar-text">apply.{orgSlug}.io</div>
          <button className="mt-2.5 w-full rounded-[8px] bg-brand px-2 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-brand/20 transition-all hover:bg-brand-light">
            Copy link
          </button>
        </div>
      )}

      {/* Admin */}
      <div className="border-t border-sidebar-border px-2.5 py-2">
        <Link href="/dashboard/admin" className="flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-[13px] text-sidebar-text transition-colors hover:bg-sidebar-hover hover:text-white">
          <Settings className="h-[18px] w-[18px]" />
          {!collapsed && <span>Admin</span>}
        </Link>
      </div>

      {/* Collapse */}
      <button onClick={() => setCollapsed(!collapsed)} className="flex items-center justify-center border-t border-sidebar-border py-2.5 text-sidebar-text transition-colors hover:text-white">
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
