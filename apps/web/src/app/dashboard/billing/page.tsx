import type { ReactElement } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { DollarSign, TrendingUp, AlertTriangle, CreditCard, Download, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Transaction {
  date: string;
  client: string;
  type: string;
  description: string;
  amount: string;
  balance: string;
}

const TRANSACTIONS: Transaction[] = [
  { date: 'Apr 14', client: 'Sharma, P.', type: 'Trust deposit', description: 'Retainer installment 2/3', amount: '+$2,833', balance: '$146,200' },
  { date: 'Apr 13', client: 'Osei, A.', type: 'Invoice', description: 'EB-1A preparation', amount: '+$5,500', balance: '$143,367' },
  { date: 'Apr 12', client: 'Iyer, R.', type: 'Airwallex', description: 'H-1B retainer (INR)', amount: '+$2,460', balance: '$137,867' },
  { date: 'Apr 11', client: 'Moreno, L.', type: 'Filing fee', description: 'USCIS I-485 filing', amount: '-$1,440', balance: '$135,407' },
  { date: 'Apr 10', client: 'Wei, C.', type: 'Trust deposit', description: 'O-1A initial retainer', amount: '+$6,000', balance: '$136,847' },
  { date: 'Apr 09', client: 'Hussein, A.', type: 'Invoice', description: 'Asylum preparation', amount: '+$3,200', balance: '$130,847' },
  { date: 'Apr 08', client: 'Volkov, D.', type: 'Trust deposit', description: 'N-400 flat fee', amount: '+$2,500', balance: '$127,647' },
];

function KpiCard({ label, value, sub, icon, variant }: {
  label: string;
  value: string;
  sub: string;
  icon: ReactElement;
  variant?: 'danger' | 'success';
}): ReactElement {
  const valueColor = variant === 'danger'
    ? 'text-red-600'
    : variant === 'success'
      ? 'text-emerald-600'
      : 'text-content';

  return (
    <div className="card-elevated rounded-[14px] bg-surface-raised p-6">
      <div className="flex items-center justify-between">
        <p className="text-caption text-content-tertiary">{label}</p>
        <div className="grid h-9 w-9 place-items-center rounded-[10px] bg-surface-sunken text-content-muted">
          {icon}
        </div>
      </div>
      <p className={`text-[28px] font-bold mt-2 ${valueColor}`}>{value}</p>
      <p className={`text-caption mt-1 ${variant === 'success' ? 'text-emerald-600' : 'text-content-muted'}`}>
        {sub}
      </p>
    </div>
  );
}

export default function BillingPage(): ReactElement {
  return (
    <>
      <Topbar firstName="Danish" previewMode />
      <main className="flex-1 overflow-y-auto bg-surface px-8 py-7">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading">Trust & Billing</h1>
            <p className="text-caption text-content-tertiary mt-1">IOLTA-aware ledger with Stripe and Airwallex</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-[10px] border border-surface-border px-4 py-2.5 text-body text-content-secondary hover:bg-surface-sunken transition-colors">
              <Download className="h-4 w-4" /> Export
            </button>
            <button className="flex items-center gap-2 rounded-[10px] bg-brand px-4 py-2.5 text-body font-medium text-white hover:bg-brand/90 transition-colors">
              <Plus className="h-4 w-4" /> New invoice
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-6 grid grid-cols-4 gap-5">
          <KpiCard label="Trust balance" value="$146,200" sub="Reconciled Apr 15" icon={<DollarSign className="h-4 w-4" />} />
          <KpiCard label="Open invoices" value="$38,450" sub="12 outstanding" icon={<CreditCard className="h-4 w-4" />} />
          <KpiCard label="Overdue > 30d" value="$4,100" sub="2 clients" icon={<AlertTriangle className="h-4 w-4" />} variant="danger" />
          <KpiCard label="MTD collected" value="$184,220" sub="+12% vs last month" icon={<TrendingUp className="h-4 w-4" />} variant="success" />
        </div>

        {/* Trust ledger table */}
        <div className="mt-6 card-elevated rounded-[14px] bg-surface-raised overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-surface-border">
            <h2 className="text-[16px] font-semibold text-content">Trust Ledger</h2>
            <div className="flex gap-1">
              {['All', 'Deposits', 'Disbursements', 'Invoices'].map((tab, i) => (
                <button
                  key={tab}
                  className={`rounded-[8px] px-3 py-1.5 text-body transition-colors ${
                    i === 0
                      ? 'bg-brand text-white font-medium'
                      : 'text-content-tertiary hover:bg-surface-sunken'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="text-micro font-semibold uppercase tracking-wider text-content-muted">
                <th className="px-6 py-3.5 text-left">Date</th>
                <th className="px-6 py-3.5 text-left">Client</th>
                <th className="px-6 py-3.5 text-left">Type</th>
                <th className="px-6 py-3.5 text-left">Description</th>
                <th className="px-6 py-3.5 text-right">Amount</th>
                <th className="px-6 py-3.5 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map((t, i) => {
                const isPositive = t.amount.startsWith('+');
                return (
                  <tr key={i} className="border-t border-surface-border/30 transition-colors hover:bg-surface/50">
                    <td className="px-6 py-4 text-body text-content-tertiary">{t.date}</td>
                    <td className="px-6 py-4 text-body font-medium text-content">{t.client}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-[8px] bg-brand-lighter text-brand px-2.5 py-1 text-caption font-semibold">
                        {t.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-body text-content-secondary">{t.description}</td>
                    <td className={`px-6 py-4 text-right text-body font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                      <span className="inline-flex items-center gap-1">
                        {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                        {t.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-body font-medium text-content-secondary">{t.balance}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* IOLTA compliance note */}
        <div className="mt-5 card-elevated rounded-[14px] bg-amber-50 border border-amber-200 px-6 py-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-body font-semibold text-amber-800">IOLTA Compliance</p>
              <p className="text-caption text-amber-700 mt-1">
                Client funds are never commingled with operating funds. Monthly 3-way reconciliation auto-generated on the 1st.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
