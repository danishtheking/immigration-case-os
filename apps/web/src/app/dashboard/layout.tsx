import type { ReactElement, ReactNode } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function DashboardLayout({ children }: { children: ReactNode }): ReactElement {
  return <DashboardShell>{children}</DashboardShell>;
}
