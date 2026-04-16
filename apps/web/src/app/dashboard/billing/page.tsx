import type { ReactElement } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { DollarSign, TrendingUp, AlertTriangle, CreditCard, Download, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const TRANSACTIONS = [
  { date: 'Apr 14', client: 'Sharma, P.', type: 'Trust deposit', typeColor: 'bg-blue-50 text-blue-700', description: 'Retainer installment 2/3', amount: '+$2,833', fx: 'USD', balance: '$146,200' },
  { date: 'Apr 13', client: 'Osei, A.', type: 'Invoice', typeColor: 'bg-emerald-50 text-emerald-700', description: 'EB-1A preparation · April', amount: '+$5,500', fx: 'USD', balance: '$143,367' },
  { date: 'Apr 12', client: 'Iyer, R.', type: 'Airwallex', typeColor: 'bg-amber-50 text-amber-700', description: 'H-1B retainer', amount: '+₹2,05,000 → $2,460', fx: 'INR→USD', balance: '$137,867' },
  { date: 'Apr 11', client: 'Moreno, L.', type: 'Filed-fee', typeColor: 'bg-rose-50 text-rose-700', description: 'USCIS I-485 filing fee (trust → operating)', amount: '-$1,440', fx: 'USD', balance: '$135,407' },
  { date: 'Apr 10', client: 'Wei, C.', type: 'Trust deposit', typeColor: 'bg-blue-50 text-blue-700', description: 'O-1A initial retainer', amount: '+$6,000', fx: 'USD', balance: '$136,847' },
  { date: 'Apr 09', client: 'Hussein, A.', type: 'Invoice', typeColor: 'bg-emerald-50 text-emerald-700', description: 'Asylum preparation fee', amount: '+$3,200', fx: 'USD', balance: '$130,847' },
  { date: 'Apr 08', client: 'Volkov, D.', type: 'Trust deposit', typeColor: 'bg-blue-50 text-blue-700', description: 'N-400 flat fee', amount: '+$2,500', fx: 'USD', balance: '$127,647' },
];

export default function BillingPage(): ReactElement {
  return (
    <>
      <Topbar firstName="Danish" previewMode />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-content">Trust & Billing</h1>
            <p className="text-[12px] text-content-tertiary">IOLTA-aware ledger · Stripe + Airwallex · installment tracking</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-2 text-[12px] text-content-secondary hover:bg-surface"><Download className="h-3.5 w-3.5" /> Export</button>
            <button className="flex items-center gap-1.5 rounded-lg bg-content px-3 py-2 text-[12px] font-medium text-white hover:bg-content/90"><Plus className="h-3.5 w-3.5" /> New invoice</button>
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-4 grid grid-cols-4 gap-3">
          <BillingCard label="Trust balance" value="$146,200" sub="reconciled Apr 15" icon={<DollarSign className="h-4 w-4" />} />
          <BillingCard label="Open invoices" value="$38,450" sub="12 outstanding" icon={<CreditCard className="h-4 w-4" />} />
          <BillingCard label="Overdue > 30d" value="$4,100" sub="2 clients" icon={<AlertTriangle className="h-4 w-4" />} urgent />
          <BillingCard label="MTD collected" value="$184,220" sub="▲ 12% vs last month" icon={<TrendingUp className="h-4 w-4" />} good />
        </div>

        {/* Transactions table */}
        <div className="mt-5 rounded-xl border border-surface-border bg-surface-raised">
          <div className="flex items-center justify-between border-b border-surface-border/50 px-5 py-4">
            <h2 className="text-[13px] font-semibold text-content">Trust ledger</h2>
            <div className="flex gap-1 text-[12px]">
              <button className="rounded-md bg-content px-2.5 py-1 font-medium text-white">All</button>
              <button className="rounded-md px-2.5 py-1 text-content-tertiary hover:bg-surface-sunken">Deposits</button>
              <button className="rounded-md px-2.5 py-1 text-content-tertiary hover:bg-surface-sunken">Disbursements</button>
              <button className="rounded-md px-2.5 py-1 text-content-tertiary hover:bg-surface-sunken">Invoices</button>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-[12px] font-semibold uppercase tracking-wider text-content-muted">
                <th className="px-5 py-2.5 text-left">Date</th>
                <th className="px-5 py-2.5 text-left">Client</th>
                <th className="px-5 py-2.5 text-left">Type</th>
                <th className="px-5 py-2.5 text-left">Description</th>
                <th className="px-5 py-2.5 text-right">Amount</th>
                <th className="px-5 py-2.5 text-center">FX</th>
                <th className="px-5 py-2.5 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {TRANSACTIONS.map((t, i) => (
                <tr key={i} className="border-t border-surface-border/30 transition-colors hover:bg-surface/50">
                  <td className="px-5 py-3 text-content-tertiary">{t.date}</td>
                  <td className="px-5 py-3 font-medium text-content">{t.client}</td>
                  <td className="px-5 py-3"><span className={`rounded-md px-2 py-0.5 text-[12px] font-semibold ${t.typeColor}`}>{t.type}</span></td>
                  <td className="px-5 py-3 text-content-secondary">{t.description}</td>
                  <td className={`px-5 py-3 text-right font-medium ${t.amount.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                    <span className="inline-flex items-center gap-1">
                      {t.amount.startsWith('+') ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {t.amount}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center text-[12px] text-content-muted">{t.fx}</td>
                  <td className="px-5 py-3 text-right font-medium text-content-secondary">{t.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* IOLTA compliance note */}
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-[12px] text-amber-800">
          <AlertTriangle className="mr-1.5 inline h-3.5 w-3.5" />
          <span className="font-semibold">IOLTA compliance note</span> — Client funds never commingled with operating. Monthly 3-way reconciliation report auto-generated on the 1st. This ledger connects to your trust account — it is not a substitute for a compliant trust accounting system.
        </div>
      </main>
    </>
  );
}

function BillingCard({ label, value, sub, icon, urgent, good }: { label: string; value: string; sub: string; icon: ReactElement; urgent?: boolean; good?: boolean }): ReactElement {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-raised p-4">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-medium text-content-tertiary">{label}</p>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-surface text-content-muted">{icon}</div>
      </div>
      <p className={`mt-2 text-2xl font-bold ${urgent ? 'text-red-600' : 'text-content'}`}>{value}</p>
      <p className={`mt-1 text-[12px] ${good ? 'text-emerald-600' : 'text-content-muted'}`}>{sub}</p>
    </div>
  );
}
